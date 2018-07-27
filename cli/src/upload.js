const utils = require('./utils.js');
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

  static async validateAsync(filename, schema) {
    let result = null;
    try {
      const contents = await utils.readFileAsync(filename);
      const schemaContents = await utils.readFileAsync(schema);

      const validator = new Validator();
      result = await validator.validate(JSON.parse(contents), JSON.parse(schemaContents));
    } catch(error) {
      console.error(`${chalk.red('ERROR:')} ${error}`);
      result = null;
    }
    return result;
  }

  async upload() {
    if (! await utils.existsAsync(this.filename)) {
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
    try {
      const verified = await new Promise((resolve, reject) => {
        ipfs.util.addFromFs(this.filename, (err, result) => {
          if (err) {
            reject(err);
          }

          const hash = result[0]["hash"];

          if (utils.isValidIpfsHash(hash)) {
            resolve(hash);
          } else {
            reject(`Invalid IPFS hash: ${hash}`);
          }
        });
      });
      return verified;
    } catch (error) {
      console.error(`${chalk.red('ERROR:')} ${error}`);
      process.exit(10);
    }
  }
}
module.exports = Upload;