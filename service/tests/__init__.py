import pytest
import workerregistry

@pytest.fixture
def client():
    app = workerregistry.create_app()
    app.config['TESTING'] = True
    client = app.test_client()
    yield client
