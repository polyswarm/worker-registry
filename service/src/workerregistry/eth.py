import json
import os

from cached_property import cached_property
from web3 import Web3, HTTPProvider
from web3.middleware import geth_poa_middleware
from workerregistry.utils import whereami


class Eth(object):
    def __init__(self, eth_uri):
        self.eth_uri = eth_uri
        self.contracts = {}

    @cached_property
    def web3(self):
        w3 = Web3(HTTPProvider(self.eth_uri))
        w3.middleware_stack.inject(geth_poa_middleware, layer=0)
        return w3

    def contract(self, name, address=None):
        if name not in self.contracts:
            if not address:
                return None

            address = self.web3.toChecksumAddress(address)
            artifact = os.path.join(whereami(), 'data', name + '.json')
            with open(artifact, 'r') as f:
                abi = json.load(f)['abi']

            self.contracts[name] = self.web3.eth.contract(address=address, abi=abi)

        return self.contracts[name]
