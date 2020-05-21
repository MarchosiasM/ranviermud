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

  resolve(incomingAction) {
    if (this.elapsedRounds >= 1) {
      this.rollAdvantageChance();
    }
    this.elapsedRounds++;
  }

  switch(type, target) {
    if (this.elapsedRounds > 1 && bonusFollowUps[type]) {
      type.gainAdvantage();
    }
    this.user.emit("commitSwitch", type, target);
  }

  rollAdvantageChance() {
    if (Random.inRange(0, 10) === 10) {
      this.user.emit("probeGainAdvantage");
    }
  }

  get config() {
    return {
      ...probe,
    };
  }
}

module.exports = Probe;
