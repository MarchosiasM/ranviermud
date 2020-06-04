"use strict";

const IntraCommand = require("./IntraCommand");
const config = require("./configuration");
const { commandTypes, damageTypes, layers } = require("./commands.enum");
const _ = require("lodash");

const { dodge } = config;

class Dodge extends IntraCommand {
  constructor(user, target) {
    super(user, target);
    this.user = user;
    this.target = target;
    this.elapsedRounds = 0;
    this.readyToDodge = false;
    this.type = this.config.type;
    user.emit("newDodge", target);
    this.signature = {
      user: user,
      type: dodge.type,
      roundsElapsed: this.elapseRounds,
    };
  }

  update() {
    if (this.elapsedRounds > 1 && !this.readyToDodge) {
      this.user.emit("dodgeInvulnBegin");
      this.readyToDodge = true;
    }
  }

  compareAndApply(incomingAction) {
    if (this.actionIsDodgeableAndActive(incomingAction) && this.readyToDodge) {
      this.handleDodgeMessaging(incomingAction.type, incomingAction.user);
      incomingAction.avoided(this.signature);
    }
  }

  switch(type, target) {
    if (!this.switchable) {
      this.user.emit("dodgeCommitMessage", type);
      return;
    }
    this.user.emit("commitSwitch", type, target);
  }

  setReady() {
    this.elapseRounds === this.config.castTime;
    this.readyToDodge = true;
  }

  handleDodgeMessaging(type, attacker) {
    switch (type) {
      case commandTypes.LIGHT:
        this.user.emit("lightDodge", attacker);
        break;
      case commandTypes.HEAVY:
        this.user.emit("heavyDodge", attacker);
        break;
    }
  }

  get switchable() {
    return this.elapsedRounds >= this.config.castTime;
  }

  get config() {
    return {
      ...dodge,
    };
  }
  actionIsDodgeableAndActive(incomingAction) {
    return (
      incomingAction.target === this.user &&
      incomingAction.layer !== layers.DEFENSE &&
      incomingAction.damageType === damageTypes.PHYSICAL &&
      incomingAction.ready
    );
  }
}

module.exports = Dodge;
