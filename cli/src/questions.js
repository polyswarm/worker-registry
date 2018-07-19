#!/usr/bin/env node

// Project imports
const Entry = require("./entry");

// Node & NPM imports
const fs = require("fs");
const inquirer = require("inquirer");
const chalk = require("chalk");
const Validator = require("jsonschema").Validator;
const CLI = require("clui");
const Spinner = CLI.Spinner;

// Ethereum imports
const keythereum = require("keythereum");
const etherutils = require("ethereumjs-util");

module.exports = class Questions {
  constructor() {
    this.entry = new Entry();

    // binding methods
    this.ask = this.ask.bind(this);
  }

  static async addField(entry, outObject, fieldName, message, validation = null) {
    if (!entry || !entry[fieldName] || entry[fieldName].length == 0 || await Questions.overwrite(fieldName)) {
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

  static async enterDeveloper(entry)  {
    const developer = {};

    await Questions.addField(entry,
      developer,
      "author",
      "What is your name/nickname?",
      entry.validateAuthor);

    await Questions.addField(entry,
      developer,
      "address",
      "What is the address of your ether wallet?",
      entry.validateEthereumAddress);

    await Questions.addField(entry,
      developer,
      "skills",
      "Enter a comma separated list of your skills",
      entry.validateSkills);

    await Questions.addField(entry,
      developer,
      "website",
      "Share your website (optional)");

    await Questions.addField(entry,
      developer,
      "github",
      "Share your github (optional)");

    await Questions.addField(entry,
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
  }

  static async enterMicroengine() {
    const engine = {};

    await Questions.addField(null,
      engine,
      "address",
      "What is the address for the micro engine wallet?",
      Entry.validateEngineAddress);

    await Questions.addField(null,
      engine,
      "tags",
      "Enter a comma separated list of tags for this micro engine",
      Entry.validateEngineTags);

    await Questions.addField(null,
      engine,
      "description",
      "Enter a description of the micro engine (optional)");

    engine.tags = engine.tags
      .split(",")
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const signed = await Questions.trySign(engine, engine.address);
    if (!signed) {
      return null;
    }

    const result = {};
    result.microengine = engine;
    result.signed = signed;
    return result;
  }

  static printError(error) {
    console.error(`${chalk.red(">>")} ${chalk.bold(error)}`);
  }

  static printSuccess(success) {
    console.info(`${chalk.blue("!")} ${chalk.bold(success)}`);
  }

  static async overwrite(field) {
    const question = [{
      type: "confirm",
      default: false,
      name: "overwrite",
      message: `Overwrite existing ${field}`
    }];
    const answer =  await inquirer.prompt(question);
    return answer.overwrite;
  }

  static async selectAction() {
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
  }

  static async sign(object, address, path, password) {
    const toSign = JSON.stringify(object);

    const key = await new Promise(resolve => {
      keythereum.importFromFile(address, path, data => {
        resolve(data);
      });
    });
    const buff_key = await new Promise(resolve => {
      keythereum.recover(password, key, data => {
        resolve(data);
      });
    });

    let msg =
    "0x" +
    etherutils.keccak(etherutils.toBuffer(toSign)).toString("hex");
    msg =
    "0x" +
    etherutils
      .hashPersonalMessage(etherutils.toBuffer(msg))
      .toString("hex");
    const sig = await new Promise(resolve => {
      resolve(etherutils.ecsign(etherutils.toBuffer(msg), buff_key));
    });
    let r = "0x" + sig.r.toString("hex");
    let s = "0x" + sig.s.toString("hex");
    let v = sig.v;
    return {r: r, s: s, v: v};
  }

  static async trySign(object, address) {
    let signed = null;

    do {
      const signing = [
        {
          type: "input",
          name: "keydir",
          default: `/home/${require("os").userInfo().username}/.ethereum/`,
          message: `Enter the path to the directory containing the keystore ${address}`
        },
        {
          type: "password",
          name: "password",
          message: `Enter password for ${address}`
        }
      ];
      const keyInfo = await inquirer.prompt(signing);
      const purple = chalk.rgb(133, 0, 255);
      const spinnerSymbols = [purple("⠁"), purple("⠂"), purple("⠄"), purple("⡀"), purple("⢀") ,purple("⠠") ,purple("⠐") , purple("⠈")];
      let spinner = new Spinner("Signing microengine object.", spinnerSymbols);
      try {
        spinner.start();
        signed = await Questions.sign(object, address, keyInfo.keydir, keyInfo.password);
        spinner.stop();
      } catch(error) {
        spinner.stop();
        Questions.printError("Missing keyfile or bad password.");
      }
      if (signed == null) {
        const tryAgain = [{
          type: "confirm",
          message: "Failed to unlock the keyfile. Try again? (Choosing 'No' will remove this microengine)",
          default: false,
          name: "again"
        }];
        const choice = await inquirer.prompt(tryAgain);
        if (!choice.again) {
          break;
        }
      }
    } while (signed == null);
    return signed;
  }

  static async validate(entry) {
    try {
      const path = await new Promise((resolve, reject) => {
        fs.realpath("./schema.json", (err, path) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(path);
        });
      });

      const schema = await new Promise((resolve, reject) => {
        fs.readFile(path, "utf-8", (err, schemaString) => {
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
      Questions.printError(error);
    }
  }

  async ask() {
    let answer = null;
    while (true) {
      answer = await Questions.selectAction();
      if (answer.action == "Enter developer info") {
        const developer = await Questions.enterDeveloper(this.entry);
        this.entry.setDeveloper(developer);

      } else if (answer.action == "Add a microengine") {
        const engine = await Questions.enterMicroengine();
        if (engine) {
          this.entry.addMicroengine(engine.microengine, engine.signed);
        } else {
          Questions.printError("Cancelled microengine.");
        }

      } else if (answer.action == "Validate") {
        const result = await Questions.validate(this.entry);
        if (result.valid) {
          Questions.printSuccess("Passed validation.");
        } else {
          Questions.printError(result.errors);
        }

      } else if (answer.action == "Export") {
        const result = await Questions.validate(this.entry);
        if (!result.valid) {
          Questions.printError(result.errors);
          continue;
        }
        return this.entry;
      }
    }
  }
};