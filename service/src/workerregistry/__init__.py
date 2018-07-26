import base58
import datetime
import json
import jsonschema
import os
import requests
import sys

from flask import Blueprint, Flask, current_app, jsonify, request
from werkzeug.exceptions import default_exceptions, HTTPException, BadRequest, NotFound
from werkzeug.routing import BaseConverter, ValidationError
from workerregistry.eth import Eth
from workerregistry.utils import whereami

DEFAULT_IPFS_URI = 'http://localhost:5001'
DEFAULT_ETH_URI = 'http://localhost:8545'
DEFAULT_SIZE_LIMIT = 10 * 1024 * 1024
DEFAULT_REGISTRY_ADDRESS = '0x0000000000000000000000000000000000000000'

eth = None
root = Blueprint('root', __name__)

with open(os.path.join(whereami(), 'data', 'schema.json'), 'r') as f:
    SCHEMA = json.load(f)


def install_error_handlers(app):
    def make_json_error(e):
        response = jsonify(message=str(e))
        response.status_code = e.code if isinstance(e, HTTPException) else 500
        return response

    for code in default_exceptions:
        app.register_error_handler(code, make_json_error)


class AddressConverter(BaseConverter):
    def to_python(self, value):
        if not eth.web3.isAddress(value):
            raise ValidationError()

        return eth.web3.toChecksumAddress(value)


def create_app(ipfs_uri=DEFAULT_IPFS_URI,
               eth_uri=DEFAULT_ETH_URI,
               size_limit=DEFAULT_SIZE_LIMIT,
               registry_address=DEFAULT_REGISTRY_ADDRESS):
    app = Flask('workerregistry')

    app.config['IPFS_URI'] = ipfs_uri
    app.config['ETH_URI'] = eth_uri
    app.config['SIZE_LIMIT'] = size_limit
    app.config['REGISTRY_ADDRESS'] = registry_address

    install_error_handlers(app)
    app.url_map.converters['address'] = AddressConverter
    app.register_blueprint(root)

    global eth
    eth = Eth(app.config['ETH_URI'])
    eth.contract('WorkerDescriptionRegistry', app.config['REGISTRY_ADDRESS'])

    return app


def is_valid_ipfs_hash(ipfs_hash):
    # TODO: Further multihash validation
    try:
        return len(ipfs_hash) < 100 and base58.b58decode(ipfs_hash)
    except:
        pass

    return False


def ipfs_hash_for_developer(address):
    registry = eth.contract('WorkerDescriptionRegistry')
    id_ = registry.functions.addressToId(address).call()
    desc = registry.functions.idToWorkerDescription(id_).call()
    return desc[1]


def retrieve_from_ipfs(ipfs_hash, size_limit=None):
    if not size_limit:
        size_limit = current_app.config['SIZE_LIMIT']

    r = requests.get(
        current_app.config['IPFS_URI'] + '/api/v0/object/stat',
        params={'arg': ipfs_hash},
        timeout=1)
    r.raise_for_status()

    size = r.json()['DataSize']
    if size > size_limit:
        raise BadRequest('ipfs resource too large')

    r = requests.get(
        current_app.config['IPFS_URI'] + '/api/v0/cat',
        params={'arg': ipfs_hash},
        timeout=1)
    r.raise_for_status()

    return r.content.decode('utf-8')


def validate_schema(j):
    jsonschema.validate(json.loads(j), SCHEMA)


@root.before_request
def before_request():
    print(
        datetime.datetime.now(), request.method, request.path, file=sys.stderr)


@root.route('/<address:address>')
def get_address(address):
    ipfs_hash = ipfs_hash_for_developer(address)
    if not ipfs_hash:
        raise NotFound('ipfs hash not found for developer')
    elif not is_valid_ipfs_hash(ipfs_hash):
        raise BadRequest('invalid ipfs hash for developer')

    j = retrieve_from_ipfs(ipfs_hash)

    validate_schema(j)

    return j
