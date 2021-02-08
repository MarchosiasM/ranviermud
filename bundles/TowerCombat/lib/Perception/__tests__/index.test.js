const Engagement = require("../../Engagement");
const Guard = require("../../intraRoundCommitments/Guard");
const Perception = require("../index");
const perceptEmit = require("../percept.enum");
const { generatePlayer } = require("../../__tests__/helperFns/index");

describe("Perception", () => {
  const [tomas, tomasEmit] = generatePlayer();
  const [bob] = generatePlayer();
  tomas.combatants = new Set();
  tomas.combatants.add(bob);
  tomas.combatData.decision = new Guard(tomas, bob);
  bob.combatData.decision = new Guard(bob, tomas);
  const engagement = new Engagement(tomas);
  it("On a 1, emits a crit fail", () => {
    Perception.rollDice = jest.fn(() => 1);
    Perception.evaluateEngagement(engagement);

    expect(tomasEmit).toHaveBeenCalledWith(
      perceptEmit.CRITICAL_FAILURE,
      bob.combatData.decision,
      bob
    );
  });
  it("On a 100, emits a success", () => {
    const threshold = grabPlayersActionPerceptionThreshold(bob);
    Perception.rollDice = jest.fn(() => threshold + 1);
    Perception.evaluateEngagement(engagement);
    expect(tomasEmit).toHaveBeenCalledWith(
      perceptEmit.SUCCESS,
      bob.combatData.decision,
      bob
    );
  });
  it("Just under the threshold, returns a partial success", () => {
    const threshold = grabPlayersActionPerceptionThreshold(bob);
    Perception.rollDice = jest.fn(() => threshold - 1);
    Perception.evaluateEngagement(engagement);
    expect(tomasEmit).toHaveBeenCalledWith(
      perceptEmit.PARTIAL_SUCCESS,
      bob.combatData.decision,
      bob
    );
  });
});

const grabPlayersActionPerceptionThreshold = (player) => {
  return player.combatData.decision.config.perceptThreshold;
};
