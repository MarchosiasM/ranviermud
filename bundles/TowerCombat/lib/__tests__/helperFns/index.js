const Engagement = require("../../Engagement/index");
const basePlayer = require("../../../playerFixtures/tom.json");
const Combat = require("../../Combat");
const _ = require("lodash");

let playerID = 0;
const nameArray = [
  "Tom Bombadil",
  "Jesse Owens",
  "Barrack Obama",
  "Sarah Michelle Gellar",
  "J Jonah Jameson",
  "Tim McGraw",
  "Altair",
  "Quid",
  "Spiderman",
];
const generatePlayer = () => {
  const clonedPlayer = _.cloneDeep(basePlayer);
  clonedPlayer.name = nameArray[playerID];
  clonedPlayer.isInCombat = () => true;
  clonedPlayer.hasAttribute = () => true;
  clonedPlayer.getMaxAttribute = () => 10;
  clonedPlayer.getAttribute = () => 10;
  clonedPlayer.equipment.get = (arg) => {
    return clonedPlayer.equipment[arg];
  };
  clonedPlayer.evaluateOutgoingDamage = () => {};
  clonedPlayer.evaluateIncomingDamage = () => {};
  clonedPlayer.lowerAttribute = () => {};
  playerID++;
  clonedPlayer.emit = jest.fn();
  return clonedPlayer;
};

const generateEngagement = (combatants) => {
  const loopingPlayer = generatePlayer();
  loopingPlayer.combatants = new Set();
  for (let i = 0; i < combatants; i++) {
    loopingPlayer.combatants.add(generatePlayer());
  }
  const engagement = new Engagement(loopingPlayer);
  return engagement;
};

const generateState = (stateOverrides) => {
  const state = {
    isDebug: true,
    CommandManager: {
      get: () => {},
      find: () => {},
    },
    ChannelManager: {
      find: () => {},
    },
    SkillManager: {
      find: () => {},
    },
  };
  return {
    ...state,
    ...stateOverrides,
  };
};

const advanceRound = (playerOneCommand, playerTwoCommand) => {
  playerOneCommand.update(playerTwoCommand);
  playerTwoCommand.update(playerOneCommand);
  playerOneCommand.elapseRounds();
  playerTwoCommand.elapseRounds();
  playerOneCommand.compareAndApply(playerTwoCommand);
  playerTwoCommand.compareAndApply(playerOneCommand);
};

const generateCombatAndAdvance = (commands, state) => {
  const players = [];
  commands.forEach((command) => {
    command.user.combatData.decision = command;
    players.push(command.user);
  });
  if (!state) {
    state = generateState();
  }
  state.isDebug = true;
  const [arbitraryPlayer, ...otherPlayers] = players;
  arbitraryPlayer.combatants = otherPlayers;
  Combat.updateRound(state, arbitraryPlayer);
  return () => {
    Combat.updateRound(state, arbitraryPlayer);
  };
};

module.exports = {
  generateEngagement,
  generatePlayer,
  generateState,
  advanceRound,
  generateCombatAndAdvance,
};
