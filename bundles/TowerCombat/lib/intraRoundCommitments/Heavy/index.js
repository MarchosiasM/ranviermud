"use strict";

const IntraCommand = require("../IntraCommand");
const { heavy } = require("../configuration");
const { damageTypes } = require("../commands.enum");
const { heavyEmits } = require("./heavy.enum");
const perceptionEnums = require("../../Perception/percept.enum");

const perceptionMap = {
  [perceptionEnums.SUCCESS]: {
    0: ({ name }) =>
      `${name} reels their weapon back in preparation for a heavy attack!`,
    1: ({ name }) => `${name} begins swinging their weapon in a giant arc!`,
    2: ({ name }) => `${name}'s weapon is in the middle of a giant arc!`,
    3: ({ name }) => `${name}'s weapon is in the middle of a giant arc!`,
    4: ({ name }) => `${name}'s weapon is in the middle of a giant arc!`,
    5: ({ name }) =>
      `${name} is bringing their weapon down for a massive blow!`,
  },
  [perceptionEnums.PARTIAL_SUCCESS]: ({ name }) =>
    `${name} takes an aggressive stance!`,
};

class Heavy extends IntraCommand {
  constructor(user, target) {
    super(user, target);
    this.perceptMap = perceptionMap;
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
    user.emit(heavyEmits.NEW_HEAVY, target);
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
      this.user.emit(heavyEmits.HEAVY_COMMIT_ERROR, type);
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
    this.user.emit(heavyEmits.HEAVY_MITIGATION, source);
    this.mitigated.mult = factor;
  }

  avoided(source) {
    this.user.emit(heavyEmits.HEAVY_AVOIDED, source);
    this.mitigated.avoided = true;
  }

  get switchable() {
    return this.elapsedRounds >= this.config.castTime;
  }

  get damageType() {
    return damageTypes.PHYSICAL;
  }

  percept(outcome) {
    if (perceptionEnums.SUCCESS === outcome) {
      switch (this.elapsedRounds) {
        case 0:
          return perceptionMap[outcome][this.elapsedRounds]({
            name: this.user.name,
          });
        case 1:
          return perceptionMap[outcome][this.elapsedRounds]({
            name: this.user.name,
          });
        case 2:
          return perceptionMap[outcome][this.elapsedRounds]({
            name: this.user.name,
          });
        case 3:
          return perceptionMap[outcome][this.elapsedRounds]({
            name: this.user.name,
          });
        case 4:
          return perceptionMap[outcome][this.elapsedRounds]({
            name: this.user.name,
          });
        case 5:
          return perceptionMap[outcome][this.elapsedRounds]({
            name: this.user.name,
          });
      }
    }
    return perceptionMap[outcome]({ name: this.user.name });
  }
}

module.exports = Heavy;
