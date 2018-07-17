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
//    ],
//    signatures: [
//      {
//        v: 28,
//        r: '0x17b698d9dc52e48e724238ecd978c198fd565b430f0734c040338f494926478f',
//        s: '0x308990ad029f321e62943748c7a76ecf4c7279649d41d91fda0e4e9acb5befaa'
//      }
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
    ],
    signatures: [
      {
        v: 28,
        r: '0x17b698d9dc52e48e724238ecd978c198fd565b430f0734c040338f494926478f',
        s: '0x308990ad029f321e62943748c7a76ecf4c7279649d41d91fda0e4e9acb5befaa'
      }
    ]
  };

  const v = new Validator();
  console.log(v.validate(entry, schema).errors);
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
    ],
    signatures: [
      {
        v: 28,
        r: '0x17b698d9dc52e48e724238ecd978c198fd565b430f0734c040338f494926478f',
        s: '0x308990ad029f321e62943748c7a76ecf4c7279649d41d91fda0e4e9acb5befaa'
      }
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
    ],
    signatures: [
      {
        v: 28,
        r: '0x17b698d9dc52e48e724238ecd978c198fd565b430f0734c040338f494926478f',
        s: '0x308990ad029f321e62943748c7a76ecf4c7279649d41d91fda0e4e9acb5befaa'
      }
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
    signatures: [
      {
        v: 28,
        r: '0x17b698d9dc52e48e724238ecd978c198fd565b430f0734c040338f494926478f',
        s: '0x308990ad029f321e62943748c7a76ecf4c7279649d41d91fda0e4e9acb5befaa'
      }
    ]
  };

  const v = new Validator();
  expect(v.validate(entry, schema).valid).to.be.false;
});

it('should fail without signatures', () => {
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
    ],
    signatures: [
      {
        v: 28,
        r: '0x17b698d9dc52e48e724238ecd978c198fd565b430f0734c040338f494926478f',
        s: '0x308990ad029f321e62943748c7a76ecf4c7279649d41d91fda0e4e9acb5befaa'
      }
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
    ],
    signatures: [
      {
        v: 28,
        r: '0x17b698d9dc52e48e724238ecd978c198fd565b430f0734c040338f494926478f',
        s: '0x308990ad029f321e62943748c7a76ecf4c7279649d41d91fda0e4e9acb5befaa'
      }
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
    ],
    signatures: [
      {
        v: 28,
        r: '0x17b698d9dc52e48e724238ecd978c198fd565b430f0734c040338f494926478f',
        s: '0x308990ad029f321e62943748c7a76ecf4c7279649d41d91fda0e4e9acb5befaa'
      }
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
    microengines: [],
    signatures: [
      {
        v: 28,
        r: '0x17b698d9dc52e48e724238ecd978c198fd565b430f0734c040338f494926478f',
        s: '0x308990ad029f321e62943748c7a76ecf4c7279649d41d91fda0e4e9acb5befaa'
      }
    ]
  };

  const v = new Validator();
  expect(v.validate(entry, schema).valid).to.be.false;
});

