// const Perception = require('../index')
const Engagement = require("../../Engagement");
const PlayerOne = require("../../../playerFixtures/tom.json");
const _ = require("lodash");
const Guard = require("../../intraRoundCommitments/Guard");
const Perception = require("../index");
const perceptEmit = require("../percept.enum");

describe("Perception", () => {
  const playerOne = PlayerOne;
  const playerTwo = _.cloneDeep(PlayerOne);
  playerOne.emit = jest.fn();
  playerTwo.emit = jest.fn();
  playerOne.combatants = new Set();
  playerOne.combatants.add(playerTwo);
  playerOne.combatData.decision = new Guard(playerOne, playerTwo);
  playerTwo.combatData.decision = new Guard(playerTwo, playerOne);
  const engagement = new Engagement(playerOne);
  it("On a 1, emits a crit fail", () => {
    Perception.rollDice = jest.fn(() => 1);
    Perception.perceptionCheck(engagement);

    expect(playerOne.emit).toHaveBeenCalledWith(
      perceptEmit.CRITICAL_FAILURE,
      playerTwo
    );
  });
  it("On a 100, emits a success", () => {
    const threshold = grabPlayersActionPerceptionThreshold(playerTwo);
    Perception.rollDice = jest.fn(() => threshold + 1);
    Perception.perceptionCheck(engagement);
    expect(playerOne.emit).toHaveBeenCalledWith(
      perceptEmit.SUCCESS,
      playerTwo.combatData.decision,
      playerTwo
    );
  });
  it("Just under the threshold, returns a partial success", () => {
    const threshold = grabPlayersActionPerceptionThreshold(playerTwo);
    Perception.rollDice = jest.fn(() => threshold - 1);
    Perception.perceptionCheck(engagement);
    expect(playerOne.emit).toHaveBeenCalledWith(
      perceptEmit.PARTIAL_SUCCESS,
      playerTwo.combatData.decision,
      playerTwo
    );
  });
});

const grabPlayersActionPerceptionThreshold = (player) => {
  return player.combatData.decision.config.perceptThreshold;
};
