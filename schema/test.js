const fs = require('fs');
const Validator = require('jsonschema').Validator;
const chai = require('chai');
const expect = chai.expect;

let schema = {};
//  Full entry
//  const entry = {
//    author: 'The guy who wrote it.',
//    bio: '5 Years infosec experience',
//    address: '0xaf8302a3786a35abeddf19758067adc9a23597e5',
//    skills: ['Reverse Engineering', 'Malware Analysis'],
//    microengines: [
//      { 
//        address: 'af8302a3786a35abeddf19758067adc9a23597e5',
//        description: 'This finds a specific malware family.',
//        tags: ['Everything']
//      },
//    ]
//  };

before((done) => {
  fs.readFile('./schema.json', 'utf8',  (err, data) => {
    if (err) {
      return;
    }
    schema = JSON.parse(data);
    done();
  });
});

it('should pass with everything specified', () => {
  const entry = {
    author: 'The guy who wrote it.',
    bio: '5 Years infosec experience',
    address: '0xaf8302a3786a35abeddf19758067adc9a23597e5',
    skills: ['Reverse Engineering', 'Malware Analysis'],
    microengines: [
      { 
        address: 'af8302a3786a35abeddf19758067adc9a23597e5',
        description: 'This finds a specific malware family.',
        tags: ['Everything']
      },
    ]
  };

  const v = new Validator();
  expect(v.validate(entry, schema).valid).to.be.true;
});

it('should fail without address', () => {
  const entry = {
    author: 'The guy who wrote it.',
    bio: '5 Years infosec experience',
    skills: ['Reverse Engineering', 'Malware Analysis'],
    microengines: [
      { 
        address: 'af8302a3786a35abeddf19758067adc9a23597e5',
        description: 'This finds a specific malware family.',
        tags: ['Everything']
      },
    ]
  };

  const v = new Validator();
  expect(v.validate(entry, schema).valid).to.be.false;

});

it('should fail without author', () => {
  const entry = {
    address: '0xaf8302a3786a35abeddf19758067adc9a23597e5',
    bio: '5 Years infosec experience',
    skills: ['Reverse Engineering', 'Malware Analysis'],
    microengines: [
      { 
        address: 'af8302a3786a35abeddf19758067adc9a23597e5',
        description: 'This finds a specific malware family.',
        tags: ['Everything']
      },
    ]
  };

  const v = new Validator();
  expect(v.validate(entry, schema).valid).to.be.false;
});

it('should fail without microengines', () => {
  const entry = {
    author: 'The guy who wrote it.',
    address: '0xaf8302a3786a35abeddf19758067adc9a23597e5',
    bio: '5 Years infosec experience',
    skills: ['Reverse Engineering', 'Malware Analysis'],
  };

  const v = new Validator();
  expect(v.validate(entry, schema).valid).to.be.false;
});

it('should fail a file with characters outside hex in address', () => {
  const entry = {
    author: 'The guy who wrote it.',
    address: '0xzf8302a3786a35abeddf19758067adc9a23597e5',
    bio: '5 Years infosec experience',
    skills: ['Reverse Engineering', 'Malware Analysis'],
    microengines: [
      { 
        address: 'af8302a3786a35abeddf19758067adc9a23597e5',
        description: 'This finds a specific malware family.',
        tags: ['Everything']
      },
    ]
  };

  const v = new Validator();
  expect(v.validate(entry, schema).valid).to.be.false;
});

it('should fail a file with too few characters in address', () => {
  const entry = {
    author: 'The guy who wrote it.',
    address: '0xaf8302a3786a35abeddf1758067adc9a23597e5',
    bio: '5 Years infosec experience',
    skills: ['Reverse Engineering', 'Malware Analysis'],
    microengines: [
      { 
        address: 'af8302a3786a35abeddf19758067adc9a23597e5',
        description: 'This finds a specific malware family.',
        tags: ['Everything']
      },
    ]
  };

  const v = new Validator();
  expect(v.validate(entry, schema).valid).to.be.false;
});

it('should fail a file with empty address', () => {
  const entry = {
    author: 'The guy who wrote it.',
    address: '',
    bio: '5 Years infosec experience',
    skills: ['Reverse Engineering', 'Malware Analysis'],
    microengines: [
      { 
        address: 'af8302a3786a35abeddf19758067adc9a23597e5',
        description: 'This finds a specific malware family.',
        tags: ['Everything']
      },
    ]
  };

  const v = new Validator();
  expect(v.validate(entry, schema).valid).to.be.false;
});

it('should fail with empty microengine', () => {
  const entry = {
    author: 'The guy who wrote it.',
    address: '0xaf8302a3786a35abeddf19758067adc9a23597e5',
    bio: '5 Years infosec experience',
    skills: ['Reverse Engineering', 'Malware Analysis'],
    microengines: []
  };

  const v = new Validator();
  expect(v.validate(entry, schema).valid).to.be.false;
});

