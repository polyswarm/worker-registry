const figlet = require('figlet');
const inquirer = require('inquirer');
const chalk = require('chalk');
const _ = require('underscore');

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
  developer.skills = developer.skills.split(",").map(skill => skill.trim());
  return developer;

};

const addMicroengine = async () => {

};

const validate = async () => {

};

const main = async () => {
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
  while ((answer = await selectAction()).action != "Sign and exit") {
    if (answer.action == "Enter developer info") {
      const developer = await enterDeveloper();
      const keys = _.keys(developer);
      keys.forEach(key => {
        if (developer[key]) {
          registryEntry[key] = developer[key];
        }
      });
    } else if (answer.action == "Add a microengine") {
      
    } else if (answer.action == "Validate") {

    }
  }
  
  // Sign
  console.log(registryEntry);
}

main();