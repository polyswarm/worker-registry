#!/usr/bin/env node

// Node imports
const fs = require('fs');
const Entry = require('./entry');

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
      choices: [
        "Enter developer info",
        "Add a microengine",
        new inquirer.Separator(),
        "Validate",
        "Export"
      ]
    }];

  return await inquirer.prompt(action);
};

const overwrite = async field => {
  const question = [{
    type: "confirm",
    default: false,
    name: "overwrite",
    message: `Overwrite existing ${field}`
  }];
  const answer =  await inquirer.prompt(question);
  return answer.overwrite;
};

const addField = async (entry, outObject, fieldName, message, validation = null) => {
  if (!entry || !entry[fieldName] || entry[fieldName].length == 0 || await overwrite(fieldName)) {
    const question = {
      type: "input",
      name: fieldName,
      message: message
    };
    if (validation) {
      question.validate = validation;
    }
    outObject[fieldName] = (await inquirer.prompt([question]))[fieldName];
  }
}

const enterDeveloper = async (entry) => {
  const developer = {};

  await addField(entry,
		developer,
    "author",
    "What is your name/nickname?",
    entry.validateAuthor);

  await addField(entry,
		developer,
    "address",
    "What is the address of your ether wallet?",
    entry.validateEthereumAddress);

  await addField(entry,
		developer,
    "skills",
    "Enter a comma separated list of your skills",
    entry.validateSkills);

  await addField(entry,
		developer,
    "website",
    "Share your website (optional)");

  await addField(entry,
		developer,
    "github",
    "Share your github (optional)");

  await addField(entry,
		developer,
    "bio",
    "Share a short bio (optional)");


  if (developer.skills) {
    developer.skills = developer.skills
    .split(",")
    .map(skill => skill.trim())
    .filter(skill => skill.length > 0);
  }
  return developer;
};

const addMicroengine = async (entry) => {
  const engine = {};

  await addField(null,
		engine,
    "address",
    "What is the address for the micro engine wallet?",
    entry.validateEngineAddress);

  await addField(null,
		engine,
    "tags",
    "Enter a comma separated list of tags for this micro engine");

  await addField(null,
		engine,
    "description",
    "Enter a description of the micro engine (optional)");

  engine.tags = engine.tags
    .split(",")
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);

  const signed = await trySign(engine, engine.address);
  if (!signed) {
    return null;
  }

  // Because it checks for the value in the entry, the check in addField causes issues.
  const result = {}
  result.microengine = engine;
  result.signed = signed;
  return result;
};

const trySign = async (object, address) => {
  let signed = null;
  do {
    try {
      signed = await sign(object, address);
    } catch(error) {
      printError("Missing keyfile or bad password.");
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
        break;
      }
    }
  } while (signed == null);
  return signed;
}

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
    printError(error);
  }
};

const printError = error => {
  console.log(`${chalk.red("X")} ${error}`);
}

const printSuccess = success => {
  console.log(`${chalk.green("?")} ${success}`);
}

const getArgs = () => {
  const args = process.argv;
  if (args.length != 3) {
    usage = `Usage: polyswarm-registry <entry_output_file>`;
    console.log(usage);
    process.exit(1);
  }
  return args[2];
};

const main = async () => {
  const entryOutput = getArgs();

  console.log(chalk.rgb(133, 0, 255)(figlet.textSync('PolySwarm Registry Builder')));

  const registryEntry = new Entry();

  let answer = null;
  while (true) {
    answer = await selectAction();
    if (answer.action == "Enter developer info") {
      const developer = await enterDeveloper(registryEntry);
      registryEntry.setDeveloper(developer);

    } else if (answer.action == "Add a microengine") {
      const engine = await addMicroengine(registryEntry);
      if (engine) {
        registryEntry.addMicroengine(engine.microengine, engine.signed);
      } else {
        printError("Cancelled microengine.");
      }

    } else if (answer.action == "Validate") {
      const result = await validate(registryEntry);
      if (result.valid) {
        printSuccess("Passed validation.");
      } else {
        printError(result.errors);
      }

    } else if (answer.action == "Export") {
      const result = await validate(registryEntry);
      if (!result.valid) {
        printError(result.errors);
        continue;
      }
      fs.writeFileSync(entryOutput, JSON.stringify(registryEntry, null, 2), 'utf-8');
      break;
    }
  }
}

main();