// CLI imports
const utils = require("./utils");

// Third Party
const inquirer = require("inquirer");
const chalk = require("chalk");

// ETH imports
const Tx = require("ethereumjs-tx");

class Registry {
  constructor(web3, contractAddress, wallet, keystore, hash) {
    this.web3 = web3;
    this.contractAddress = contractAddress;
    this.wallet = wallet;
    this.keystore = keystore;
    this.hash = hash;

    this.register = this.register.bind(this);
    this.buildTransaction = this.buildTransaction.bind(this);
  }

  static async getAbi(path) {
    if (!await utils.existsAsync(path)) {
      console.error(`${chalk.red("ERROR:")} Contract does not exist.`);
      process.exit(11);
    }

    const contents = await utils.readFileAsync(path);
    return JSON.parse(contents).abi;
  }

  static async getPassword(wallet) {
    const pw = {
      type: "password",
      name: "password",
      message: `Enter password for ${wallet}`
    };
    const response = await inquirer.prompt(pw);
    return response.password;
  }

  static async signTransaction(rawTx, wallet, password, keystore) {
    const tx = new Tx(rawTx);
    let spinner = utils.getSpinner("Signing transaction.");
    spinner.start();
    try {
      const keyObj = await utils.loadKeyFile(wallet, keystore);
      const key = await utils.decryptKey(password, keyObj);
      tx.sign(key);
      spinner.stop();
    } catch(error) {
      spinner.stop();
      console.error(`${chalk.red("ERROR:")} ${error}`);
      process.exit(11);
    }
    return tx;
  }

  async buildTransaction(update) {
    const contract = "./src/data/WorkerDescriptionRegistry.json";

    const abi = await Registry.getAbi(contract);

    const registry = new this.web3.eth.Contract(abi, this.contractAddress);
    let input;
    if (update) {
      const id = await registry.methods.addressToId(this.wallet).call();
      input = registry.methods.updateWorkerDescription(this.hash, id).encodeABI();
    } else {
      input = registry.methods.addWorkerDescription(this.hash).encodeABI();
    }

    const gasPrice = this.web3.utils.toWei('3', 'gwei');
    const nonce = await this.web3.eth.getTransactionCount(this.wallet);

    let gasLimit = 0;
    try {
      gasLimit = await this.web3.eth.estimateGas({
        to: this.contractAddress,
        from: this.wallet,
        data: input,
        value: 0x0,
        gasPrice: this.web3.utils.numberToHex(gasPrice)
      });
    } catch (error) {
      console.error(`${chalk.red("ERROR:")} Transaction cannot succeed. If you have already registered a worker with this address try again with --update`);
      process.exit(11);
    }

    return {
      to: this.contractAddress,
      from: this.wallet,
      data: input,
      value: 0x0,
      nonce: nonce,
      gas: this.web3.utils.numberToHex(gasLimit),
      gasPrice: this.web3.utils.numberToHex(gasPrice)
    };
  }

  async register(update=false) {
    const rawTx = await this.buildTransaction(update);

    // Request User password
    const password = await Registry.getPassword(this.wallet);

    // Open key file & sign transaction
    const signed = await Registry.signTransaction(rawTx, this.wallet, password, this.keystore);

    // Send transaction on the chain
    const serializedTx = signed.serialize();
    const spinner = utils.getSpinner("Posting transaction.");
    spinner.start();
    try {
      const receipt = await this.web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));
      spinner.stop();
      return receipt;
    } catch (error) {
      spinner.stop();
      console.error(`${chalk.red("ERROR:")} ${error}`);
    }
  }
}
module.exports = Registry;
