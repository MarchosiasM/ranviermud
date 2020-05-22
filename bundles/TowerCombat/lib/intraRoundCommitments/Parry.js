"use strict";

const IntraCommand = require("./IntraCommand");
const { parry } = require("./configuration");
const { evadableTypes } = require("./commands.enum");
const _ = require("lodash");

class Parry extends IntraCommand {
  constructor(user, target) {
    super(user, target);
    this.user = user;
    this.target = target;
    this.elapsedRounds = 0;
    this.parrying = false;
    this.user.emit("newParry", target);
  }

  isInstanceOf(string) {
    return string.match(new RegExp(parry.type, "gi"));
  }

  resolve(incomingAction) {
    const type = _.get(incomingAction, "config.type");
    const parryState = this.config.parryRoundMap[this.elapsedRounds];
    if (parryState && incomingAction) {
      if (evadableTypes[type]) {
        this.user.emit(parryState, incomingAction.user);
        // incomingAction.perfectlyDodged();
        // TODO: Implement perfectlyDodged and perfectlyParried methods in attack classes
      }
    }
    this.elapsedRounds++;
    if (!this.parrying && this.elapsedRounds > 0) {
      this.user.emit("parryPreparedMessage", this.target);
      this.parrying = true;
    }
  }

  switch(type, target) {
    if (this.elapsedRounds < this.config.castTime) {
      this.user.emit("parryCommitMessage", type);
      return;
    }
    this.user.emit("commitSwitch", type, target);
  }

  get config() {
    return {
      ...parry,
    };
  }
}

module.exports = Parry;
