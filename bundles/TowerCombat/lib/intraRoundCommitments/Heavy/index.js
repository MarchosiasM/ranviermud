"use strict";

const IntraCommand = require("../IntraCommand");
const { heavy } = require("../configuration");
const { damageTypes } = require("../commands.enum");
const { enums } = require("./heavy.enum");

class Heavy extends IntraCommand {
  constructor(user, target) {
    super(user, target);
    this.user = user;
    this.target = target;
    this.ready = false;
    this.mod = heavy.baseDamage;
    this.mitigated = {
      mult: 1,
    };
    this.consequences = {};
    this.elapsedRounds = 0;
    this.completed = false;
    this.type = this.config.type;
    user.emit(enums.NEW_HEAVY, target);
  }

  isInstanceOf(string) {
    return string.match(new RegExp(heavy.type, "gi"));
  }

  get config() {
    return {
      ...heavy,
    };
  }

  switch(type, target) {
    if (!this.switchable) {
      this.user.emit(enums.HEAVY_COMMIT_ERROR, type);
      return;
    }
    this.user.emit("commitSwitch", type, target);
  }

  update() {
    if (this.elapsedRounds >= this.config.castTime - 1) {
      this.ready = true;
    }
  }

  setReady() {
    this.ready = true;
    this.elapsedRounds = this.config.castTime;
  }

  mitigate(factor, source) {
    this.user.emit(enums.HEAVY_MITIGATION, source);
    this.mitigated.mult = factor;
  }

  avoided(source) {
    this.user.emit(enums.HEAVY_AVOIDED, source);
    this.mitigated.avoided = true;
  }

  get switchable() {
    return this.elapsedRounds >= this.config.castTime;
  }

  get damageType() {
    return damageTypes.PHYSICAL;
  }
}

module.exports = Heavy;
