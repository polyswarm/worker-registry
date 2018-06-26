import io
import os
import requests_mock
import workerregistry

from mock import patch
from workerregistry.utils import whereami
from tests import client

with open(os.path.join(whereami(), 'data', 'demo-pass.json'), 'r') as f:
    VALID_JSON = f.read()

with open(os.path.join(whereami(), 'data', 'demo-fail.json'), 'r') as f:
    INVALID_JSON = f.read()


def setup_mocks(mock):
    mock.get(
        'http://localhost:5001/api/v0/cat?arg=QmaQr2GoGZ4N15uwANCW9fXe5tP8ZV6KER4H2g9Cgeg6ry',
        text=VALID_JSON)
    mock.get(
        'http://localhost:5001/api/v0/object/stat?arg=QmaQr2GoGZ4N15uwANCW9fXe5tP8ZV6KER4H2g9Cgeg6ry',
        text=
        '{"Hash":"QmaQr2GoGZ4N15uwANCW9fXe5tP8ZV6KER4H2g9Cgeg6ry","NumLinks":0,"BlockSize":361,"LinksSize":3,"DataSize":358,"CumulativeSize":361}'
    )


def test_get_json(client):
    expected = VALID_JSON.encode('utf-8')
    with requests_mock.Mocker() as mock:
        setup_mocks(mock)
        with patch('workerregistry.ipfs_hash_for_developer') as mock_ipfs_hash_for_developer:
            mock_ipfs_hash_for_developer.return_value = 'QmaQr2GoGZ4N15uwANCW9fXe5tP8ZV6KER4H2g9Cgeg6ry'

            rv = client.get('/0x0000000000000000000000000000000000000000')
            assert rv.data == expected