it('should fail with empty author', () => {
  const entry = {
    author: '',
    address: '0xaf8302a3786a35abeddf19758067adc9a23597e5',
    bio: '5 Years infosec experience',
    skills: ['Reverse Engineering', 'Malware Analysis'],
    microengines: [
      { 
        address: 'af8302a3786a35abeddf19758067adc9a23597e5',
        description: 'This finds a specific malware family.',
        tags: ['Everything']
      },
    ]
  };

  const v = new Validator();
  expect(v.validate(entry, schema).valid).to.be.false;
});

it('should fail with empty skills', () => {
  const entry = {
    author: 'The guy who wrote it.',
    address: '0xaf8302a3786a35abeddf19758067adc9a23597e5',
    bio: '5 Years infosec experience',
    skills: [],
    microengines: [
      { 
        address: 'af8302a3786a35abeddf19758067adc9a23597e5',
        description: 'This finds a specific malware family.',
        tags: ['Everything']
      },
    ]
  };

  const v = new Validator();
  expect(v.validate(entry, schema).valid).to.be.false;
});

it('should fail with non-unique skills', () => {
  const entry = {
    author: 'The guy who wrote it.',
    address: '0xaf8302a3786a35abeddf19758067adc9a23597e5',
    bio: '5 Years infosec experience',
    skills: ['Reverse Engineering', 'Reverse Engineering'],
    microengines: [
      { 
        address: 'af8302a3786a35abeddf19758067adc9a23597e5',
        description: 'This finds a specific malware family.',
        tags: ['Everything']
      },
    ]
  };

  const v = new Validator();
  expect(v.validate(entry, schema).valid).to.be.false;
});

it('should pass without skills', () => {
  const entry = {
    author: 'The guy who wrote it.',
    address: '0xaf8302a3786a35abeddf19758067adc9a23597e5',
    bio: '5 Years infosec experience',
    microengines: [
      { 
        address: 'af8302a3786a35abeddf19758067adc9a23597e5',
        description: 'This finds a specific malware family.',
        tags: ['Everything']
      },
    ]
  };

  const v = new Validator();
  expect(v.validate(entry, schema).valid).to.be.true;
});

it('should pass with multiple skills', () => {
  const entry = {
    author: 'The guy who wrote it.',
    address: '0xaf8302a3786a35abeddf19758067adc9a23597e5',
    bio: '5 Years infosec experience',
    skills: ['Reverse Engineering', 'Malware Analysis'],
    microengines: [
      { 
        address: 'af8302a3786a35abeddf19758067adc9a23597e5',
        description: 'This finds a specific malware family.',
        tags: ['Everything']
      },
    ]
  };

  const v = new Validator();
  expect(v.validate(entry, schema).valid).to.be.true;
});

it('should pass without bio', () => {
  const entry = {
    author: 'The guy who wrote it.',
    address: '0xaf8302a3786a35abeddf19758067adc9a23597e5',
    skills: ['Reverse Engineering', 'Malware Analysis'],
    microengines: [
      { 
        address: 'af8302a3786a35abeddf19758067adc9a23597e5',
        description: 'This finds a specific malware family.',
        tags: ['Everything']
      },
    ]
  };

  const v = new Validator();
  expect(v.validate(entry, schema).valid).to.be.true;
});

it('should pass with empty bio', () => {
  const entry = {
    author: 'The guy who wrote it.',
    address: '0xaf8302a3786a35abeddf19758067adc9a23597e5',
    bio: '',
    skills: ['Reverse Engineering', 'Malware Analysis'],
    microengines: [
      { 
        address: 'af8302a3786a35abeddf19758067adc9a23597e5',
        description: 'This finds a specific malware family.',
        tags: ['Everything']
      },
    ]
  };

  const v = new Validator();
  expect(v.validate(entry, schema).valid).to.be.true;
});

it('should fail when microengine item has no address', () => {
  const entry = {
    author: 'The guy who wrote it.',
    address: '0xaf8302a3786a35abeddf19758067adc9a23597e5',
    bio: '5 Years infosec experience',
    skills: ['Reverse Engineering', 'Malware Analysis'],
    microengines: [
      { 
        description: 'This finds a specific malware family.',
        tags: ['Everything']
      },
    ]
  };

  const v = new Validator();
  expect(v.validate(entry, schema).valid).to.be.false;
});

it('should fail when microengine item has empty address', () => {
  const entry = {
    author: 'The guy who wrote it.',
    address: '0xaf8302a3786a35abeddf19758067adc9a23597e5',
    bio: '5 Years infosec experience',
    skills: ['Reverse Engineering', 'Malware Analysis'],
    microengines: [
      { 
        address: '',
        description: 'This finds a specific malware family.',
        tags: ['Everything']
      },
    ]
  };

  const v = new Validator();
  expect(v.validate(entry, schema).valid).to.be.false;
});