it('should fail a file with empty signatures', () => {
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
    ],
    signatures: []
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
    ],
    signatures: [
      {
        v: 28,
        r: '0x17b698d9dc52e48e724238ecd978c198fd565b430f0734c040338f494926478f',
        s: '0x308990ad029f321e62943748c7a76ecf4c7279649d41d91fda0e4e9acb5befaa'
      }
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
    ],
    signatures: [
      {
        v: 28,
        r: '0x17b698d9dc52e48e724238ecd978c198fd565b430f0734c040338f494926478f',
        s: '0x308990ad029f321e62943748c7a76ecf4c7279649d41d91fda0e4e9acb5befaa'
      }
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
    ],
    signatures: [
      {
        v: 28,
        r: '0x17b698d9dc52e48e724238ecd978c198fd565b430f0734c040338f494926478f',
        s: '0x308990ad029f321e62943748c7a76ecf4c7279649d41d91fda0e4e9acb5befaa'
      }
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
    ],
    signatures: [
      {
        v: 28,
        r: '0x17b698d9dc52e48e724238ecd978c198fd565b430f0734c040338f494926478f',
        s: '0x308990ad029f321e62943748c7a76ecf4c7279649d41d91fda0e4e9acb5befaa'
      }
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
    ],
    signatures: [
      {
        v: 28,
        r: '0x17b698d9dc52e48e724238ecd978c198fd565b430f0734c040338f494926478f',
        s: '0x308990ad029f321e62943748c7a76ecf4c7279649d41d91fda0e4e9acb5befaa'
      }
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
    ],
    signatures: [
      {
        v: 28,
        r: '0x17b698d9dc52e48e724238ecd978c198fd565b430f0734c040338f494926478f',
        s: '0x308990ad029f321e62943748c7a76ecf4c7279649d41d91fda0e4e9acb5befaa'
      }
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
    ],
    signatures: [
      {
        v: 28,
        r: '0x17b698d9dc52e48e724238ecd978c198fd565b430f0734c040338f494926478f',
        s: '0x308990ad029f321e62943748c7a76ecf4c7279649d41d91fda0e4e9acb5befaa'
      }
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
    ],
    signatures: [
      {
        v: 28,
        r: '0x17b698d9dc52e48e724238ecd978c198fd565b430f0734c040338f494926478f',
        s: '0x308990ad029f321e62943748c7a76ecf4c7279649d41d91fda0e4e9acb5befaa'
      }
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
    ],
    signatures: [
      {
        v: 28,
        r: '0x17b698d9dc52e48e724238ecd978c198fd565b430f0734c040338f494926478f',
        s: '0x308990ad029f321e62943748c7a76ecf4c7279649d41d91fda0e4e9acb5befaa'
      }
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
    ],
    signatures: [
      {
        v: 28,
        r: '0x17b698d9dc52e48e724238ecd978c198fd565b430f0734c040338f494926478f',
        s: '0x308990ad029f321e62943748c7a76ecf4c7279649d41d91fda0e4e9acb5befaa'
      }
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
    ],
    signatures: [
      {
        v: 28,
        r: '0x17b698d9dc52e48e724238ecd978c198fd565b430f0734c040338f494926478f',
        s: '0x308990ad029f321e62943748c7a76ecf4c7279649d41d91fda0e4e9acb5befaa'
      }
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
    ],
    signatures: [
      {
        v: 28,
        r: '0x17b698d9dc52e48e724238ecd978c198fd565b430f0734c040338f494926478f',
        s: '0x308990ad029f321e62943748c7a76ecf4c7279649d41d91fda0e4e9acb5befaa'
      }
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
    ],
    signatures: [
      {
        v: 28,
        r: '0x17b698d9dc52e48e724238ecd978c198fd565b430f0734c040338f494926478f',
        s: '0x308990ad029f321e62943748c7a76ecf4c7279649d41d91fda0e4e9acb5befaa'
      }
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
    ],
    signatures: [
      {
        v: 28,
        r: '0x17b698d9dc52e48e724238ecd978c198fd565b430f0734c040338f494926478f',
        s: '0x308990ad029f321e62943748c7a76ecf4c7279649d41d91fda0e4e9acb5befaa'
      }
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
    ],
    signatures: [
      {
        v: 28,
        r: '0x17b698d9dc52e48e724238ecd978c198fd565b430f0734c040338f494926478f',
        s: '0x308990ad029f321e62943748c7a76ecf4c7279649d41d91fda0e4e9acb5befaa'
      }
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
    ],
    signatures: [
      {
        v: 28,
        r: '0x17b698d9dc52e48e724238ecd978c198fd565b430f0734c040338f494926478f',
        s: '0x308990ad029f321e62943748c7a76ecf4c7279649d41d91fda0e4e9acb5befaa'
      }
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
    ],
    signatures: [
      {
        v: 28,
        r: '0x17b698d9dc52e48e724238ecd978c198fd565b430f0734c040338f494926478f',
        s: '0x308990ad029f321e62943748c7a76ecf4c7279649d41d91fda0e4e9acb5befaa'
      }
    ]
  };

  const v = new Validator();
  expect(v.validate(entry, schema).valid).to.be.true;
});

it('should fail with empty microengine', () => {
  const entry = {
    author: 'The guy who wrote it.',
    address: '0xaf8302a3786a35abeddf19758067adc9a23597e5',
    bio: '5 Years infosec experience',
    skills: ['Reverse Engineering', 'Malware Analysis'],
    microengines: [],
    signatures: [
      {
        v: 28,
        r: '0x17b698d9dc52e48e724238ecd978c198fd565b430f0734c040338f494926478f',
        s: '0x308990ad029f321e62943748c7a76ecf4c7279649d41d91fda0e4e9acb5befaa'
      }
    ]
  };

  const v = new Validator();
  expect(v.validate(entry, schema).valid).to.be.false;
});

it('should fail a file with empty signatures', () => {
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
    ],
    signatures: []
  };

  const v = new Validator();
  expect(v.validate(entry, schema).valid).to.be.false;
});

it('should fail when signatures has no v', () => {
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
    ],
    signatures: [
      {
        r: '0x17b698d9dc52e48e724238ecd978c198fd565b430f0734c040338f494926478f',
        s: '0x308990ad029f321e62943748c7a76ecf4c7279649d41d91fda0e4e9acb5befaa'
      }
    ]
  };

  const v = new Validator();
  expect(v.validate(entry, schema).valid).to.be.false;
});

it('should fail when signatures has no r', () => {
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
    ],
    signatures: [
      {
        v: 28,
        s: '0x308990ad029f321e62943748c7a76ecf4c7279649d41d91fda0e4e9acb5befaa'
      }
    ]
  };

  const v = new Validator();
  expect(v.validate(entry, schema).valid).to.be.false;
});

