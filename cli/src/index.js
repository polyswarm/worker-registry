#!/usr/bin/env node

const fs = require('fs');
const figlet = require('figlet');
const chalk = require('chalk');
const Questions = require('./questions');

const getArgs = () => {
  const args = process.argv;
  if (args.length != 3) {
    usage = `Usage: polyswarm-registry <entry_output_file>`;
    console.error(usage);
    process.exit(1);
  }
  return args[2];
};

const main = async () => {
  const entryOutput = getArgs();

  console.log(chalk.rgb(133, 0, 255)(figlet.textSync('PolySwarm Registry Builder')));

  const questions = new Questions();
  const result = await questions.ask();
  if (result) {
    fs.writeFile(entryOutput, JSON.stringify(result, null, 2), 'utf-8', (err) => {
      const message = `Successfully wrote entry to '${entryOutput}'.`
      console.info(`${chalk.blue("!")} ${chalk.bold(message)}`);
    });
  }
}

main();