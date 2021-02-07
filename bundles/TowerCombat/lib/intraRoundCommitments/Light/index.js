"use strict";

const IntraCommand = require("../IntraCommand");
const { light } = require("../configuration");
const { lightEmits } = require("./light.enum");
const perceptionEnums = require("../../Perception/percept.enum");

const perceptionMap = {
  [perceptionEnums.SUCCESS]: ({ name }) => `${name} prepares a swift attack!`,
  [perceptionEnums.PARTIAL_SUCCESS]: ({ name }) =>
    `${name} takes an aggressive stance!`,
};

class Light extends IntraCommand {
  constructor(user, target) {
    super(user, target);
    this.user = user;
    this.target = target;
    this.ready = false;
    this.mod = light.baseDamage;
    this.mitigated = {
      mult: 1,
    };
    this.consequences = {};
    this.elapsedRounds = 0;
    this.completed = false;
    this.type = this.config.type;
    user.emit(lightEmits.NEW_LIGHT, target);
  }

  isInstanceOf(string) {
    return string.match(new RegExp(light.type, "gi"));
  }

  update() {
    if (this.elapsedRounds >= this.config.castTime - 1) {
      this.ready = true;
    }
  }

  switch(type, target) {
    if (!this.switchable) {
      this.user.emit(lightEmits.LIGHT_COMMIT_ERROR, type);
      return;
    }
    this.user.emit("commitSwitch", type, target);
  }

  mitigate(factor, source) {
    this.user.emit(lightEmits.LIGHT_MITIGATION, source);
    this.mitigated.mult = factor;
  }

  avoided(source) {
    this.user.emit(lightEmits.LIGHT_AVOIDED, source);
    this.mitigated.avoided = true;
  }

  get switchable() {
    return this.elapsedRounds >= this.config.castTime;
  }

  get config() {
    return {
      ...light,
    };
  }

  get damageType() {
    return this.config.damaging.type;
  }

  setReady() {
    // debug command for testing
    this.elapsedRounds = this.config.castTime;
    this.ready = true;
  }

  percept(outcome) {
    return perceptionMap[outcome];
  }
}

module.exports = Light;
