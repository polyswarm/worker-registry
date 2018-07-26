#! /usr/bin/env node

// Project import
const Questions = require("./questions");
const Upload = require("./upload");

// Third Parth
const chalk = require("chalk");
const figlet = require("figlet");
const fs = require("fs");

const yargs = require("yargs");

// Ethereum
const Web3 = require("web3");

const checkFile = (argv) => {
  if (!argv["filename"]) {
    console.error(`${chalk.red('ERROR:')} No file specified.`);
    process.exit(1);
  }
}

const register = (hash) => {

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

  console.log(argv["eth-uri"]);
  const web3 = new Web3(new Web3.providers.HttpProvider(argv["eth-uri"]));

  const upload = new Upload(filename, "./src/data/schema.json");
  try {
    const validatedHash = await upload.upload();
    register(validatedHash);
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
