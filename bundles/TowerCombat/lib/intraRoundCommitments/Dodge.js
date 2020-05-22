"use strict";

const IntraCommand = require("./IntraCommand");
const { dodge } = require("./configuration");

const dodgeableActions = {
  LIGHT: "light strike",
  HEAVY: "heavy strike",
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
    if (this.dodging && incomingAction) {
      if (incomingAction.config.type === dodgeableActions.LIGHT) {
        this.user.emit("lightDodge", incomingAction.user);
        // incomingAction.perfectlyDodged();
        // TODO: Implement perfectlyDodged and perfectlyParried methods in attack classes
      }
      if (incomingAction.config.type === dodgeableActions.HEAVY) {
        this.user.emit("heavyDodge", incomingAction.user);
        // incomingAction.perfectlyDodged();
      }
    }
    this.elapsedRounds++;
    if (this.elapsedRounds > 1 && !this.dodge) {
      this.user.emit("dodgeInvulnBegin");
      this.dodging = true;
    }
  }

  switch(type, target) {
    if (this.elapsedRounds < this.config.castTime) {
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
