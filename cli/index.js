#!/usr/bin/env node

// Node imports
const fs = require('fs');

// Vendor imports
const figlet = require('figlet');
const inquirer = require('inquirer');
const chalk = require('chalk');
const Validator = require('jsonschema').Validator;
const _ = require('underscore');

// Ethereum imports
const keythereum = require('keythereum');
const etherutils = require('ethereumjs-util');

const selectAction = async () => {
  const action = [{
      type: "list",
      name: "action",
      message: "Choose an action.",
      default: 0,
      choices: [ "Enter developer info", "Add a microengine", new inquirer.Separator(), "Validate", "Sign and exit"]
    }];

  return await inquirer.prompt(action);
};

const enterDeveloper = async () => {
  const questions = [
    {
      type: "input",
      name: "author",
      message: "What is your name/nickname?",
    },
    {
      type: "input",
      name: "address",
      message: "What is the address of your ether wallet?",
    },
    {
      type: "input",
      name: "website",
      message: "Share your website (optional)",
    },
    {
      type: "input",
      name: "github",
      message: "Share your github (optional)",
    },
    {
      type: "input",
      name: "bio",
      message: "Share a short bio (optional)",
    },
    {
      type: "input",
      name: "skills",
      message: "Enter a comma separated list of your skills (optional)",
    },
  ];

  developer =  await inquirer.prompt(questions);
  developer.skills = developer.skills
    .split(",")
    .map(skill => skill.trim())
    .filter(skill => skill.length > 0);
  return developer;

};

const addMicroengine = async () => {
  const added = {};

  const questions = [
    {
      type: "input",
      name: "address",
      message: "What is the address for the micro engine wallet?",
    },
    {
      type: "input",
      name: "tags",
      message: "Enter a comma separated list of tags for this micro engine",
    },
    {
      type: "input",
      name: "description",
      message: "Enter a description of the micro engine (optional)",
    },
  ];

  const engine = await inquirer.prompt(questions);
  engine.tags = engine.tags
    .split(",")
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);

  let signed = null;

  do {
    try {
      signed = await sign(engine, engine.address);
    } catch(error) {
      console.log(`${chalk.red("X")} Missing keyfile or bad password.`);
    }
    if (signed == null) {
      const tryAgain = [{
        type: "confirm",
        message: "Failed to unlock the keyfile. Try again? (No will remove this microengine)",
        default: false,
        name: "again",
      }]
      const choice = await inquirer.prompt(tryAgain);
      if (!choice.confirm) {
        return null;
      }
    }
  } while (signed == null);

  added.microengine = engine;
  added.signed = signed;
  return added;
};

const sign = async (object, address) => {
  const signing = [
    {
      type: "input",
      name: "keydir",
      default: `/home/${require('os').userInfo().username}/.ethereum/`,
      message: `Enter the path to the directory containing the keystore ${address}`
    },
    {
      type: "password",
      name: "password",
      message: `Enter password for ${address}`
    },
  ];

  const toSign = JSON.stringify(object);

  const keyInfo = await inquirer.prompt(signing);
  const key = keythereum.importFromFile(address, keyInfo.keydir);
  const buff_key = keythereum.recover(keyInfo.password, key);

  let msg =
  '0x' +
  etherutils.keccak(etherutils.toBuffer(toSign)).toString('hex');
  msg =
  '0x' +
  etherutils
    .hashPersonalMessage(etherutils.toBuffer(msg))
    .toString('hex');
  const sig = etherutils.ecsign(etherutils.toBuffer(msg), buff_key);
  let r = '0x' + sig.r.toString('hex');
  let s = '0x' + sig.s.toString('hex');
  let v = sig.v;
  return {r: r, s: s, v: v};
};

const validate = async (entry) => {
  try {
    const path = await new Promise((resolve, reject) => {
      fs.realpath('./schema.json', (err, path) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(path);
      });
    });

    const schema = await new Promise((resolve, reject) => {
      fs.readFile(path, 'utf-8', (err, schemaString) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(schemaString);
      });
    });
    const validator = new Validator();
    return validator.validate(entry, JSON.parse(schema));
  } catch (error) {
    console.log(`${chalk.red("X")} ${error}`);
  }
};

const main = async () => {
  const args = process.argv;
  if (args.length != 4) {
    usage = `Usage: polyswarm-registry <entry_output_file> <sig_output_file>`;
    console.log(usage);
    return;
  }
  const entryOutput = args[2];
  const sigOutput = args[3];
  console.log(chalk.rgb(133, 0, 255)(figlet.textSync('PolySwarm Registry Builder')));

  let registryEntry = {
    author: '',
    bio: '',
    website: '',
    github: '',
    skills: [],
    address: '',
    microengines: [],
    signatures: []
  };

  let answer = null;
  while (true) {
    answer = await selectAction()
    if (answer.action == "Enter developer info") {
      const developer = await enterDeveloper();
      const keys = _.keys(developer);
      keys.forEach(key => {
        if (developer[key]) {
          registryEntry[key] = developer[key];
        }
      });
    } else if (answer.action == "Add a microengine") {
      const added = await addMicroengine();
      if (added) {
        registryEntry.microengines.push(added.microengine);
        registryEntry.signatures.push(added.signed);
      } else {
        console.log(`${chalk.red("X")} Cancelled microengine.`);
      }
    } else if (answer.action == "Validate") {
      const result = await validate(registryEntry);
      if (result.valid) {
        console.log(`${chalk.green("?")} Passed validation.`);
      } else {
        console.log(`${chalk.red("X")} ${result.errors}`);
      }
    } else if (answer.action == "Sign and exit") {
      const result = await validate(registryEntry);
      if (!result.valid) {
        console.log(`${chalk.red("X")} ${result.errors}`);
        continue;
      }

      signature = await sign(registryEntry, registryEntry.address);
      fs.writeFileSync(entryOutput, JSON.stringify(registryEntry, null, 2), 'utf-8');
      fs.writeFileSync(sigOutput, JSON.stringify(signature, null, 2), 'utf-8');
      break;
    }
  }
}

main();