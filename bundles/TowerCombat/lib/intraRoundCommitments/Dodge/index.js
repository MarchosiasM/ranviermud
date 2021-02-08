"use strict";

const IntraCommand = require("../IntraCommand");
const config = require("../configuration");
const { commandTypes, damageTypes, layers } = require("../commands.enum");
const { dodge } = config;
const { dodgeEmit, perceptionMap } = require("./Dodge.enum");

class Dodge extends IntraCommand {
  constructor(user, target) {
    super(user, target);
    this.perceptMap = perceptionMap;
    this.user = user;
    this.target = target;
    this.elapsedRounds = 0;
    this.readyToDodge = false;
    this.type = this.config.type;
    user.emit(dodgeEmit.NEW_DODGE, target);
    this.signature = {
      user: user,
      type: dodge.type,
      roundsElapsed: this.elapseRounds,
    };
  }

  update() {
    if (this.elapsedRounds > 1 && !this.readyToDodge) {
      this.user.emit(dodgeEmit.DODGE_INVULN_BEGIN);
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
      this.user.emit(dodgeEmit.DODGE_COMMIT_ERROR, type);
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
        this.user.emit(dodgeEmit.LIGHT_DODGE, attacker);
        break;
      case commandTypes.HEAVY:
        this.user.emit(dodgeEmit.HEAVY_DODGE, attacker);
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
