const Guard = require("../../Guard");
const Light = require("../../Light");
const Heavy = require("../../Heavy");
const Dodge = require("../index");
const {
  generatePlayer,
  advanceRound,
  generateCombatAndAdvance,
} = require("../../../__tests__/helperFns");
const { dodgeEmit } = require("../Dodge.enum");
const perceptionEnums = require("../../../Perception/percept.enum");

describe("Dodge", () => {
  let tomas, bob, dodgeInstance, bobsGuardInstance;
  beforeEach(() => {
    [tomas] = generatePlayer();
    [bob] = generatePlayer();
    dodgeInstance = new Dodge(tomas, bob);
    bobsGuardInstance = new Guard(bob, tomas);
  });
  it("triggers the newGuard event when instantiated", () => {
    expect(tomas.emit).toHaveBeenCalledWith(dodgeEmit.NEW_DODGE, bob);
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
          dodgeEmit.DODGE_COMMIT_ERROR,
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
          dodgeEmit.DODGE_COMMIT_ERROR,
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
        dodgeEmit.DODGE_COMMIT_ERROR,
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
    it("in the third round, player is invulnerable", () => {
      const continueAdvance = generateCombatAndAdvance([
        dodgeInstance,
        bobsGuardInstance,
      ]);
      continueAdvance();
      expect(tomas.emit).not.toHaveBeenCalledWith(dodgeEmit.DODGE_INVULN_BEGIN);
      continueAdvance();
      expect(tomas.emit).toHaveBeenCalledWith(dodgeEmit.DODGE_INVULN_BEGIN);
    });
    it("does not emit an event to mitigate heavy damage if two rounds haven't elapsed", () => {
      advanceRound(dodgeInstance, new Heavy(bob, tomas));
      advanceRound(dodgeInstance, new Light(bob, tomas));
      expect(tomas.emit).not.toHaveBeenCalledWith(dodgeEmit.HEAVY_DODGE, bob);
      expect(tomas.emit).not.toHaveBeenCalledWith(dodgeEmit.LIGHT_DODGE, bob);
    });
    it("does emit an event to mitigate heavy damage if two rounds have elapsed", () => {
      const bobsHeavy = new Heavy(bob, tomas);
      bobsHeavy.setReady();
      advanceRound(dodgeInstance, bobsGuardInstance);
      advanceRound(dodgeInstance, bobsGuardInstance);

      advanceRound(dodgeInstance, bobsHeavy);
      expect(tomas.emit).toHaveBeenCalledWith(dodgeEmit.HEAVY_DODGE, bob);
    });
    it("does emit an event to mitigate light damage if light and dodge are ready", () => {
      const bobsLightInstance = new Light(bob, tomas);

      for (let i = 0; i < dodgeInstance.config.castTime; i++) {
        expect(tomas.emit).not.toHaveBeenCalledWith(dodgeEmit.LIGHT_DODGE, bob);
        advanceRound(dodgeInstance, bobsLightInstance);
      }
      expect(tomas.emit).toHaveBeenCalledWith(dodgeEmit.LIGHT_DODGE, bob);
    });
    it.todo("activates the mitigation method on the incoming damage obj");
  });
  describe("perception", () => {
    it("returns correct string in a success scenario", () => {
      const perceptionMap = dodgeInstance.perceptMap;
      const bobsParryInstance = new Light(bob, tomas);
      expect(dodgeInstance.percept(perceptionEnums.SUCCESS)).toContain(
        perceptionMap[perceptionEnums.SUCCESS][0]({ name: tomas.name })
      );
      const continueAdvance = generateCombatAndAdvance([
        dodgeInstance,
        bobsParryInstance,
      ]);
      expect(dodgeInstance.percept(perceptionEnums.SUCCESS)).toContain(
        perceptionMap[perceptionEnums.SUCCESS][1]({ name: tomas.name })
      );
      continueAdvance();
      expect(dodgeInstance.percept(perceptionEnums.SUCCESS)).toContain(
        perceptionMap[perceptionEnums.SUCCESS][2]({ name: tomas.name })
      );
      continueAdvance();
      expect(dodgeInstance.percept(perceptionEnums.SUCCESS)).toContain(
        perceptionMap[perceptionEnums.SUCCESS][3]({ name: tomas.name })
      );
    });
    it("returns the correct string in a partial success scenario", () => {
      const perceptionMap = dodgeInstance.perceptMap;
      const bobsParryInstance = new Light(bob, tomas);
      expect(dodgeInstance.percept(perceptionEnums.PARTIAL_SUCCESS)).toContain(
        "takes an aggressive stance"
      );
      const continueAdvance = generateCombatAndAdvance([
        dodgeInstance,
        bobsParryInstance,
      ]);
      expect(dodgeInstance.percept(perceptionEnums.PARTIAL_SUCCESS)).toContain(
        perceptionMap[perceptionEnums.PARTIAL_SUCCESS]({ name: tomas.name })
      );
      continueAdvance();
      expect(dodgeInstance.percept(perceptionEnums.PARTIAL_SUCCESS)).toContain(
        perceptionMap[perceptionEnums.PARTIAL_SUCCESS]({ name: tomas.name })
      );
      continueAdvance();
      expect(dodgeInstance.percept(perceptionEnums.PARTIAL_SUCCESS)).toContain(
        perceptionMap[perceptionEnums.PARTIAL_SUCCESS]({ name: tomas.name })
      );
    });
  });
});
