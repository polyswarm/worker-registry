from setuptools import setup


def parse_requirements():
    with open('requirements.txt', 'r') as f:
        return f.read().splitlines()


setup(
    name='workerregistry',
    version='0.1',
    description='Server for querying the PolySwarm worker registry',
    author='PolySwarm Developers',
    author_email='info@polyswarm.io',
    url='https://github.com/polyswarm/worker-registry',
    license='MIT',
    install_requires=parse_requirements(),
    include_package_data=True,
    packages=['workerregistry'],
    package_dir={
        'workerregistry': 'src/workerregistry',
    },
    entry_points={
        'console_scripts': ['worker-registry=workerregistry.__main__:main'],
    },
)
