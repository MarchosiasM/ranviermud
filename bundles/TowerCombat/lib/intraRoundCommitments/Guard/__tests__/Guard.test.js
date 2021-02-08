const Guard = require("../");
const Light = require("../../Light");
const Heavy = require("../../Heavy");
const {
  generatePlayer,
  generateCombatAndAdvance,
} = require("../../../__tests__/helperFns");
const perceptionEnums = require("../../../Perception/percept.enum");
const { guardEmits } = require("../Guard.enum");

describe("Guard", () => {
  let tomas, bob, guardInstance, bobsGuardInstance, tomasEmit;
  beforeEach(() => {
    [tomas, tomasEmit] = generatePlayer();
    [bob] = generatePlayer();
    guardInstance = new Guard(tomas, bob);
    bobsGuardInstance = new Guard(bob, tomas);
  });
  it("triggers the newGuard event when instantiated", () => {
    expect(tomasEmit).toHaveBeenCalledWith(guardEmits.NEW_GUARD, bob);
  });

  it("is recognized as an instance of itself", () => {
    // this seems redundant, but I use this method for some dynamic checking in the command handler
    expect(guardInstance.isInstanceOf(guardInstance.config.type)).toBeTruthy();
  });

  describe("switch", () => {
    it("emits the event for action change", () => {
      guardInstance.switch("light strike", bob);
      expect(tomasEmit).toHaveBeenCalledWith(
        "commitSwitch",
        "light strike",
        bob
      );
    });

    it("does not emit 'guardDodgeAdvantage' if a dodge is next but two rounds haven't elapsed", () => {
      guardInstance.switch("dodge", bob);
      expect(tomasEmit).not.toHaveBeenCalledWith(
        guardEmits.GUARD_DODGE_ADVANTAGE
      );
      expect(tomasEmit).toHaveBeenCalledWith("commitSwitch", "dodge", bob);
    });
    it("emits 'guardDodgeAdvantage' if a dodge is next but two rounds haven't elapsed", () => {
      const continueAdvance = generateCombatAndAdvance([
        guardInstance,
        bobsGuardInstance,
      ]);
      continueAdvance();
      guardInstance.switch("dodge", bob);
      expect(tomasEmit).toHaveBeenCalledWith(guardEmits.GUARD_DODGE_ADVANTAGE);
      expect(tomasEmit).toHaveBeenCalledWith("commitSwitch", "dodge", bob);
    });
    it("does not emit 'guardDodgeAdvantage' when switched to any other commandType", () => {
      const continueAdvance = generateCombatAndAdvance([
        guardInstance,
        bobsGuardInstance,
      ]);
      continueAdvance();
      guardInstance.switch("light strike", bob);
      expect(tomasEmit).not.toHaveBeenCalledWith(
        guardEmits.GUARD_DODGE_ADVANTAGE
      );
      expect(tomasEmit).toHaveBeenCalledWith(
        "commitSwitch",
        "light strike",
        bob
      );
    });
  });
  describe("compareAndApply", () => {
    it("advances the 'elapsedRounds' counter on each resolve call", () => {
      expect(guardInstance.elapsedRounds).toEqual(0);

      const continueAdvance = generateCombatAndAdvance([
        guardInstance,
        bobsGuardInstance,
      ]);
      continueAdvance();
      expect(tomasEmit).not.toHaveBeenCalledWith(
        guardEmits.GUARD_MITIGATE_LIGHT
      );
      continueAdvance();
      expect(tomasEmit).not.toHaveBeenCalledWith(
        guardEmits.GUARD_MITIGATE_HEAVY
      );
    });
    it("emits an event to mitigate light damage when the strike is ready", () => {
      const bobsLightInstance = new Light(bob, tomas);
      expect(tomasEmit).not.toHaveBeenCalledWith(
        guardEmits.GUARD_MITIGATE_LIGHT
      );

      bobsLightInstance.setReady();
      generateCombatAndAdvance([guardInstance, bobsLightInstance]);

      expect(tomasEmit).toHaveBeenCalledWith(guardEmits.GUARD_MITIGATE_LIGHT);
    });
    it("emits an event to mitigate heavy damage", () => {
      const bobsHeavyInstance = new Heavy(bob, tomas);
      expect(tomasEmit).not.toHaveBeenCalledWith(
        guardEmits.GUARD_MITIGATE_HEAVY
      );
      const continueAdvance = generateCombatAndAdvance([
        guardInstance,
        bobsHeavyInstance,
      ]);
      expect(tomasEmit).not.toHaveBeenCalledWith(
        guardEmits.GUARD_MITIGATE_HEAVY
      );
      continueAdvance(); // 1-2
      expect(tomasEmit).not.toHaveBeenCalledWith(
        guardEmits.GUARD_MITIGATE_HEAVY
      );
      continueAdvance();
      expect(tomasEmit).not.toHaveBeenCalledWith(
        guardEmits.GUARD_MITIGATE_HEAVY
      );
      continueAdvance();
      expect(tomasEmit).not.toHaveBeenCalledWith(
        guardEmits.GUARD_MITIGATE_HEAVY
      );
      continueAdvance();
      expect(tomasEmit).not.toHaveBeenCalledWith(
        guardEmits.GUARD_MITIGATE_HEAVY
      );
      continueAdvance();
      expect(tomasEmit).toHaveBeenCalledWith(guardEmits.GUARD_MITIGATE_HEAVY);
    });
  });
  describe("perception", () => {
    it("returns correct string in a success scenario", () => {
      const perceptionMap = guardInstance.perceptMap;
      const bobsLightInstance = new Light(bob, tomas);
      expect(guardInstance.percept(perceptionEnums.SUCCESS)).toContain(
        perceptionMap[perceptionEnums.SUCCESS]({ name: tomas.name })
      );
      const continueAdvance = generateCombatAndAdvance([
        guardInstance,
        bobsLightInstance,
      ]);
      expect(guardInstance.percept(perceptionEnums.SUCCESS)).toContain(
        perceptionMap[perceptionEnums.SUCCESS]({ name: tomas.name })
      );
      continueAdvance();
      expect(guardInstance.percept(perceptionEnums.SUCCESS)).toContain(
        perceptionMap[perceptionEnums.SUCCESS]({ name: tomas.name })
      );
      continueAdvance();
      expect(guardInstance.percept(perceptionEnums.SUCCESS)).toContain(
        perceptionMap[perceptionEnums.SUCCESS]({ name: tomas.name })
      );
      continueAdvance();
      expect(guardInstance.percept(perceptionEnums.SUCCESS)).toContain(
        perceptionMap[perceptionEnums.SUCCESS]({ name: tomas.name })
      );
    });
    it("returns the correct string in a partial success scenario", () => {
      expect(
        typeof guardInstance.percept(perceptionEnums.PARTIAL_SUCCESS)
      ).toBe("string");
    });
  });
});
