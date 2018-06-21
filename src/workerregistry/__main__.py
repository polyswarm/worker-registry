from gevent import pywsgi

from workerregistry import app


def main():
    server = pywsgi.WSGIServer(('', 8000), app)
    server.serve_forever()


if __name__ == '__main__':
    main()
