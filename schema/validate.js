const Validator = require('jsonschema').Validator;
const fs = require('fs');

const path = process.argv[2];

fs.readFile(path, 'utf8', (err, entryString) => {
  if(err) {
    console.error('Bad file to validate.', err);
    return;
  }

  const entry = JSON.parse(entryString);
  fs.readFile('../src/workerregistry/data/schema.json', 'utf8', (err, schemaString) => {
    if(err) {
      console.error('Bad file to validate.', err);
      return;
    }

    const v = new Validator();
    const result = v.validate(entry, JSON.parse(schemaString));
    console.log(result.valid);
    if (!result.valid) {
      console.log(result.errors);
    }
  });
});
