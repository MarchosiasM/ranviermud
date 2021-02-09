"use strict";

const IntraCommand = require("../IntraCommand");
const { parry } = require("../configuration");
const { damageTypes } = require("../commands.enum");
const _ = require("lodash");
const { parryEmits, perceptionMap, parryRoundMap } = require("./Parry.enum");

class Parry extends IntraCommand {
  constructor(user, target) {
    super(user, target);
    this.perceptMap = perceptionMap;
    this.user = user;
    this.target = target;
    this.elapsedRounds = 0;
    this.parrying = false;
    this.type = parry.type;
    this.user.emit(parryEmits.NEW_PARRY, target);
  }

  update() {
    if (!this.parrying && this.elapsedRounds >= 1) {
      this.user.emit(parryEmits.PARRY_PREPARED, this.target);
      this.parrying = true;
    }
  }

  compareAndApply(incomingAction) {
    if (!incomingAction) return;
    const parryInstance = this;
    const damageType = _.get(incomingAction, "damageType");
    const attackTargetsParryer = incomingAction.target === parryInstance.user;
    const parryState = parryRoundMap[parryInstance.elapsedRounds];
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
      if (parryState === parryEmits.PARTIAL_PARRY) {
        incomingAction.mitigate(
          parryInstance.config.mitigationFactors[damageType],
          parryInstance
        );
      }
      if (parryState === parryEmits.PERFECT_PARRY) {
        incomingAction.avoided(parryInstance);
      }
      // TODO: Implement  and perfectlyParried methods in attack classes
    }
  }

  switch(type, target) {
    if (this.elapsedRounds < this.config.castTime) {
      this.user.emit(parryEmits.PARRY_COMMIT, type);
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
