'use strict'

const { resultPosition, probabilityMap } = require("../Combat.enums");
const { Broadcast: B } = require("ranvier");
const { combatBroadcast } = require('../CombatMessaging')

const resolveStrikeVsDodge = (attacker, target, strikerPosition) => {
  resolveNeutral(attacker, target)
};

const resolveNeutral = (attacker, target) => {
  B.say(attacker, "DEBUG: Neutral dodge vs. dodge")
  const attackerName = attacker.name;
  const targetName = target.name
  const messages = {
    roomMessage: `${attackerName} and ${targetName} dodge away from one another!`,
    attackerMessage: `You and ${targetName} dodge backwards from one another, reorienting yourselves.`,
    targetMessage:  `You and ${attackerName} dodge backwards from one another, reorienting yourselves.`
  }
  combatBroadcast(attacker, target, messages)
};

module.exports = resolveStrikeVsDodge