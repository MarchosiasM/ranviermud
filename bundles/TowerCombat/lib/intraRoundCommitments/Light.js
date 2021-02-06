"use strict";

const IntraCommand = require("./IntraCommand");
const { light } = require("./configuration");
const { Random } = require("rando-js");
const { Damage } = require("ranvier");

class Light extends IntraCommand {
  constructor(user, target) {
    super(user, target);
    this.user = user;
    this.target = target;
    this.ready = false;
    this.mod = light.baseDamage;
    this.mitigated = {
      mult: 1,
    };
    this.consequences = {};
    this.elapsedRounds = 0;
    this.completed = false;
    this.type = this.config.type;
    user.emit("newLight", target);
  }

  isInstanceOf(string) {
    return string.match(new RegExp(light.type, "gi"));
  }

  update() {
    if (this.elapsedRounds >= this.config.castTime - 1) {
      this.ready = true;
    }
  }

  commit() {
    if (!this.ready) return;
    if (this.mitigated.avoided) {
      return;
    }
    const mod = this.mitigated.mult;
    let amount = light.baseDamage;
    if (mod) {
      amount = Math.ceil(amount * mod);
    }
    const weapon = this.user.equipment.get("wield");
    const damage = new Damage("health", amount, this.user, weapon || this.user);
    damage.commit(this.target);
    this.completed = true;
  }

  switch(type, target) {
    if (!this.switchable) {
      this.user.emit("lightCommitError", type);
      return;
    }
    this.user.emit("commitSwitch", type, target);
  }

  mitigate(factor, source) {
    this.user.emit(`lightMitigation`, source);
    this.mitigated.mult = factor;
  }

  avoided(source) {
    this.user.emit(`lightAvoided`, source);
    this.mitigated.avoided = true;
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

  /**
   * Generate an amount of weapon damage
   * @param {Character} attacker
   * @param {boolean} average Whether to find the average or a random inRange(0, 3);between min/max
   * @return {number}
   */
  static calculateWeaponDamage(attacker, average = false) {
    let weaponDamage = Light.getWeaponDamage(attacker);
    let amount = 0;
    if (average) {
      amount = (weaponDamage.min + weaponDamage.max) / 2;
    } else {
      amount = Random.inRange(weaponDamage.min, weaponDamage.max);
    }

    return Light.normalizeWeaponDamage(attacker, amount);
  }

  /**
   * Get the damage of the weapon the character is wielding
   * @param {Character} attacker
   * @return {{max: number, min: number}}
   */
  static getWeaponDamage(attacker) {
    const weapon = attacker.equipment.get("wield");
    let min = 0,
      max = 0;
    if (weapon) {
      min = weapon.metadata.minDamage;
      max = weapon.metadata.maxDamage;
    }

    return {
      max,
      min,
    };
  }

  /**
   * Get the speed of the currently equipped weapon
   * @param {Character} attacker
   * @return {number}
   */
  static getWeaponSpeed(attacker) {
    let speed = 2.0;
    const weapon = attacker.equipment.get("wield");
    if (!attacker.isNpc && weapon) {
      speed = weapon.metadata.speed;
    }

    return speed;
  }

  /**
   * Get a damage amount adjusted by attack power/weapon speed
   * @param {Character} attacker
   * @param {number} amount
   * @return {number}
   */
  static normalizeWeaponDamage(attacker, amount) {
    let speed = Light.getWeaponSpeed(attacker);
    amount += attacker.hasAttribute("strength")
      ? attacker.getAttribute("strength")
      : attacker.level;
    return Math.round((amount / 3.5) * speed);
  }
}

module.exports = Light;
