#! /usr/bin/env node

const chalk = require("chalk");
const figlet = require("figlet");
const fs = require("fs");
const IpfsApi = require("ipfs-api");
const Questions = require("./questions");
const yargs = require("yargs");
const Web3 = require("web3");

const checkFile = (argv) => {
  if (!argv["filename"]) {
    console.error('No file specified.');
    process.exit(1);
  }
}

const generate = async (argv) => {
  checkFile(argv);

  console.log(chalk.rgb(133, 0, 255)(figlet.textSync("PolySwarm Registry Builder")));

  const questions = new Questions();
  const result = await questions.ask();
  if (result) {
    fs.writeFile(argv["filename"], JSON.stringify(result, null, 2), "utf-8", (err) => {
      if (err) {
        console.error(`${chalk.red(">>")} Failed to write to ${entryOutput}`);
        console.log(JSON.stringify(result, null, 2));
      }
      const message = `Successfully wrote entry to "${entryOutput}".`;
      console.info(`${chalk.blue("!")} ${chalk.bold(message)}`);
    });
  }
}

const upload = async (argv) => {
  checkFile(argv);

  console.log(argv["eth-uri"]);
  const web3 = new Web3(new Web3.providers.HttpProvider(argv["eth-uri"]));

  const ipfs = IpfsApi({host: "ipfs.infura.io", port: 5001, protocol: "https"});

  // TODO: Verify that filename is a regular readable file, and is valid json
  // according to spec
  ipfs.util.addFromFs(argv["filename"], (err, result) => {
    if (err) {
      throw err;
    }

    console.log(result[0]["hash"]);
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
