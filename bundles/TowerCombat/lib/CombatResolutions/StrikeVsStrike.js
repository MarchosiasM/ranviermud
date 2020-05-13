"use strict";

const { resultPosition, probabilityMap } = require("../Combat.enums");
const { Broadcast: B } = require("ranvier");
const { Random } = require("rando-js");
const { makeAttack } = require("../weaponFunctions");

const resolveStrikeVsStrike = (attacker, target, attackerPosition) => {
  switch (attackerPosition) {
    case resultPosition.NEUTRAL:
      resolveNeutralStrike(attacker, target);
      break;
    case resultPosition.ADVANTAGED:
      resolveAdvStrike(attacker, target);
      break;
    case resultPosition.GR_ADVANTAGED:
      resolveGrAdvStrike(attacker, target);
      break;
    case resultPosition.DISADVANTAGED:
      resolveAdvStrike(target, attacker);
      break;
    case resultPosition.GR_DISADVANTAGED:
      resolveGrAdvStrike(target, attacker);
      break;
    default:
      return null;
  }
};

const resolveNeutralStrike = (attacker, target) => {
  // this has three branches
  B.sayAt(attacker, "Neutral strike");
  B.sayAt(target, "Neutral strike");
  B.sayAt(attacker, "You lash out");
  const diceRoll = Random.inRange(0, 3);
  // accidental parry
  if (diceRoll === 1) {
    B.sayAt(
      attacker,
      `*CLANG!* Your hands sting with the vibration of your weapon as you and ${target.name} deflect each others' blows.`
    );
    B.sayAt(
      target,
      `*CLANG!* Your hands sting with the vibration of your weapon as you and ${attacker.name} deflect each others' blows.`
    );
    return;
  }
  // accidental deflection, reduced damage
  if (diceRoll == 2) {
    B.sayAt(
      attacker,
      `Your attack collides with ${target.name}s, deflecting the shot just so!`
    );
    B.sayAt(
      target,
      `Your attack collides with ${attacker.name}s, deflecting the shot just so!`
    );
    makeAttack(attacker, target, probabilityMap.SOFTEN_BLOW);
    makeAttack(target, attacker, probabilityMap.SOFTEN_BLOW);
    return;
  }
  // full hits
  makeAttack(target, attacker);
  makeAttack(attacker, target);
};

const resolveAdvStrike = (attacker, target) => {
  B.sayAt(attacker, "You make an advantaged hit");
  B.sayAt(target, "You receive an advantaged hit");
  makeAttack(attacker, target);
  makeAttack(target, attacker, probabilityMap.SOFTEN_BLOW);
};

const resolveGrAdvStrike = (attacker, target) => {
  B.sayAt(attacker, "You make a greatly advantaged hit");
  B.sayAt(target, "You receive a greatly advantaged hit");
  makeAttack(attacker, target);
};

module.exports = resolveStrikeVsStrike;
