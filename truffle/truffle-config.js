require('babel-register');
require('babel-polyfill');

module.exports = {
  networks: {
    development: {
      host: '0.0.0.0',
      port: 8545,
      network_id: '*',
      gas: 5500000,
    },
    rinkeby: {
      host: 'localhost',
      port: 8545,
      network_id: '4',
      gas: 5500000,
    },
    mainnet: {
      host: 'localhost',
      port: 8545,
      network_id: '1',
      gas: 5500000,
    },
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
};
