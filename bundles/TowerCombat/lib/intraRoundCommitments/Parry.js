"use strict";

const IntraCommand = require("./IntraCommand");
const { parry } = require("./configuration");
const { damageTypes } = require("./commands.enum");
const _ = require("lodash");

class Parry extends IntraCommand {
  constructor(user, target) {
    super(user, target);
    this.user = user;
    this.target = target;
    this.elapsedRounds = 0;
    this.parrying = false;
    this.type = parry.type;
    this.user.emit("newParry", target);
  }

  preRoundProcess() {
    if (!this.parrying && this.elapsedRounds >= 1) {
      this.user.emit("parryPreparedMessage", this.target);
      this.parrying = true;
    }
  }

  postRoundProcess(incomingAction) {
    if (!incomingAction) return;
    const parryInstance = this;
    const damageType = _.get(incomingAction, "damageType");
    const attackTargetsParryer = incomingAction.target === parryInstance.user;
    const parryState =
      parryInstance.config.parryRoundMap[parryInstance.elapsedRounds];
    const attackIsReady = incomingAction.ready;
    const attackCanBeParried =
      incomingAction.damageType === damageTypes.PHYSICAL;

    if (
      parryState &&
      attackTargetsParryer &&
      attackCanBeParried &&
      attackIsReady
    ) {
      parryInstance.user.emit(parryState, incomingAction.user);
      if (parryState === "partialParry") {
        incomingAction.mitigate(
          parryInstance.config.mitigationFactors[damageType],
          parryInstance
        );
      }
      if (parryState === "perfectParry") {
        incomingAction.avoided(parryInstance);
      }
      // TODO: Implement  and perfectlyParried methods in attack classes
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

  setReady() {
    // debug command for testing
    this.elapsedRounds = this.config.castTime;
    this.parrying = true;
  }
}

module.exports = Parry;
