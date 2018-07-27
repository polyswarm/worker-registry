const fs = require("fs");
const chalk = require("chalk");
const CLI = require("clui");
const Spinner = CLI.Spinner;

readFileAsync = async (filename) => {
  return await new Promise((resolve, reject) => {
    fs.readFile(filename, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
}

existsAsync = async (filename) => {
  return await new Promise(resolve => {
    fs.exists(filename, exists => {
      resolve(exists)
    });
  });
}

const getSpinner = (message) => {
  const purple = chalk.rgb(133, 0, 255);
  const spinnerSymbols = [purple("⠁"), purple("⠈"), purple("⠐"), purple("⠂"), purple("⠄"), purple("⠠"), purple("⡀"), purple("⢀")];
  return new Spinner(message, spinnerSymbols);
}

module.exports = {
  "existsAsync": existsAsync,
  "readFileAsync": readFileAsync,
  "getSpinner": getSpinner,
}