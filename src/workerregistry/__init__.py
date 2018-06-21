import base58
import datetime
import json
import jsonschema
import os
import requests
import sys

from flask import Flask, jsonify, request
from web3.auto import w3 as web3
from werkzeug.exceptions import default_exceptions, HTTPException, BadRequest
from werkzeug.routing import BaseConverter, ValidationError

IPFS_URI = 'http://localhost:5001'
SIZE_LIMIT = 10 * 1024 * 1024

# For testing purposes, until other components are ready
IPFS_HASH = 'QmaQr2GoGZ4N15uwANCW9fXe5tP8ZV6KER4H2g9Cgeg6ry'

with open(os.path.join(os.path.dirname(os.path.realpath(__file__)), 'schema.json'), 'r') as f:
    SCHEMA = json.load(f)


def is_valid_ipfs_hash(ipfs_hash):
    # TODO: Further multihash validation
    try:
        return len(ipfs_hash) < 100 and base58.b58decode(ipfs_hash)
    except:
        pass

    return False


def install_error_handlers(app):
    def make_json_error(e):
        response = jsonify(message=str(e))
        response.status_code = e.code if isinstance(e, HTTPException) else 500
        return response

    for code in default_exceptions:
        app.register_error_handler(code, make_json_error)


class AddressConverter(BaseConverter):
    def to_python(self, value):
        if not web3.isAddress(value):
            raise ValidationError()

        return web3.toChecksumAddress(value)


app = Flask('workerregistry')
install_error_handlers(app)
app.url_map.converters['address'] = AddressConverter


def ipfs_hash_for_developer(address):
    return IPFS_HASH


def retrieve_from_ipfs(ipfs_hash, size_limit=SIZE_LIMIT):
    r = requests.get(
        IPFS_URI + '/api/v0/object/stat', params={'arg': ipfs_hash}, timeout=1)
    r.raise_for_status()

    size = r.json()['DataSize']
    if size > size_limit:
        raise BadRequest('ipfs resource too large')

    r = requests.get(
        IPFS_URI + '/api/v0/cat', params={'arg': ipfs_hash}, timeout=1)
    r.raise_for_status()

    return r.content.decode('utf-8')


def validate_schema(j):
    jsonschema.validate(json.loads(j), SCHEMA)


@app.before_request
def before_request():
    print(
        datetime.datetime.now(), request.method, request.path, file=sys.stderr)


@app.route('/<address:address>')
def get_address(address):
    ipfs_hash = ipfs_hash_for_developer(address)
    if not is_valid_ipfs_hash(ipfs_hash):
        raise BadRequest('invalid ipfs hash for developer')

    j = retrieve_from_ipfs(ipfs_hash)

    validate_schema(j)

    return j
