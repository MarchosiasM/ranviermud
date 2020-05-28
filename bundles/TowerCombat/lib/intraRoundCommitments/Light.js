"use strict";

const IntraCommand = require("./IntraCommand");
const { light } = require("./configuration");
const Random = require("rando-js");
const Damage = require("ranvier");

class Light extends IntraCommand {
  constructor(user, target) {
    super(user, target);
    this.user = user;
    this.target = target;
    this.ready = false;
    this.strike = {
      damageMod: 100,
      mitigated: {},
      consequences: {},
    };
    this.mod = light.baseDamage;
    this.mitigated = {};
    this.consequences = {};
    this.elapsedRounds = 0;
    this.type = this.config.type;
    user.emit("newLight", target);
  }

  isInstanceOf(string) {
    return string.match(new RegExp(light.type, "gi"));
  }

  preRoundProcess() {
    if (this.elapsedRounds >= this.config.castTime - 1) {
      this.ready = true;
    }
  }

  elapseRounds(times = 1) {
    this.elapsedRounds += times;
  }

  postRoundProcess(incomingAction) {}

  commit() {
    const { mod } = this.strike.damageMod;
    let amount = this.calculateWeaponDamage(this.user);
    let critical = false;
    if (mod) {
      amount = Math.ceil(amount * mod);
    }
    if (this.user.hasAttribute("critical")) {
      const critChance = Math.max(
        this.user.getMaxAttribute("critical") || 0,
        0
      );
      critical = Random.probability(critChance);
      if (critical) {
        amount = Math.ceil(amount * 1.5);
      }
    }

    const weapon = this.user.equipment.get("wield");
    const damage = new Damage(
      "health",
      amount,
      this.user,
      weapon || this.user,
      {
        critical,
      }
    );
    damage.commit(this.target);
  }

  switch(type, target) {
    if (!this.switchable) {
      this.user.emit("lightCommitMessage", type);
      return;
    }
    this.user.emit("commitSwitch", type, target);
  }

  mitigate(factor, source) {
    this.user.emit(`lightMitigation`, source.user);
    this.strike.mitigated.mult = factor;
  }

  avoided() {
    this.user.emit(`lightAvoided`);
    this.strike.mitigated.avoided = true;
  }

  get switchable() {
    return this.elapsedRounds >= this.config.castTime;
  }

  get config() {
    return {
      ...light,
    };
  }

  get damageType() {
    return this.config.damaging.type;
  }

  setReady() {
    // debug command for testing
    this.elapsedRounds = this.config.castTime;
    this.ready = true;
  }
}

module.exports = Light;
