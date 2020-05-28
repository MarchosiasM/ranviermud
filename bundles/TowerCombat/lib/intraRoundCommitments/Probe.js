"use strict";

const IntraCommand = require("./IntraCommand");
const { probe } = require("./configuration");
const { Random } = require("rando-js");

const bonusFollowUps = {
  LIGHT: "LIGHT",
  HEAVY: "HEAVY",
  PARRY: "PARRY",
};

class Probe extends IntraCommand {
  constructor(user, target) {
    super(user, target);
    this.user = user;
    this.target = target;
    this.elapsedRounds = 0;
    user.emit("newProbe", target);
  }

  isInstanceOf(string) {
    return string.match(new RegExp(probe.type, "gi"));
  }

  // end of rnd 0
  preRoundProcess() {}

  // beginning of rnd 1
  postRoundProcess() {
    const { elapsedRounds } = this;
    if (elapsedRounds >= probe.triggerAdvantageOnTurn) {
      this.rollAdvantageChance();
    }
  }

  switch(type, target) {
    if (this.elapsedRounds > 1 && bonusFollowUps[type]) {
      type.elapseRounds();
    }
    this.user.emit("commitSwitch", type, target);
  }

  rollAdvantageChance() {
    if (Random.inRange(0, 10) === 10) {
      this.user.emit("probeGainAdvantage");
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
}

module.exports = Probe;
