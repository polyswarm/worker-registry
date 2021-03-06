#!/usr/bin/env node

const _ = require("underscore");
const etherutils = require("ethereumjs-util");

module.exports = class Entry {
  constructor() {
    this.author = "";
    this.bio = "";
    this.website = "";
    this.github = "";
    this.skills = [];
    this.address = "";
    this.microengines = [];
    this.signatures = [];

    this.setDeveloper = this.setDeveloper.bind(this);
    this.addMicroengine = this.addMicroengine.bind(this);
    this.validateAuthor = this.validateAuthor.bind(this);
    this.validateSkills = this.validateSkills.bind(this);
    this.validateEthereumAddress = this.validateEthereumAddress.bind(this);
  }

  setDeveloper(developer) {
    const keys = _.keys(developer);
    keys.forEach(key => {
      if (developer[key]) {
        this[key] = developer[key];
      }
    });
  }

  addMicroengine(engine, sig) {
    this.microengines.push(engine);
    this.signatures.push(sig);
  }

  validateAuthor(author) {
    // If they submit an empty value but we have one, we are cool with it.
    if ((!author || author.length == 0) && this.author.length > 0) {
      return true;
    } else if (author && author.length > 0) {
      return true;
    }
    return "Author must be more than 1 character.";
  }

  validateSkills(skills) {
    // If they submit an empty value but we have one, we are cool with it.
    if ((!skills || skills.length == 0) && this.skills.length > 0) {
      return true;
    } else if (skills && Entry.validateList(skills)) {
      return true;
    }
    return "Must enter at least one skill.";
  }

  validateEthereumAddress(address) {
    // If they submit an empty value but we have one, we are cool with it.
    if ((!address || address.length == 0) && this.address.length > 0) {
      return true;
    } else if (Entry.validateAddress(address)) {
      return true;
    }
    return "Must be a valid Ethereum address, including 0x.";
  }

  static validateEngineAddress(address) {
    return Entry.validateAddress(address) ? true : "Must be a valid Ethereum address, including 0x.";
  }

  static validateEngineTags(tags) {
    return tags && Entry.validateList(tags) ? true : "Must enter at least one tag.";
  }

  static validateAddress(address) {
    return address && etherutils.isValidAddress(address);
  }

  static validateList(list) {
    list = list
      .split(",")
      .map(item => item.trim())
      .filter(item => item.length > 0);
    return list && list.length > 0;
  }
};
