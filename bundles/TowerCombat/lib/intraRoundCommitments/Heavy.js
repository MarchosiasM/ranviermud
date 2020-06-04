"use strict";

const IntraCommand = require("./IntraCommand");
const { heavy } = require("./configuration");
const { damageTypes } = require("./commands.enum");

class Heavy extends IntraCommand {
  constructor(user, target) {
    super(user, target);
    this.user = user;
    this.target = target;
    this.type = heavy.type;
  }

  mitigate() {}
  avoided() {}
  get config() {
    return {
      ...heavy,
    };
  }

  update() {}

  compareAndApply() {}

  elapseRounds() {}

  setReady() {
    this.ready = true;
    this.elapsedRounds = this.config.castTime;
  }

  get damageType() {
    return damageTypes.PHYSICAL;
  }
}

module.exports = Heavy;
