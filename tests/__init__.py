import pytest
import workerregistry

@pytest.fixture
def client():
    workerregistry.app.config['TESTING'] = True
    client = workerregistry.app.test_client()
    yield client
