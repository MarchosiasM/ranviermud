const Light = require("../index");
const Guard = require("../../Guard");
const Parry = require("../../Parry");
const Dodge = require("../../Dodge");
const {
  generatePlayer,
  advanceRound,
  generateCombatAndAdvance,
} = require("../../../__tests__/helperFns");
const { lightEmits } = require("../light.enum");
const { commandTypes } = require("../../commands.enum");
const perceptionEnums = require("../../../Perception/percept.enum");

describe("Light", () => {
  let tomas, bob, lightInstance, bobsGuardInstance;
  beforeEach(() => {
    [tomas] = generatePlayer();
    [bob] = generatePlayer();
    lightInstance = new Light(tomas, bob);
    bobsGuardInstance = new Guard(bob, tomas);
  });
  it("triggers the NEW_LIGHT event when instantiated", () => {
    expect(tomas.emit).toHaveBeenCalledWith(lightEmits.NEW_LIGHT, bob);
  });

  it("is recognized as an instance of itself", () => {
    // this seems redundant, but I use this method for some dynamic checking in the command handler
    expect(lightInstance.isInstanceOf(lightInstance.config.type)).toBeTruthy();
  });

  describe("switch", () => {
    const roundCount = [0, 1, 2, 3];
    it.each(roundCount)(
      "does not allow a switch if only %p rounds have elapsed",
      (roundsToElapse) => {
        expect(tomas.emit).not.toHaveBeenCalledWith(
          lightEmits.LIGHT_COMMIT_ERROR,
          commandTypes.LIGHT
        );

        for (let i = 0; i < roundsToElapse; i++) {
          advanceRound(lightInstance, bobsGuardInstance);
          expect(lightInstance.elapsedRounds).toBe(i + 1);
        }

        lightInstance.switch(commandTypes.LIGHT, bob);
        expect(tomas.emit).not.toHaveBeenCalledWith(
          "commitSwitch",
          commandTypes.LIGHT,
          bob
        );

        expect(tomas.emit).toHaveBeenCalledWith(
          lightEmits.LIGHT_COMMIT_ERROR,
          commandTypes.LIGHT
        );
      }
    );
    it("allows switch after 4 rounds elapsed", () => {
      const continueAdvance = generateCombatAndAdvance([
        lightInstance,
        bobsGuardInstance,
      ]);
      continueAdvance();
      continueAdvance();
      continueAdvance();
      lightInstance.switch("dodge", bob);
      expect(tomas.emit).toHaveBeenCalledWith("commitSwitch", "dodge", bob);
      expect(tomas.emit).not.toHaveBeenCalledWith(
        lightEmits.LIGHT_COMMIT_ERROR,
        "dodge"
      );
    });
  });
  describe("compareAndApply", () => {
    it("advances the 'elapsedRounds' counter on each resolve call", () => {
      expect(lightInstance.elapsedRounds).toEqual(0);

      const continueAdvance = generateCombatAndAdvance([
        lightInstance,
        bobsGuardInstance,
      ]);
      expect(lightInstance.elapsedRounds).toEqual(1);

      continueAdvance();
      expect(lightInstance.elapsedRounds).toEqual(2);
    });
    it("At T-0, begin to resolve a strike", () => {
      const continueAdvance = generateCombatAndAdvance([
        lightInstance,
        bobsGuardInstance,
      ]);
      continueAdvance();
      continueAdvance();
      expect(lightInstance.ready).not.toBeTruthy();

      continueAdvance();
      expect(lightInstance.ready).toBeTruthy();
    });
    it("against guard, correctly mitigates", () => {
      const continueAdvance = generateCombatAndAdvance([
        lightInstance,
        bobsGuardInstance,
      ]);
      expect(lightInstance.mitigated.mult).toBe(1);

      lightInstance.setReady();

      continueAdvance();
      expect(lightInstance.mitigated.mult).toBe(0.75);
    });
    it("when striking against a prepared dodge, records correctly", () => {
      const bobsDodgeInstance = new Dodge(bob, tomas);

      const continueAdvance = generateCombatAndAdvance([
        lightInstance,
        bobsDodgeInstance,
      ]);
      expect(lightInstance.mitigated.avoided).toBeFalsy();

      bobsDodgeInstance.setReady();
      lightInstance.setReady();

      continueAdvance(lightInstance, bobsDodgeInstance);
      expect(lightInstance.mitigated.avoided).toBeTruthy();
    });
    it("when striking against a prepared parry, records correctly", () => {
      const bobsParryInstance = new Parry(bob, tomas);

      const continueAdvance = generateCombatAndAdvance([
        lightInstance,
        bobsParryInstance,
      ]);
      expect(lightInstance.mitigated.mult).not.toBe(0.74);

      bobsParryInstance.setReady();
      lightInstance.setReady();

      continueAdvance();
      expect(lightInstance.mitigated.mult).toBe(0.5);
    });
    it("when striking against a near parry, records correctly", () => {
      const bobsParryInstance = new Parry(bob, tomas);
      const lightType = lightInstance.damageType;
      const bobsMitigation =
        bobsParryInstance.config.mitigationFactors[lightType];
      const continueAdvance = generateCombatAndAdvance([
        lightInstance,
        bobsParryInstance,
      ]);
      expect(lightInstance.mitigated.mult).toBe(1);

      bobsParryInstance.setReady();
      lightInstance.setReady();

      continueAdvance();
      expect(lightInstance.mitigated.mult).toBe(bobsMitigation);
    });
  });
  describe("perception", () => {
    it("returns correct string in a success scenario", () => {
      const bobsParryInstance = new Parry(bob, tomas);
      expect(lightInstance.percept(perceptionEnums.SUCCESS)).toContain(
        "prepares a swift attack"
      );
      const continueAdvance = generateCombatAndAdvance([
        lightInstance,
        bobsParryInstance,
      ]);
      expect(lightInstance.percept(perceptionEnums.SUCCESS)).toContain(
        "begins to strike swiftly"
      );
      continueAdvance();
      expect(lightInstance.percept(perceptionEnums.SUCCESS)).toContain(
        "is in the middle of a swift attack"
      );
      continueAdvance();
      expect(lightInstance.percept(perceptionEnums.SUCCESS)).toContain(
        "is executing a swift attack"
      );
    });
    it("returns the correct string in a partial success scenario", () => {
      const bobsParryInstance = new Parry(bob, tomas);
      expect(lightInstance.percept(perceptionEnums.PARTIAL_SUCCESS)).toContain(
        "takes an aggressive stance"
      );
      const continueAdvance = generateCombatAndAdvance([
        lightInstance,
        bobsParryInstance,
      ]);
      expect(lightInstance.percept(perceptionEnums.PARTIAL_SUCCESS)).toContain(
        "takes an aggressive stance"
      );
      continueAdvance();
      expect(lightInstance.percept(perceptionEnums.PARTIAL_SUCCESS)).toContain(
        "takes an aggressive stance"
      );
      continueAdvance();
      expect(lightInstance.percept(perceptionEnums.PARTIAL_SUCCESS)).toContain(
        "takes an aggressive stance"
      );
    });
  });
});
