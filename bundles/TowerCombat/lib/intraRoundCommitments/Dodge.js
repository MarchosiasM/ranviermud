"use strict";

const IntraCommand = require("./IntraCommand");
const { dodge } = require("./configuration");

const dodgeableActions = {
  LIGHT: "LIGHT",
  HEAVY: "HEAVY",
};

class Dodge extends IntraCommand {
  constructor(user, target) {
    super(user, target);
    this.user = user;
    this.target = target;
    this.elapsedRounds = 0;
    this.dodging = false;
    user.emit("newDodge", target);
  }

  isInstanceOf(string) {
    return string.match(new RegExp(dodge.type, "gi"));
  }

  resolve(incomingAction) {
    if (this.elapsedRounds === 1) {
      this.user.emit("dodgeInvulnBegin");
      this.dodging = true;
    }
    if (this.dodging) {
      if (incomingAction.config.type === dodgeableActions.LIGHT) {
        this.user.emit("lightDodge", this.incomingAction.user);
        incomingAction.perfectlyDodged();
      }
      if (incomingAction.config.type === dodgeableActions.LIGHT) {
        this.user.emit("lightDodge", this.incomingAction.user);
        incomingAction.perfectlyDodged();
      }
    }
    this.elapsedRounds++;
  }

  switch(type, target) {
    if (this.elapsedRounds < this.config.castTime - 1) {
      this.user.emit("dodgeCommitMessage", type);
      return;
    }
    this.user.emit("commitSwitch", type, target);
  }

  get config() {
    return {
      ...dodge,
    };
  }
}

module.exports = Dodge;
