# PolySwarm Registry CLI

This command line tool assists in the creation of worker descriptions that enable developers to claim microengines and add metadata so that Ambassadors can find them.
Worker descriptions must match our JSON schema, which includes required signatures of various blocks.
Creating a matching JSON file manually can be time consuming, so we released this to simplify the process.

## Install polyswarm-registry

### Yarn

```sh
yarn global add polyswarm-registry
```

### NPM

```sh
npm install -g polyswarm-registry
```

## Usage

```text
polyswarm-registry [command]

Commands:
  polyswarm-registry generate [filename]    interactively generate a worker
                                            description
  polyswarm-registry upload [filename]      upload a worker description
  [wallet] [keystore]
  polyswarm-registry register [hash]        Register your worker description on
  [wallet]                                  Ethereum

Options:
  --version  Show version number                                       [boolean]
  --help     Show help                                                 [boolean]
```

There are three subcommands to assist through the generation, adding to IPFS, and finally, submitting the IPFS hash to our smart-contract on Ethereum.

## Generating JSON

```text
polyswarm-registry generate [filename]

interactively generate a worker description

Positionals:
  filename  output filename

Options:
  --version  Show version number                                       [boolean]
  --help     Show help                                                 [boolean]
```

The generate subcommand takes you on a guided tour to build a worker description JSON file.
When you start the generator, it will give you a choice of several actions.
After each choice is completed, it will bring you back to the main screen, depicted below.
It is easy enough to follow top to bottom, but you can choose to add a microengine before adding the developer info.
You must enter both developer info, and at least one microengine. You can add as many microengines as you like.

When adding a microengine, it will do more than ask for the information you see in the schema.
It will also prompt for a keystore directory, and a password.
With the keystore and password, it will sign the given microengine data, and add it as en entry in signatures.
The directory defaults to `/home/[username]/.ethereum/`, but you can enter whatever directory you would like.
However, the directory you choose must contain another directory named `keystore/` which has a the keyfile for the given addres inside.

Once you have entered in all required information, try the `Validate` option.
This will tell you any remainging fields to be filled in.

Once validated, hit export to write out the JSON file.

```text
? Choose an action. (Use arrow keys)
❯ Enter developer info
  Add a microengine
  ──────────────
  Validate
  Export
```

## Upload JSON to IPFS

```text
polyswarm-registry upload [filename]

upload a worker description

Positionals:
  filename  worker description json to upload

Options:
  --version  Show version number                                       [boolean]
  --help     Show help                                                 [boolean]
```

The upload subcommand takes an input file and puts it on ipfs.
Then, it spits out the IPFS hash.

## Register the description on Ethereum

```text
polyswarm-registry register [hash] [wallet]

Register your worker description on Ethereum

Positionals:
  hash    IPFS hash of the worker description.
  wallet  Wallet address to send transaction from.

Options:
  --version   Show version number                                      [boolean]
  --help      Show help                                                [boolean]
  --update    Update the current worker description for this wallet
                                                                [default: false]
  --keystore  Directory containing the 'keystore/' directory.
                                              [default: "/home/user/.ethereum/"]
  --contract                        [default: "0x00000000000000000000000000000"]
  --eth-uri                                   [default: "http://localhost:8545"]
```

The register subcommand will push the IPFS hash you created to our smart-contract on Ethereum.
Once there, it will be parsed, validated and made accessible at `https://gamma-registry.polyswarm.network/[address]`.

Use `--eth-uri` to specify the infura address with your token.
If you have you own local geth listening at the default rpc port `8545`, there is no need to use this option.

Use `--keystore` to specify the location of your key file.

Use `--contract` to specify an alternate contract address.

Use `--update` if you are submitting with an address that has an existing worker description.

You can use the following one-liner to upload and registry all at once.
Make sure to fill in your informaion before executing it.

```sh
polyswarm-registry register --eth-uri=https://mainnet.infura.io/[key] --keystore /path/to/keystore $(polyswarm-registry upload [file]) [address]
```

## SCHEMA

```json
{
    "$schema": "http://json-schema.org/draft-06/schema#",
    "title": "PolySwarm Worker Design Language",
    "description": "Worker Design Language for Security Experts to define their PolySwarm microengines.",
    "required": ["author", "address", "microengines", "signatures"],
    "type": "object",
    "$defs": {
        "address": { "type": "string", "pattern": "^(0x){0,1}[0-9a-fA-F]{40}$" },
        "tags" : {
            "type": "array",
            "items": {
                "type": "string",
                "minLength": 1
            },
            "minItems": 1,
            "uniqueItems": true
        }
    },
    "properties": {
        "author": { "type": "string", "minLength": 1 },
        "bio": {"type": "string" },
        "website": {"type": "string" },
        "github": {"type": "string" },
        "address": { "$ref": "#/$defs/address" },
        "skills": { "$ref": "#/$defs/tags"},
        "microengines": {
            "type": "array",
            "minItems": 1,
            "uniqueItems": true,
            "items": {
                "type": "object",
                "description": "Microengine description for PolySwarm.",
                "required": ["address", "tags"],
                "properties": {
                    "address": { "$ref": "#/$defs/address" },
                    "description": { "type": "string" },
                    "tags": { "$ref": "#/$defs/tags" }
                }
            }
        },
        "signatures": {
            "type": "array",
            "minItems": 1,
            "uniqueItems": true,
            "items": {
                "type": "object",
                "description": "Signed hash of the related microengine object. Must be entered in the same order.",
                "required": ["v", "r", "s"],
                "properties": {
                    "v" : { "type": "integer", "minimum": 27, "maximum": 28, "exclusiveMaximum": false },
                    "r": { "type": "string", "pattern": "^(0x){0,1}[0-9a-fA-F]{64}$" },
                    "s": { "type": "string", "pattern": "^(0x){0,1}[0-9a-fA-F]{64}$" }
                }
            }
        }
    }
}
```

## LICENSE

```text
Copyright 2018 Swarm Technologies, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```