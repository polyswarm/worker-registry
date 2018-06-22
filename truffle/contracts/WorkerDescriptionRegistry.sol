pragma solidity ^0.4.21;

import "zeppelin-solidity/contracts/lifecycle/Pausable.sol";

contract WorkerDescriptionRegistry is Pausable {

  struct WorkerDescription {
      address workerOwner;
      string ipfsURI;
      uint256 index;
      uint256 id;
  }


  mapping (address => uint256) public addressToId;
  mapping (uint256 => WorkerDescription) public idToWorkerDescription;

  uint256[] public ids;

  modifier onlyWorkerDescriptionOwner(uint256 id) {
    require(msg.sender == idToWorkerDescription[id].workerOwner);
    _;
  }

  constructor() {
    // push zero to avoid worker descriptions with zero ids
    ids.push(0);
  }

  /**
  * Adds new worker description
  * @param ipfsURI - SHA2-256 IPFS hash for worker description json
  */

  function addWorkDescription(string ipfsURI) public whenNotPaused {
    require(bytes(ipfsURI).length != 0);
    require(idToWorkerDescription[addressToId[msg.sender]].workerOwner == address(0));

    uint256 id = ids.length;
    uint256 index = ids.push(id) - 1;

    WorkerDescription memory wd = WorkerDescription(msg.sender, ipfsURI, index, index);

    idToWorkerDescription[id] = wd;
    addressToId[msg.sender] = id;
  }

  /**
  * Removes worker description
  * @param id - worker description library
  */

  function removeWorkerDescription(uint256 id) public onlyWorkerDescriptionOwner(id) whenNotPaused {

    uint256 indexToRemove = idToWorkerDescription[id].index;
    uint256 replacementId = ids[ids.length - 1];

    ids[indexToRemove] = replacementId;
    WorkerDescription storage wd = idToWorkerDescription[replacementId];
    wd.index = indexToRemove;

    delete addressToId[msg.sender];
    delete ids[ids.length - 1];

    ids.length--;
}

  /**
  * Update worker description with a new ipfs uri
  * @param ipfsURI - SHA2-256 IPFS hash for worker description json
  */

  function updateWorkerDescription(string ipfsURI, uint256 id) public onlyWorkerDescriptionOwner(id) whenNotPaused {
    require(bytes(ipfsURI).length != 0);

    idToWorkerDescription[id].ipfsURI = ipfsURI;
  }

}
