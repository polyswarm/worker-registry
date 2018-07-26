#! /usr/bin/env node

// Project import
const Questions = require("./questions");

// Third Parth
const chalk = require("chalk");
const figlet = require("figlet");
const fs = require("fs");
const IpfsApi = require("ipfs-api");
const multihashes = require("multihashes");
const Validator = require("jsonschema").Validator;
const yargs = require("yargs");

// Ethereum
const Web3 = require("web3");

const checkFile = (argv) => {
  if (!argv["filename"]) {
    console.error(`${chalk.red('ERROR:')} No file specified.`);
    process.exit(1);
  }
}

const existsAsync = async (filename) => {
  return await new Promise(resolve => {
    fs.exists(filename, exists => {
      resolve(exists)
    });
  });
}

const isValidIpfsHash = (hash) => {
  const toVerify = multihashes.fromB58String(hash);
  try {
    multihashes.validate(toVerify);
    return true;
  } catch (error) {
    return false;
  }
}

const readFileAsync = async (filename) => {
  return await new Promise((resolve, reject) => {
    fs.readFile(filename, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
}

const validateAsync = async (filename) => {
  let result = null;
  try {
    const contents = await readFileAsync(filename);
    const schema = await readFileAsync("./schema.json");

    const validator = new Validator();
    result = await validator.validate(JSON.parse(contents), JSON.parse(schema));
  } catch(error) {
    console.error(`${chalk.red('ERROR:')} ${error}`);
    process.exit(1);
  }
  return result;
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

  const filename = argv["filename"];

  if (! await existsAsync(filename)) {
    console.error(`${chalk.red('ERROR:')} ${filename} does not exist`);
    process.exit(1);
  }

  const validationResult = await validateAsync(filename);
  if (! validationResult.valid) {
    console.error(`${chalk.red('ERROR:')} ${filename} does not follow the PolySwarm WDL schema.`);
    console.error(validationResult.errors)
    process.exit(1);
  }

  console.log(argv["eth-uri"]);
  const web3 = new Web3(new Web3.providers.HttpProvider(argv["eth-uri"]));

  const ipfs = IpfsApi({host: "ipfs.infura.io", port: 5001, protocol: "https"});

  ipfs.util.addFromFs(argv["filename"], (err, result) => {
    if (err) {
      throw err;
    }

    const hash = result[0]["hash"];

    if (isValidIpfsHash(hash)) {
      console.log(hash);
    } else {
      console.error(`${chalk.red('ERROR:')} Invalid IPFS hash: ${hash}`);
      process.exit(10);
    }
  });
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
    .command("upload [filename]", "upload a worker description", (yargs) => {
      yargs
        .positional("filename", {
          description: "worker description json to upload",
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
