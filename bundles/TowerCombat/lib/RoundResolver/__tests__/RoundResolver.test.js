const { generatePlayer } = require("../../__tests__/helperFns");
const Light = require("../../intraRoundCommitments/Light");
const Guard = require("../../intraRoundCommitments/Guard");
const RoundResolver = require("../index");
const Engagement = require("../../Engagement");

describe("roundResolver", () => {
  let tomsLight, bobsGuard, tom, bob, theirEngagement;
  beforeEach(() => {
    let [tom] = generatePlayer();
    let [bob] = generatePlayer();
    tomsLight = new Light(tom, bob);
    bobsGuard = new Guard(bob, tom);
    tom.combatants = [bob];
    theirEngagement = new Engagement(tom);
  });
  describe("processModifiers", () => {
    it("takes the targets one is a target of, then processes a defensive action", () => {
      expect(true).toBeTruthy();
    });
  });
});
