"use strict";

const { Random } = require("rando-js");
const { Damage } = require("ranvier");

/**
 * Actually apply some damage from an attacker to a target
 * @param {Character} attacker
 * @param {Character} target
 */
const makeAttack = (attacker, target, mod = 1) => {
  let amount = calculateWeaponDamage(attacker);
  let critical = false;
  amount = Math.ceil(amount * mod);
  if (attacker.hasAttribute("critical")) {
    const critChance = Math.max(attacker.getMaxAttribute("critical") || 0, 0);
    critical = Random.probability(critChance);
    if (critical) {
      amount = Math.ceil(amount * 1.5);
    }
  }

  const weapon = attacker.equipment.get("wield");
  const damage = new Damage("health", amount, attacker, weapon || attacker, {
    critical,
  });
  damage.commit(target);
};

/**
 * Generate an amount of weapon damage
 * @param {Character} attacker
 * @param {boolean} average Whether to find the average or a random inRange(0, 3);between min/max
 * @return {number}
 */
const calculateWeaponDamage = (attacker, average = false) => {
  let weaponDamage = getWeaponDamage(attacker);
  let amount = 0;
  if (average) {
    amount = (weaponDamage.min + weaponDamage.max) / 2;
  } else {
    amount = Random.inRange(weaponDamage.min, weaponDamage.max);
  }

  return normalizeWeaponDamage(attacker, amount);
};

/**
 * Get the damage of the weapon the character is wielding
 * @param {Character} attacker
 * @return {{max: number, min: number}}
 */
const getWeaponDamage = (attacker) => {
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
};

/**
 * Get a damage amount adjusted by attack power/weapon speed
 * @param {Character} attacker
 * @param {number} amount
 * @return {number}
 */
const normalizeWeaponDamage = (attacker, amount) => {
  let speed = getWeaponSpeed(attacker);
  amount += attacker.hasAttribute("strength")
    ? attacker.getAttribute("strength")
    : attacker.level;
  amount += attacker.hasAttribute("strength")
    ? attacker.getAttribute("strength")
    : attacker.level;

  return Math.round((amount / 3.5) * speed);
};

/**
 * Get the speed of the currently equipped weapon
 * @param {Character} attacker
 * @return {number}
 */
const getWeaponSpeed = (attacker) => {
  let speed = 2.0;
  const weapon = attacker.equipment.get("wield");
  if (!attacker.isNpc && weapon) {
    speed = weapon.metadata.speed;
  }

  return speed;
};

module.exports = {
  makeAttack,
  calculateWeaponDamage,
  normalizeWeaponDamage,
  getWeaponDamage,
  getWeaponSpeed,
};
