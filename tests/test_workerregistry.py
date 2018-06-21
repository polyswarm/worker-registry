import io
import os
import requests_mock

from workerregistry import IPFS_URI
from tests import client

with open(os.path.join(os.path.dirname(os.path.realpath(__file__)), 'test.json'), 'r') as f:
    VALID_JSON = f.read()


def setup_mocks(mock):
    mock.get(
        IPFS_URI +
        '/api/v0/cat?arg=QmaQr2GoGZ4N15uwANCW9fXe5tP8ZV6KER4H2g9Cgeg6ry',
        text=VALID_JSON)
    mock.get(
        IPFS_URI +
        '/api/v0/object/stat?arg=QmaQr2GoGZ4N15uwANCW9fXe5tP8ZV6KER4H2g9Cgeg6ry',
        text=
        '{"Hash":"QmaQr2GoGZ4N15uwANCW9fXe5tP8ZV6KER4H2g9Cgeg6ry","NumLinks":0,"BlockSize":361,"LinksSize":3,"DataSize":358,"CumulativeSize":361}'
    )


def test_get_json(client):
    expected = VALID_JSON.encode('utf-8')
    with requests_mock.Mocker() as mock:
        setup_mocks(mock)
        rv = client.get('/0x0000000000000000000000000000000000000000')
        assert rv.data == expected
