# Worker Design Language Schema

This is the JSON schema for registering microengines with PolySwarm.

The schema itself is in `schema.json`. The contents are

```
{
    "$schema": "http://json-schema.org/draft-06/schema#",
    "title": "PolySwarm Worker Design Language",
    "description": "Worker Design Language for Security Experts to define their PolySwarm micro-engines.",
    "required": ["author", "address", "microengines"],
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
        "address": { "$ref": "#/$defs/address" },
        "skills": { "$ref": "#/$defs/tags"},
        "microengines": {
            "type": "array",
            "items": {
                "type": "object",
                "description": "Microengine description for PolySwarm.",
                "required": ["address", "tags"],
                "properties": {
                    "address": { "$ref": "#/$defs/address" },
                    "description": { "type": "string" },
                    "tags": { "$ref": "#/$defs/tags" }
                }
            },
            "minItems": 1,
            "uniqueItems": true
        }
    }
}

```

# Validating an entry against the schema

1. Install deps with `yarn install`
2. Write your entry into a file
3. Run `yarn validate <filename>`

If the entry passes, the output will be `true`. If the entry fails, the output
will be `false` and then an explanation of the error(s).

For examples run `yarn validate demo-pass.json` and `yarn validate
demo-fail.json`

# Tests

1. Install deps with `yarn install`
2. Run `yarn test`
