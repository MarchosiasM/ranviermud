"use strict";

const { resultPosition, probabilityMap } = require("../Combat.enums");
const { Broadcast: B } = require("ranvier");
const { makeAttack } = require("../weaponFunctions");
const { combatBroadcast } = require("../CombatMessaging");

const resolveStrikeVsDodge = (striker, dodger, strikerPosition) => {
  switch (strikerPosition) {
    case resultPosition.NEUTRAL:
      resolveNeutral(striker, dodger);
      break;
    case resultPosition.ADVANTAGED:
      resolveAdvantaged(striker, dodger);
      break;
    case resultPosition.GR_ADVANTAGED:
      resolveGreatlyAdvantaged(striker, dodger);
      break;
    case resultPosition.DISADVANTAGED:
      resolveDisadvantaged(striker, dodger);
      break;
    case resultPosition.GR_DISADVANTAGED:
      resolveGreatlyDisadvantaged(striker, dodger);
      break;
    default:
      return null;
  }
};

const resolveNeutral = (striker, dodger) => {
  B.atExcept(striker, "DEBUG: Neutral strike vs. dodge");
  const strikerName = striker.name;
  const dodgerName = dodger.name;
  const messages = {
    roomMessage: `${strikerName} swings deftly at ${dodgerName}, but ${dodgerName} evades the worst of it!`,
    attackerMessage: `You catch ${dodgerName} with part of your blow.`,
    targetMessage: `You predict ${strikerName}'s attack and avoid the worst of it.`,
  };
  combatBroadcast(striker, dodger, messages);
  makeAttack(striker, dodger, probabilityMap.MITIGATE_BLOW);

  dodger.emit("knockedOffBalance", striker, dodger);
};

const resolveAdvantaged = (striker, dodger) => {
  B.at(striker, "DEBUG: Advantaged strike vs. dodge");
  const strikerName = striker.name;
  const dodgerName = dodger.name;
  const messages = {
    roomMessage: `${strikerName} swings deftly at ${dodgerName} but ${dodgerName} evades some of it!`,
    attackerMessage: `You catch ${dodgerName} with most of your blow.`,
    targetMessage: `You predict ${strikerName}'s attack but can't get completely out of the way.`,
  };
  combatBroadcast(striker, dodger, messages);
  makeAttack(striker, dodger, probabilityMap.SOFTEN_BLOW);
};

const resolveGreatlyAdvantaged = (striker, dodger) => {
  B.at(striker, "DEBUG: Greatly advantaged strike vs. dodge");
  const strikerName = striker.name;
  const dodgerName = dodger.name;
  const messages = {
    roomMessage: `${dodgerName} attempts to evade, but ${strikerName} easily strikes them.`,
    attackerMessage: `You strike ${dodgerName} solidly in spite of their futile attempts to evade.`,
    targetMessage: `You predict ${strikerName}'s attack but can do nothing to evade in time.`,
  };
  combatBroadcast(striker, dodger, messages);
  makeAttack(striker, dodger);
};

const resolveDisadvantaged = (striker, dodger) => {
  B.at(striker, "DEBUG: Disadvantged strike vs. dodge");
  const strikerName = striker.name;
  const dodgerName = dodger.name;
  const messages = {
    roomMessage: `${strikerName} strikes, but ${dodgerName} evades the attack.`,
    attackerMessage: `You lash out at but ${dodgerName} evades completely.`,
    targetMessage: `You predict ${strikerName}'s attack and evade it completely.`,
  };
  combatBroadcast(striker, dodger, messages);
  dodger.emit("knockedOffBalance", striker, dodger);
};

const resolveGreatlyDisadvantaged = (striker, dodger) => {
  B.at(striker, "DEBUG: Greatly disadvantged strike vs. dodge");
  const strikerName = striker.name;
  const dodgerName = dodger.name;
  const messages = {
    roomMessage: `${dodgerName} evades an attack from ${strikerName} effortlessly, striking in the process.`,
    attackerMessage: `${dodgerName} gracefully avoids your attack, punishing you for the clumsy attempt.`,
    targetMessage: `You see ${strikerName}'s attack clumsy attack from a mile away and punish them for it.`,
  };
  combatBroadcast(striker, dodger, messages);
  makeAttack(dodger, striker, probabilityMap.MITIGATE_BLOW);
  dodger.emit("knockedOffBalance", striker, dodger);
};

module.exports = resolveStrikeVsDodge;
