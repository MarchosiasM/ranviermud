const Guard = require("../Guard");
const Light = require("../Light");
const Heavy = require("../Heavy");
const Dodge = require("../Dodge");
const {
  generatePlayer,
  advanceRound,
  generateCombatAndAdvance,
} = require("../../__tests__/helperFns");

describe("Dodge", () => {
  let tomas, bob, dodgeInstance, bobsGuardInstance;
  beforeEach(() => {
    tomas = generatePlayer();
    tomas.emit = jest.fn();
    bob = generatePlayer();
    dodgeInstance = new Dodge(tomas, bob);
    bobsGuardInstance = new Guard(bob, tomas);
  });
  it("triggers the newGuard event when instantiated", () => {
    expect(tomas.emit).toHaveBeenCalledWith("newDodge", bob);
  });

  it("is recognized as an instance of itself", () => {
    // this seems redundant, but I use this method for some dynamic checking in the command handler
    expect(dodgeInstance.isInstanceOf(dodgeInstance.config.type)).toBeTruthy();
  });

  describe("switch", () => {
    const roundCount = [0, 1, 2, 3];
    it.each(roundCount)(
      "does not allow a switch if only %p rounds have elapsed",
      (roundsToElapse) => {
        expect(tomas.emit).not.toHaveBeenCalledWith(
          "dodgeCommitMessage",
          "light strike"
        );
        for (let i = 0; i < roundsToElapse; i++) {
          advanceRound(dodgeInstance, bobsGuardInstance);
          expect(dodgeInstance.elapsedRounds).toBe(i + 1);
        }
        dodgeInstance.switch("light strike", bob);
        expect(tomas.emit).not.toHaveBeenCalledWith(
          "commitSwitch",
          "light strike",
          bob
        );
        expect(tomas.emit).toHaveBeenCalledWith(
          "dodgeCommitMessage",
          "light strike"
        );
      }
    );
    it("allows switch after 4 rounds elapsed", () => {
      const continueAdvance = generateCombatAndAdvance([
        dodgeInstance,
        bobsGuardInstance,
      ]);
      continueAdvance();
      continueAdvance();
      continueAdvance();
      dodgeInstance.switch("light strike", bob);
      expect(tomas.emit).toHaveBeenCalledWith(
        "commitSwitch",
        "light strike",
        bob
      );
      expect(tomas.emit).not.toHaveBeenCalledWith(
        "dodgeCommitMessage",
        "light strike"
      );
    });
  });
  describe("resolve", () => {
    it("advances the 'elapsedRounds' counter on each resolve call", () => {
      expect(dodgeInstance.elapsedRounds).toEqual(0);

      const continueAdvance = generateCombatAndAdvance([
        dodgeInstance,
        bobsGuardInstance,
      ]);
      expect(dodgeInstance.elapsedRounds).toEqual(1);

      continueAdvance();
      expect(dodgeInstance.elapsedRounds).toEqual(2);
    });
    it("at the end of the 2nd round, player enters invulnerability", () => {
      const continueAdvance = generateCombatAndAdvance([
        dodgeInstance,
        bobsGuardInstance,
      ]);
      continueAdvance();
      expect(tomas.emit).not.toHaveBeenCalledWith("dodgeInvulnBegin");
      continueAdvance();
      expect(tomas.emit).toHaveBeenCalledWith("dodgeInvulnBegin");
    });
    it("does not emit an event to mitigate heavy damage if two rounds haven't elapsed", () => {
      advanceRound(dodgeInstance, new Heavy(bob, tomas));
      advanceRound(dodgeInstance, new Light(bob, tomas));
      expect(tomas.emit).not.toHaveBeenCalledWith("heavyDodge", bob);
      expect(tomas.emit).not.toHaveBeenCalledWith("lightDodge", bob);
    });
    it("does emit an event to mitigate heavy damage if two rounds have elapsed", () => {
      const bobsHeavy = new Heavy(bob, tomas);
      bobsHeavy.setReady();
      advanceRound(dodgeInstance, bobsGuardInstance);
      advanceRound(dodgeInstance, bobsGuardInstance);

      advanceRound(dodgeInstance, bobsHeavy);
      expect(tomas.emit).toHaveBeenCalledWith("heavyDodge", bob);
    });
    it("does emit an event to mitigate light damage if light and dodge are ready", () => {
      const bobsLightInstance = new Light(bob, tomas);

      for (let i = 0; i < dodgeInstance.config.castTime; i++) {
        expect(tomas.emit).not.toHaveBeenCalledWith("lightDodge", bob);
        advanceRound(dodgeInstance, bobsLightInstance);
      }
      expect(tomas.emit).toHaveBeenCalledWith("lightDodge", bob);
    });
    it.todo("activates the mitigation method on the incoming damage obj");
  });
});
