#! /usr/bin/env node

// Project import
const Questions = require("./questions");
const Upload = require("./upload");
const Registry = require("./registry");
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

const checkArgs = argv => {
  if (!argv["wallet-address"]) {
    console.error(`${chalk.red('ERROR:')} No wallet address specified.`);
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

  if (!argv["keystore"]) {
    console.error(`${chalk.red('ERROR:')} No keystore specified.`);
    process.exit(1);
  }

  if (!argv["hash"]) {
    console.error(`${chalk.red('ERROR:')} No keystore specified.`);
    process.exit(1);
  }
};

const checkFile = argv => {
  if (!argv["filename"]) {
    console.error(`${chalk.red('ERROR:')} No file specified.`);
    process.exit(1);
  }
};

const generate = async argv => {
  checkFile(argv);

  console.log(chalk.rgb(133, 0, 255)(figlet.textSync("PolySwarm Registry Builder")));

  const questions = new Questions();
  const result = await questions.ask();
  const filename = argv["filename"];
  if (result) {
    fs.writeFile(filename, JSON.stringify(result, null, 2), "utf-8", err => {
      if (err) {
        console.error(`${chalk.red(">>")} Failed to write to ${filename}`);
        console.log(JSON.stringify(result, null, 2));
      }
      const message = `Successfully wrote entry to "${filename}".`;
      console.info(`${chalk.blue("!")} ${chalk.bold(message)}`);
    });
  }
}

const upload = async argv => {
  checkFile(argv);

  const filename = argv["filename"];

  const upload = new Upload(filename, "./src/data/schema.json");
  try {
    const validatedHash = await upload.upload();
    console.log(validatedHash);
  } catch(error) {
    console.error(error);
    process.exit(10);
  }
}

const register = async argv => {
  checkArgs(argv);
  const hash = argv["hash"];
  const update = argv["update"] || false;
  const contractAddress = argv["contract"];
  const wallet = argv["wallet-address"];
  const keystore = argv["keystore"];
  const eth = argv["eth-uri"];

  if (!utils.isValidIpfsHash(hash)) {
    console.error(`${chalk.red('ERROR:')} Invalid IPFS hash: ${hash}`);
  }

  console.log(eth);
  const web3 = new Web3(new Web3.providers.HttpProvider(eth));

  const registry = new Registry(web3, contractAddress, wallet, keystore, hash);
  const receipt = await registry.register(update);
  if (receipt) {
    console.log(`Transaction Receipt: ${receipt.transactionHash}`);
  }
};

const main = async () => {
  yargs
    .command("generate [filename]", "interactively generate a worker description", yargs => {
      yargs
      .positional("filename", {
        description: "output filename",
      });
    }, generate)
    .command("upload [filename]", "upload a worker description", yargs => {
      yargs.positional("filename", {
          description: "worker description json to upload",
        });
    }, upload)
    .command("register [hash] [wallet-address]", "Register your worker description on Ethereum", yargs => {
      yargs
      .positional("hash", {
        description: "IPFS hash of the worker description.",
      })
      .positional("wallet-address", {
        description: "Wallet address to send transaction from.",
      })
      .option("update", {
        description: "Update the current worker description for this address",
        default: false
      })
      .option("keystore", {
        description: "Directory containing the 'keystore/' directory.",
        default: `/home/${require("os").userInfo().username}/.ethereum/`
      })
      .option("contract", {
        description: "Deployed address for the WorkerDescriptionRegistry contract",
        default: "0xdcc020150e8a383b4f1a5668301254bc7aeb3633",
      })
      .option("eth-uri", {
        description: "URI for Ethereum client's RPC interface",
        default: "http://localhost:8545",
      });
    }, register)
    .help()
    .argv;
};

main();
