#! /usr/bin/env node

const Entry = require("../entry");
const chai = require("chai");
const expect = chai.expect;

it("should add a microengine to the list when called", () => {
  const entry = new Entry();
  entry.addMicroengine("engine", "sig");
  expect(entry.microengines).to.have.length(1);
  expect(entry.microengines[0]).to.equal("engine");
  expect(entry.signatures[0]).to.equal("sig");
  entry.addMicroengine("engineB", "sigB");
  expect(entry.microengines).to.have.length(2);
  expect(entry.microengines[1]).to.equal("engineB");
  expect(entry.signatures[1]).to.equal("sigB");
});

it("should only overwrite developer values that are set in the object", () => {
  const entry = new Entry();
  entry.setDeveloper({author: "asdf"});
  expect(entry.author).to.equal("asdf");

  entry.setDeveloper({skills:["asdf"]});

  expect(entry.skills[0]).to.equal("asdf");
  expect(entry.author).to.equal("asdf");
});

it("should return author valid, if param is null, but set in field", () => {
  const entry = new Entry();
  const develop = {};
  develop.author = "asdf";
  entry.setDeveloper(develop);

  const result = entry.validateAuthor();
  expect(result).to.be.true;
});

it("should return author valid if param is a string with length 1 or more", () => {
  const entry = new Entry();

  const result = entry.validateAuthor("a");
  expect(result).to.be.true;
});

it("should return author invalid if param is null, and not set in field", () => {
  const entry = new Entry();

  const result = entry.validateAuthor();
  expect(result).to.equal("Author must be more than 1 character.");
});

it("should return skills valid, if param is null, but set in field", () => {
  const entry = new Entry();
  entry.setDeveloper({skills:"asdf, fdsa"});

  const result = entry.validateSkills();
  expect(result).to.be.true;
});

it("should return skills valid, if param is empty, but set in field", () => {
  const entry = new Entry();
  entry.setDeveloper({skills:"asdf"});

  const result = entry.validateSkills([]);
  expect(result).to.be.true;
});

it("should return skills valid, if param is has at least one item", () => {
  const entry = new Entry();
  const result = entry.validateSkills("asdf, fdsa");
  expect(result).to.be.true;
});

it("should return skills invalid, if param is empty and not set in field", () => {
  const entry = new Entry();
  const result = entry.validateSkills("");
  expect(result).to.equal("Must enter at least one skill.");
});

it("should return skills invalid, if param is null and not set in field", () => {
  const entry = new Entry();
  const result = entry.validateSkills();
  expect(result).to.equal("Must enter at least one skill.");
});

it("should return address valid, if param is null, but set in field", () => {
  const entry = new Entry();
  entry.setDeveloper({address: "0xf870491ea0f53f67846eecb57855284d8270284d"});
  const result = entry.validateEthereumAddress();
  expect(result).to.be.true;
});

it("should return address valid, if param is a valid eth address", () => {
  const entry = new Entry();
  const result = entry.validateEthereumAddress("0xf870491ea0f53f67846eecb57855284d8270284d");
  expect(result).to.be.true;
});

it("should return address invalid, if param is null, and not set in field", () => {
  const entry = new Entry();
  const result = entry.validateEthereumAddress();
  expect(result).to.equal("Must be a valid Ethereum address, including 0x.");
});

it("should return address invalid, if param is not an eth address, and not set in field", () => {
  const entry = new Entry();
  const result = entry.validateEthereumAddress("0xf870491ea0f53f67846eecb57855284d");
  expect(result).to.equal("Must be a valid Ethereum address, including 0x.");
});

it("should return engine address valid, if param is a valid eth address", () => {
  const result = Entry.validateEngineAddress("0xf870491ea0f53f67846eecb57855284d8270284d");
  expect(result).to.be.true;
});

it("should return engine address invalid, if param is null", () => {
  const result = Entry.validateEngineAddress();
  expect(result).to.equal("Must be a valid Ethereum address, including 0x.");
});

it("should return engine address invalid, if param is not an eth address", () => {
  const result = Entry.validateEngineAddress("0xf870491ea0f53f67846eecb57855284d");
  expect(result).to.equal("Must be a valid Ethereum address, including 0x.");
});

it("should return engine tags valid, if param is has at least one item", () => {
  const result = Entry.validateEngineTags("asdf");
  expect(result).to.be.true;
});

it("should return engine tags invalid, if param is empty", () => {
  const result = Entry.validateEngineTags("");
  expect(result).to.equal("Must enter at least one tag.");
});

it("should return engine tags invalid, if param is null", () => {
  const result = Entry.validateEngineTags();
  expect(result).to.equal("Must enter at least one tag.");
});