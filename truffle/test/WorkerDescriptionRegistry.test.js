
import ether from './helpers/ether';
import advanceToBlock, { advanceBlock } from './helpers/advanceToBlock';
import EVMRevert from './helpers/EVMRevert';
import utils from 'ethereumjs-util';
import BN from 'bn.js';
import bs58 from 'bs58';

const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const WorkerDescriptionRegistry = artifacts.require('WorkerDescriptionRegistry');
let wdr;
const ipfsHash = 'QmfQ5QAjvg4GtA3wg3adpnDJug8ktA1BxurVqBD8rtgVjM';

contract('WorkerDescriptionRegistry', function ([owner]) {
  describe('Worker Description Registry functions', function() {
    before(async () => {
      wdr = await WorkerDescriptionRegistry.new();
    })

    it('should allow users to add a worker description', async function() {
        await wdr.addWorkDescription(ipfsHash);
        let wdlID = await wdr.addressToId.call(owner);
        let wd = await wdr.idToWorkerDescription.call(wdlID);

        assert.equal(wd[1], ipfsHash);
    });

    it('should allow users to remove a worker description', async function() {
      let wdlID = await wdr.addressToId.call(owner);

      await wdr.removeWorkerDescription(wdlID.toNumber());

      wdlID = await wdr.addressToId.call(owner);

      assert.equal(0, wdlID.toNumber());
    });

    it('should allow users to update a worker description', async function() {
      await wdr.addWorkDescription(ipfsHash);

      let wdlID = await wdr.addressToId.call(owner);

      await wdr.updateWorkerDescription('Qmb4atcgbbN5v4CDJ8nz5QG5L2pgwSTLd3raDrnyhLjnUH', wdlID.toNumber());
    });
  });
});