it('should fail when microengine item has bad characters in address', () => {
  const entry = {
    author: 'The guy who wrote it.',
    address: '0xaf8302a3786a35abeddf19758067adc9a23597e5',
    bio: '5 Years infosec experience',
    skills: ['Reverse Engineering', 'Malware Analysis'],
    microengines: [
      { 
        address: 'zf8302a3786a35abeddf19758067adc9a23597e5',
        description: 'This finds a specific malware family.',
        tags: ['Everything']
      },
    ]
  };

  const v = new Validator();
  expect(v.validate(entry, schema).valid).to.be.false;
});

it('should fail when microengine item has short address', () => {
  const entry = {
    author: 'The guy who wrote it.',
    address: '0xaf8302a3786a35abeddf19758067adc9a23597e5',
    bio: '5 Years infosec experience',
    skills: ['Reverse Engineering', 'Malware Analysis'],
    microengines: [
      { 
        address: 'f8302a3786a35abeddf19758067adc9a23597e5',
        description: 'This finds a specific malware family.',
        tags: ['Everything']
      },
    ]
  };

  const v = new Validator();
  expect(v.validate(entry, schema).valid).to.be.false;
});

it('should fail when microengine item has no tags', () => {
  const entry = {
    author: 'The guy who wrote it.',
    address: '0xaf8302a3786a35abeddf19758067adc9a23597e5',
    bio: '5 Years infosec experience',
    skills: ['Reverse Engineering', 'Malware Analysis'],
    microengines: [
      { 
        address: 'af8302a3786a35abeddf19758067adc9a23597e5',
        description: 'This finds a specific malware family.',
      },
    ]
  };

  const v = new Validator();
  expect(v.validate(entry, schema).valid).to.be.false;
});

it('should fail when microengine item has empty tags', () => {
  const entry = {
    author: 'The guy who wrote it.',
    address: '0xaf8302a3786a35abeddf19758067adc9a23597e5',
    bio: '5 Years infosec experience',
    skills: ['Reverse Engineering', 'Malware Analysis'],
    microengines: [
      { 
        address: 'af8302a3786a35abeddf19758067adc9a23597e5',
        description: 'This finds a specific malware family.',
        tags: []
      },
    ]
  };

  const v = new Validator();
  expect(v.validate(entry, schema).valid).to.be.false;
});

it('should fail when microengine item has non-unique tags', () => {
  const entry = {
    author: 'The guy who wrote it.',
    address: '0xaf8302a3786a35abeddf19758067adc9a23597e5',
    bio: '5 Years infosec experience',
    skills: ['Reverse Engineering', 'Malware Analysis'],
    microengines: [
      { 
        address: 'af8302a3786a35abeddf19758067adc9a23597e5',
        description: 'This finds a specific malware family.',
        tags: ['Everything', 'Everything']
      },
    ]
  };

  const v = new Validator();
  expect(v.validate(entry, schema).valid).to.be.false;
});

it('should pass when microengine item has no description', () => {
  const entry = {
    author: 'The guy who wrote it.',
    address: '0xaf8302a3786a35abeddf19758067adc9a23597e5',
    bio: '5 Years infosec experience',
    skills: ['Reverse Engineering', 'Malware Analysis'],
    microengines: [
      { 
        address: 'af8302a3786a35abeddf19758067adc9a23597e5',
        tags: ['Everything']
      },
    ]
  };

  const v = new Validator();
  expect(v.validate(entry, schema).valid).to.be.true;
});

it('should pass when microengine item has empty description', () => {
  const entry = {
    author: 'The guy who wrote it.',
    address: '0xaf8302a3786a35abeddf19758067adc9a23597e5',
    bio: '5 Years infosec experience',
    skills: ['Reverse Engineering', 'Malware Analysis'],
    microengines: [
      { 
        address: 'af8302a3786a35abeddf19758067adc9a23597e5',
        description: '',
        tags: ['Everything']
      },
    ]
  };

  const v = new Validator();
  expect(v.validate(entry, schema).valid).to.be.true;
});

it('should pass when microengine item has multiple tags', () => {
  const entry = {
    author: 'The guy who wrote it.',
    address: '0xaf8302a3786a35abeddf19758067adc9a23597e5',
    bio: '5 Years infosec experience',
    skills: ['Reverse Engineering', 'Malware Analysis'],
    microengines: [
      { 
        address: 'af8302a3786a35abeddf19758067adc9a23597e5',
        description: 'This finds a specific malware family.',
        tags: ['Everything', 'Nothing']
      },
    ]
  };

  const v = new Validator();
  expect(v.validate(entry, schema).valid).to.be.true;
});

