const fs = require("fs");
const chalk = require("chalk");
const keythereum = require("keythereum");
const multihashes = require("multihashes");
const CLI = require("clui");
const Spinner = CLI.Spinner;

const readFileAsync = async (filename) => {
  return await new Promise((resolve, reject) => {
    fs.readFile(filename, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
};

const existsAsync = async (filename) => {
  return await new Promise(resolve => {
    fs.exists(filename, exists => {
      resolve(exists)
    });
  });
};

const getSpinner = (message) => {
  const purple = chalk.rgb(133, 0, 255);
  const spinnerSymbols = [purple("⠁"), purple("⠈"), purple("⠐"), purple("⠂"), purple("⠄"), purple("⠠"), purple("⡀"), purple("⢀")];
  return new Spinner(message, spinnerSymbols);
};

const loadKeyFile = async (address, keydir) => {
  return await new Promise((resolve, reject) => {
    const data = keythereum.importFromFile(address, keydir);
    if (data instanceof Error) {
      reject(data);
    } else {
      resolve(data);
    }
  });
};

const decryptKey = async (password, keyFile) => {
  return await new Promise((resolve, reject) => {
    keythereum.recover(password, keyFile, (key) => {
      if (key instanceof Error) {
        reject(key);
      } else {
        resolve(key);
      }
    });
  });
};

const isValidIpfsHash = hash => {
  const toVerify = multihashes.fromB58String(hash);
  try {
    multihashes.validate(toVerify);
    return true;
  } catch (error) {
    return false;
  }
};

module.exports = {
  "existsAsync": existsAsync,
  "decryptKey": decryptKey,
  "getSpinner": getSpinner,
  "isValidIpfsHash": isValidIpfsHash,
  "loadKeyFile": loadKeyFile,
  "readFileAsync": readFileAsync,
};