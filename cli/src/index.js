#! /usr/bin/env node

// Project import
const Questions = require("./questions");
const Upload = require("./upload");
const utils = require("./utils");

// Third Party
const chalk = require("chalk");
const figlet = require("figlet");
const fs = require("fs");
const inquirer = require("inquirer");
const yargs = require("yargs");

// Ethereum
const Web3 = require("web3");
const Tx = require("ethereumjs-tx");
const keythereum = require("keythereum");

const checkFile = (argv) => {
  if (!argv["filename"]) {
    console.error(`${chalk.red('ERROR:')} No file specified.`);
    process.exit(1);
  }
};

const checkArgs = (argv) => {
  if (!argv["wallet"]) {
    console.error(`${chalk.red('ERROR:')} No wallet specified.`);
    process.exit(1);
  }

  if (!argv["eth-uri"]) {
    console.error(`${chalk.red('ERROR:')} No eth uri specified.`);
    process.exit(1);
  }

  if (!argv["contract"]) {
    console.error(`${chalk.red('ERROR:')} No contract specified.`);
    process.exit(1);
  }
};

const loadKeyFile = async (address, keydir) => {
  return await new Promise((resolve, reject) => {
    const data = keythereum.importFromFile(address, keydir);
    if (data instanceof Error) {
      reject(data);
    } else {
      resolve(data);
    }
  });
}

const decryptKey = async (password, keyFile) => {
  return await new Promise((resolve, reject) => {
    keythereum.recover(password, keyFile, (key) => {
      if (key instanceof Error) {
        reject(key);
      } else {
        resolve(key);
      }
    });
  });
}

const register = async (web3, contractAddress, wallet, keystore, hash) => {
  const contract = "./src/data/WorkerDescriptionRegistry.json";

  if (!await utils.existsAsync(contract)) {
    console.error(`${chalk.red("ERROR:")} Contract does not exist.`);
  }

  const contents = await utils.readFileAsync(contract);
  const abi = JSON.parse(contents).abi;

  const registry = new web3.eth.Contract(abi, contractAddress);
  const input = registry.methods.addWorkDescription(hash).encodeABI();

  const gasLimit = await web3.eth.estimateGas({
    to: contractAddress,
    from: wallet,
    data: input,
    value: 0x0,
    gasPrice: web3.utils.numberToHex(web3.utils.toWei('3', 'gwei'))
  });

  const nonce = await web3.eth.getTransactionCount(wallet);

  const rawTx = {
    to: contractAddress,
    from: wallet,
    data: input,
    value: 0x0,
    nonce: nonce,
    gas: web3.utils.numberToHex(gasLimit),
    gasPrice: web3.utils.numberToHex(web3.utils.toWei('3', 'gwei'))
  };

  // Request User password
  const pw = {
    type: "password",
    name: "password",
    message: `Enter password for ${wallet}`
  };
  const response = await inquirer.prompt(pw);

  // Open key file & sign transaction
  const tx = new Tx(rawTx);
  let spinner = utils.getSpinner("Signing transaction.");
  spinner.start();
  try {
    const keyObj = await loadKeyFile(wallet, keystore);
    const key = await decryptKey(response.password, keyObj);
    tx.sign(key);
    spinner.stop();
  } catch(error) {
    spinner.stop();
    console.error(`${chalk.red("ERROR:")} ${error}`);
    process.exit(11);
  }

  // Send transaction on the chain
  const serializedTx = tx.serialize();
  spinner = utils.getSpinner("Posting transaction.");
  spinner.start();
  try {
    const receipt = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));
    spinner.stop();
    return receipt;
  } catch (error) {
    spinner.stop();
    console.error(`${chalk.red("ERROR:")} ${error}`);
  }
}

const generate = async (argv) => {
  checkFile(argv);

  console.log(chalk.rgb(133, 0, 255)(figlet.textSync("PolySwarm Registry Builder")));

  const questions = new Questions();
  const result = await questions.ask();
  const filename = argv["filename"]
  if (result) {
    fs.writeFile(filename, JSON.stringify(result, null, 2), "utf-8", (err) => {
      if (err) {
        console.error(`${chalk.red(">>")} Failed to write to ${filename}`);
        console.log(JSON.stringify(result, null, 2));
      }
      const message = `Successfully wrote entry to "${filename}".`;
      console.info(`${chalk.blue("!")} ${chalk.bold(message)}`);
    });
  }
}

const upload = async (argv) => {
  checkFile(argv);
  checkArgs(argv);

  const filename = argv["filename"];
  const contractAddress = argv["contract"];
  const wallet = argv["wallet"];
  const keystore = argv["keystore"];

  console.log(argv["eth-uri"]);
  const web3 = new Web3(new Web3.providers.HttpProvider(argv["eth-uri"]));

  const upload = new Upload(filename, "./src/data/schema.json");
  try {
    const validatedHash = await upload.upload();
    console.log(validatedHash);
    const receipt = await register(web3, contractAddress, wallet, keystore, validatedHash);
    console.log(receipt);
  } catch(error) {
    console.error(error);
    process.exit(10);
  }
}

const main = async () => {
  const argv = yargs
    .command(["generate [filename]"], "interactively generate a worker description", (yargs) => {
      yargs
      .positional("filename", {
        description: "output filename",
      });
    }, (argv) => {
      generate(argv);
    })
    .command("upload [filename] [wallet] [keystore]", "upload a worker description", (yargs) => {
      yargs
        .positional("filename", {
          description: "worker description json to upload",
        })
        .positional("wallet", {
          description: "Wallet address to send transaction from.",
        })
        .positional("keystore", {
          description: "Directory containing the 'keystore/' directory.",
        })
        .option("contract", {
          descrption: "Deployed address for the WorkerDescriptionRegistry contract",
          default: "0x00000000000000000000000000000",
        })
        .option("eth-uri", {
          descrption: "URI for Ethereum client's RPC interface",
          default: "http://localhost:8545",
        });
    }, (argv) => {
      upload(argv);
    })
    .help()
    .argv;
};

main();
