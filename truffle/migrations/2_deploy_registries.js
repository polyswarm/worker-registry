const WorkerDescriptionRegistry = artifacts.require('WorkerDescriptionRegistry');

module.exports = function(deployer, network, accounts) {
    return deployer.deploy(WorkerDescriptionRegistry);
  };
