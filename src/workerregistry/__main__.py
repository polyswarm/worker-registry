import click
import workerregistry

from gevent import pywsgi
from workerregistry import create_app

@click.command()
@click.argument('--ipfs-uri', envvar='IPFS_URI', default=workerregistry.DEFAULT_IPFS_URI)
@click.argument('--eth-uri', envvar='ETH_URI', default=workerregistry.DEFAULT_ETH_URI)
@click.argument('--size-limit', envvar='SIZE_LIMIT', default=workerregistry.DEFAULT_SIZE_LIMIT)
@click.argument('--registry-address', envvar='REGISTRY_ADDRESS', default=workerregistry.DEFAULT_REGISTRY_ADDRESS)
def main(ipfs_uri, eth_uri, size_limit, registry_address):
    app = create_app(ipfs_uri, eth_uri, size_limit, registry_address)
    server = pywsgi.WSGIServer(('', 8000), app)
    server.serve_forever()


if __name__ == '__main__':
    main()