it('should fail when signatures has no s', () => {
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
    ],
    signatures: [
      {
        v: 28,
        r: '0x17b698d9dc52e48e724238ecd978c198fd565b430f0734c040338f494926478f',
      }
    ]
  };

  const v = new Validator();
  expect(v.validate(entry, schema).valid).to.be.false;
});

it('should fail when signatures has short r', () => {
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
    ],
    signatures: [
      {
        v: 28,
        r: '0x7b698d9dc52e48e724238ecd978c198fd565b430f0734c040338f494926478f',
        s: '0x308990ad029f321e62943748c7a76ecf4c7279649d41d91fda0e4e9acb5befaa'
      }
    ]
  };

  const v = new Validator();
  expect(v.validate(entry, schema).valid).to.be.false;
});

it('should fail when signatures has short s', () => {
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
    ],
    signatures: [
      {
        v: 28,
        r: '0x17b698d9dc52e48e724238ecd978c198fd565b430f0734c040338f494926478f',
        s: '0x08990ad029f321e62943748c7a76ecf4c7279649d41d91fda0e4e9acb5befaa'
      }
    ]
  };

  const v = new Validator();
  expect(v.validate(entry, schema).valid).to.be.false;
});

it('should fail when signatures has invalid char in r', () => {
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
    ],
    signatures: [
      {
        v: 28,
        r: '0xz7b698d9dc52e48e724238ecd978c198fd565b430f0734c040338f494926478f',
        s: '0x308990ad029f321e62943748c7a76ecf4c7279649d41d91fda0e4e9acb5befaa'
      }
    ]
  };

  const v = new Validator();
  expect(v.validate(entry, schema).valid).to.be.false;
});

it('should fail when signatures has invalid char in s', () => {
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
    ],
    signatures: [
      {
        v: 28,
        r: '0x17b698d9dc52e48e724238ecd978c198fd565b430f0734c040338f494926478f',
        s: '0xz08990ad029f321e62943748c7a76ecf4c7279649d41d91fda0e4e9acb5befaa'
      }
    ]
  };

  const v = new Validator();
  expect(v.validate(entry, schema).valid).to.be.false;
});

it('should fail when signatures has v less than 27', () => {
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
    ],
    signatures: [
      {
        v: 26,
        r: '0x17b698d9dc52e48e724238ecd978c198fd565b430f0734c040338f494926478f',
        s: '0x308990ad029f321e62943748c7a76ecf4c7279649d41d91fda0e4e9acb5befaa'
      }
    ]
  };

  const v = new Validator();
  expect(v.validate(entry, schema).valid).to.be.false;
});

it('should fail when signatures has v more than 28', () => {
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
    ],
    signatures: [
      {
        v: 29,
        r: '0x17b698d9dc52e48e724238ecd978c198fd565b430f0734c040338f494926478f',
        s: '0x308990ad029f321e62943748c7a76ecf4c7279649d41d91fda0e4e9acb5befaa'
      }
    ]
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
    ],
    signatures: [
      {
        v: 28,
        r: '0x17b698d9dc52e48e724238ecd978c198fd565b430f0734c040338f494926478f',
        s: '0x308990ad029f321e62943748c7a76ecf4c7279649d41d91fda0e4e9acb5befaa'
      }
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
    ],
    signatures: [
      {
        v: 28,
        r: '0x17b698d9dc52e48e724238ecd978c198fd565b430f0734c040338f494926478f',
        s: '0x308990ad029f321e62943748c7a76ecf4c7279649d41d91fda0e4e9acb5befaa'
      }
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
    ],
    signatures: [
      {
        v: 28,
        r: '0x17b698d9dc52e48e724238ecd978c198fd565b430f0734c040338f494926478f',
        s: '0x308990ad029f321e62943748c7a76ecf4c7279649d41d91fda0e4e9acb5befaa'
      }
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
    ],
    signatures: [
      {
        v: 28,
        r: '0x17b698d9dc52e48e724238ecd978c198fd565b430f0734c040338f494926478f',
        s: '0x308990ad029f321e62943748c7a76ecf4c7279649d41d91fda0e4e9acb5befaa'
      }
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
    ],
    signatures: [
      {
        v: 28,
        r: '0x17b698d9dc52e48e724238ecd978c198fd565b430f0734c040338f494926478f',
        s: '0x308990ad029f321e62943748c7a76ecf4c7279649d41d91fda0e4e9acb5befaa'
      }
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
    ],
    signatures: [
      {
        v: 28,
        r: '0x17b698d9dc52e48e724238ecd978c198fd565b430f0734c040338f494926478f',
        s: '0x308990ad029f321e62943748c7a76ecf4c7279649d41d91fda0e4e9acb5befaa'
      }
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
    ],
    signatures: [
      {
        v: 28,
        r: '0x17b698d9dc52e48e724238ecd978c198fd565b430f0734c040338f494926478f',
        s: '0x308990ad029f321e62943748c7a76ecf4c7279649d41d91fda0e4e9acb5befaa'
      }
    ]
  };

  const v = new Validator();
  expect(v.validate(entry, schema).valid).to.be.true;
});
