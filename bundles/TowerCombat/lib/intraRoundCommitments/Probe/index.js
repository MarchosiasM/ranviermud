"use strict";

const IntraCommand = require("../IntraCommand");
const { probe } = require("../configuration");
const { Random } = require("rando-js");
const perceptionEnums = require("../../Perception/percept.enum");
const { probeEmits, bonusFollowUps, perceptionMap } = require("./probe.enum");

class Probe extends IntraCommand {
  constructor(user, target) {
    super(user, target);
    this.perceptMap = perceptionMap;
    this.user = user;
    this.target = target;
    this.elapsedRounds = 0;
    user.emit(probeEmits.NEW_PROBE, target);
  }

  isInstanceOf(string) {
    return string.match(new RegExp(probe.type, "gi"));
  }

  // end of rnd 0
  update() {
    const { elapsedRounds } = this;
    if (elapsedRounds >= probe.triggerAdvantageOnTurn) {
      this.rollAdvantageChance();
    }
  }

  // beginning of rnd 1
  compareAndApply() {}

  switch(type, target) {
    if (this.elapsedRounds > 1 && bonusFollowUps[type]) {
      type.elapseRounds();
    }
    this.user.emit("commitSwitch", type, target);
  }

  rollAdvantageChance() {
    if (Random.inRange(0, 10) === 10) {
      this.user.emit(probeEmits.GAIN_ADVANTAGE);
    }
  }

  elapseAction(times = 1) {
    this.elapsedRounds += times;
  }

  get config() {
    return {
      ...probe,
    };
  }

  percept(outcome) {
    if (perceptionEnums.SUCCESS === outcome) {
      return this.perceptMap[perceptionEnums.SUCCESS]({
        name: this.user.name,
      });
    }
    return this.perceptMap[perceptionEnums.PARTIAL_SUCCESS]({
      name: this.user.name,
    });
  }
}

module.exports = Probe;
