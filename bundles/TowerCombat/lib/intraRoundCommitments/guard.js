"use strict";

const IntraCommand = require("./IntraCommand");
const { guard } = require("./configuration");
const { commandTypes, damageTypes } = require("./commands.enum");
const _ = require("lodash");

class Guard extends IntraCommand {
  constructor(user, target) {
    super(user, target);
    this.user = user;
    this.target = target;
    this.elapsedRounds = 0;
    this.type = guard.type;
    user.emit("newGuard", target);
  }

  preRoundProcess() {}

  postRoundProcess(incomingAction) {
    const { config: guardConfig } = this;
    const { mitigationFactors } = guardConfig;

    if (this.isMitigatableAndReady(incomingAction)) {
      incomingAction.mitigate(
        mitigationFactors[incomingAction.damageType],
        this.config.type
      );

      switch (incomingAction.config.type) {
        case commandTypes.LIGHT:
          this.user.emit("guardLightMitigate");

          break;
        case commandTypes.HEAVY:
          // TODO: Heavy and Light need mitigation methods to hook into here
          // incomingAction.mitigate(heavyMitigationFactor, this.config.type);
          this.user.emit("guardHeavyMitigate");
          break;
      }
    }
  }

  switch(type, target) {
    if (this.elapsedRounds >= 1 && type === commandTypes.DODGE) {
      // TODO: Put advantage on player if switching to dodge!
      this.user.emit("guardDodgeAdvantage");
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
