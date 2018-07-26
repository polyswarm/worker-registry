const fs = require("fs");
const chalk = require("chalk");
const IpfsApi = require("ipfs-api");
const multihashes = require("multihashes");
const Validator = require("jsonschema").Validator;

class Upload {
  constructor(filename, schema) {
    this.filename = filename;
    this.schema = schema;

    this.upload = this.upload.bind(this);
  }

  static async existsAsync(filename) {
    return await new Promise(resolve => {
      fs.exists(filename, exists => {
        resolve(exists)
      });
    });
  }

  static isValidIpfsHash(hash) {
    const toVerify = multihashes.fromB58String(hash);
    try {
      multihashes.validate(toVerify);
      return true;
    } catch (error) {
      return false;
    }
  }

  static async readFileAsync(filename) {
    return await new Promise((resolve, reject) => {
      fs.readFile(filename, (err, data) => {
        if (err) {
          reject(err);
        }
        resolve(data);
      });
    });
  }

  static async validateAsync(filename, schema) {
    let result = null;
    try {
      const contents = await Upload.readFileAsync(filename);
      const schemaContents = await Upload.readFileAsync(schema);

      const validator = new Validator();
      result = await validator.validate(JSON.parse(contents), JSON.parse(schemaContents));
    } catch(error) {
      console.error(`${chalk.red('ERROR:')} ${error}`);
      result = null;
    }
    return result;
  }

  async upload() {
    if (! await Upload.existsAsync(this.filename)) {
      console.error(`${chalk.red('ERROR:')} ${this.filename} does not exist`);
      process.exit(1);
    }

    const validationResult = await Upload.validateAsync(this.filename, this.schema);
    if (!validationResult || !validationResult.valid) {
      console.error(`${chalk.red('ERROR:')} ${this.filename} does not follow the PolySwarm WDL schema.`);
      console.error(validationResult.errors)
      process.exit(1);
    }

    const ipfs = IpfsApi({host: "ipfs.infura.io", port: 5001, protocol: "https"});

    return await new Promise((resolve, reject) => {
      ipfs.util.addFromFs(this.filename, (err, result) => {
        if (err) {
          reject(err);
        }

        const hash = result[0]["hash"];

        if (Upload.isValidIpfsHash(hash)) {
          console.log(hash);
          resolve(hash);
        } else {
          console.error(`${chalk.red('ERROR:')} Invalid IPFS hash: ${hash}`);
          process.exit(10);
        }
      });
    });
  }
}
module.exports = Upload;