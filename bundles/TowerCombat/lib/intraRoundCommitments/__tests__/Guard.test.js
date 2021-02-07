const Guard = require("../Guard");
const Light = require("../Light");
const Heavy = require("../Heavy");
const {
  generatePlayer,
  generateCombatAndAdvance,
} = require("../../__tests__/helperFns");

describe("Guard", () => {
  let tomas, bob, guardInstance, bobsGuardInstance, tomasEmit;
  beforeEach(() => {
    [tomas, tomasEmit] = generatePlayer();
    [bob] = generatePlayer();
    guardInstance = new Guard(tomas, bob);
    bobsGuardInstance = new Guard(bob, tomas);
  });
  it("triggers the newGuard event when instantiated", () => {
    expect(tomasEmit).toHaveBeenCalledWith("newGuard", bob);
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
      expect(tomasEmit).not.toHaveBeenCalledWith("guardDodgeAdvantage");
      expect(tomasEmit).toHaveBeenCalledWith("commitSwitch", "dodge", bob);
    });
    it("emits 'guardDodgeAdvantage' if a dodge is next but two rounds haven't elapsed", () => {
      const continueAdvance = generateCombatAndAdvance([
        guardInstance,
        bobsGuardInstance,
      ]);
      continueAdvance();
      guardInstance.switch("dodge", bob);
      expect(tomasEmit).toHaveBeenCalledWith("guardDodgeAdvantage");
      expect(tomasEmit).toHaveBeenCalledWith("commitSwitch", "dodge", bob);
    });
    it("does not emit 'guardDodgeAdvantage' when switched to any other commandType", () => {
      const continueAdvance = generateCombatAndAdvance([
        guardInstance,
        bobsGuardInstance,
      ]);
      continueAdvance();
      guardInstance.switch("light strike", bob);
      expect(tomasEmit).not.toHaveBeenCalledWith("guardDodgeAdvantage");
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
      expect(guardInstance.elapsedRounds).toEqual(1);

      continueAdvance(guardInstance, bobsGuardInstance);
      expect(guardInstance.elapsedRounds).toEqual(2);
      expect(tomasEmit).not.toHaveBeenCalledWith("guardLightMitigate");
      expect(tomasEmit).not.toHaveBeenCalledWith("guardHeavyMitigate");
    });
    it("emits an event to mitigate light damage when the strike is ready", () => {
      const bobsLightInstance = new Light(bob, tomas);
      expect(tomasEmit).not.toHaveBeenCalledWith("guardLightMitigate");

      bobsLightInstance.setReady();
      generateCombatAndAdvance([guardInstance, bobsLightInstance]);

      expect(tomasEmit).toHaveBeenCalledWith("guardLightMitigate");
    });
    xit("emits an event to mitigate heavy damage", () => {
      guardInstance.resolve(new Heavy(bob, tomas));
      expect(guardInstance.elapsedRounds).toEqual(1);
      expect(tomasEmit).toHaveBeenCalledWith("guardHeavyMitigate");
    });
  });
});
