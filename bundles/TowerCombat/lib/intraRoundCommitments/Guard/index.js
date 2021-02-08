"use strict";

const IntraCommand = require("../IntraCommand");
const { guard } = require("../configuration");
const { commandTypes, damageTypes } = require("../commands.enum");
const { guardEmits } = require("./Guard.enum");

class Guard extends IntraCommand {
  constructor(user, target) {
    super(user, target);
    this.user = user;
    this.target = target;
    this.elapsedRounds = 0;
    this.type = guard.type;
    user.emit(guardEmits.NEW_GUARD, target);
  }

  update() {}

  compareAndApply(incomingAction) {
    const { config: guardConfig } = this;
    const { mitigationFactors } = guardConfig;

    if (this.isMitigatableAndReady(incomingAction)) {
      incomingAction.mitigate(
        mitigationFactors[incomingAction.damageType],
        this
      );

      switch (incomingAction.config.type) {
        case commandTypes.LIGHT:
          this.user.emit(guardEmits.GUARD_MITIGATE_LIGHT);
          break;
        case commandTypes.HEAVY:
          this.user.emit(guardEmits.GUARD_MITIGATE_HEAVY);
          break;
      }
    }
  }

  switch(type, target) {
    if (this.elapsedRounds >= 1 && type === commandTypes.DODGE) {
      // TODO: Put advantage on player if switching to dodge!
      this.user.emit(guardEmits.GUARD_DODGE_ADVANTAGE);
    }
    this.user.emit("commitSwitch", type, target);
  }

  get config() {
    return {
      ...guard,
    };
  }

  switchable() {
    return true;
  }

  isMitigatableAndReady(incomingAction) {
    return (
      incomingAction &&
      incomingAction.ready &&
      incomingAction.damageType === damageTypes.PHYSICAL &&
      incomingAction.target === this.user
    );
  }
}

module.exports = Guard;
