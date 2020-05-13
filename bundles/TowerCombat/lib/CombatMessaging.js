"use strict";

const { Broadcast: B } = require("ranvier");

const combatBroadcast = (attacker, target, messages) => {
  const { roomMessage, attackerMessage, targetMessage } = messages;
  B.sayAtExcept(attacker, roomMessage, [attacker, target]);
  B.sayAt(attacker, attackerMessage);
  B.sayAt(target, targetMessage);
  B.at(attacker, "/n");
};

module.exports = {
  combatBroadcast,
};
