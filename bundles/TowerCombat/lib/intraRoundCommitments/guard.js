"use strict";

const IntraCommand = require("./IntraCommand");
const { guard } = require("./configuration");
const { commandTypes } = require("./commands.enum");

class Guard extends IntraCommand {
  constructor(user, target) {
    super(user, target);
    this.user = user;
    this.target = target;
    this.elapsedRounds = 0;
    user.emit("newGuard", target);
  }

  isInstanceOf(string) {
    return string.match(new RegExp(guard.type, "gi"));
  }

  resolve(incomingAction) {
    const lightMitigationFactor = 0.9;
    const heavyMitigationFactor = 0.9;
    if (incomingAction && incomingAction.config) {
      switch (incomingAction.config.type) {
        case commandTypes.LIGHT:
          // incomingAction.mitigate(lightMitigationFactor, this.config.type);
          this.user.emit("guardLightMitigate");
          break;
        case commandTypes.HEAVY:
          // TODO: Heavy and Light need mitigation methods to hook into here
          // incomingAction.mitigate(heavyMitigationFactor, this.config.type);
          this.user.emit("guardHeavyMitigate");
          break;
      }
    }
    this.elapsedRounds++;
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
}

module.exports = Guard;
