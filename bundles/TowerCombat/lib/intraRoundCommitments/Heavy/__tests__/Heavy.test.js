const Heavy = require("..");
const Guard = require("../../Guard");
const Parry = require("../../Parry");
const Dodge = require("../../Dodge");
const { heavyEmits } = require("../heavy.enum");
const { commandTypes } = require("../../commands.enum");
const {
  generatePlayer,
  advanceRound,
  generateCombatAndAdvance,
} = require("../../../__tests__/helperFns");
const perceptionEnums = require("../../../Perception/percept.enum");

describe("Heavy", () => {
  let tomas, bob, heavyInstance, bobsGuardInstance;
  beforeEach(() => {
    [tomas] = generatePlayer();
    [bob] = generatePlayer();
    heavyInstance = new Heavy(tomas, bob);
    bobsGuardInstance = new Guard(bob, tomas);
  });
  it("triggers the NEW_HEAVY event when instantiated", () => {
    expect(tomas.emit).toHaveBeenCalledWith(heavyEmits.NEW_HEAVY, bob);
  });

  it("is recognized as an instance of itself", () => {
    // this seems redundant, but I use this method for some dynamic checking in the command handler
    expect(heavyInstance.isInstanceOf(heavyInstance.config.type)).toBeTruthy();
  });

  describe("switch", () => {
    const roundCount = [0, 1, 2, 3, 4, 5];
    it.each(roundCount)(
      "does not allow a switch if only %p rounds have elapsed",
      (roundsToElapse) => {
        expect(tomas.emit).not.toHaveBeenCalledWith(
          heavyEmits.HEAVY_COMMIT_ERROR,
          commandTypes.HEAVY
        );

        for (let i = 0; i < roundsToElapse; i++) {
          advanceRound(heavyInstance, bobsGuardInstance);
          expect(heavyInstance.elapsedRounds).toBe(i + 1);
        }

        heavyInstance.switch(commandTypes.HEAVY, bob);
        expect(tomas.emit).not.toHaveBeenCalledWith(
          "commitSwitch",
          commandTypes.HEAVY,
          bob
        );

        expect(tomas.emit).toHaveBeenCalledWith(
          heavyEmits.HEAVY_COMMIT_ERROR,
          commandTypes.HEAVY
        );
      }
    );
    it("allows switch after 6 rounds elapsed", () => {
      const advanceRound = generateCombatAndAdvance([
        heavyInstance,
        bobsGuardInstance,
      ]);
      advanceRound();
      advanceRound();
      advanceRound();
      advanceRound();
      advanceRound();
      heavyInstance.switch(commandTypes.DODGE, bob);
      expect(tomas.emit).toHaveBeenCalledWith(
        "commitSwitch",
        commandTypes.DODGE,
        bob
      );
      expect(tomas.emit).not.toHaveBeenCalledWith(
        heavyEmits.HEAVY_COMMIT_ERROR,
        commandTypes.DODGE
      );
    });
  });
  describe("compareAndApply", () => {
    it("advances the 'elapsedRounds' counter on each resolve call", () => {
      expect(heavyInstance.elapsedRounds).toEqual(0);

      const advanceRound = generateCombatAndAdvance([
        heavyInstance,
        bobsGuardInstance,
      ]);
      expect(heavyInstance.elapsedRounds).toEqual(1);

      advanceRound();
      expect(heavyInstance.elapsedRounds).toEqual(2);
    });
    it("At T-0, begin to resolve a strike", () => {
      const advanceRound = generateCombatAndAdvance([
        heavyInstance,
        bobsGuardInstance,
      ]);
      advanceRound();
      advanceRound();
      advanceRound();
      advanceRound();
      expect(heavyInstance.ready).not.toBeTruthy();

      advanceRound();
      expect(heavyInstance.ready).toBeTruthy();
    });
    it("against guard, correctly mitigates", () => {
      const advanceRound = generateCombatAndAdvance([
        heavyInstance,
        bobsGuardInstance,
      ]);
      expect(heavyInstance.mitigated.mult).toBe(1);

      heavyInstance.setReady();

      advanceRound();
      expect(heavyInstance.mitigated.mult).toBe(0.75);
    });
    it("when striking against a prepared dodge, records correctly", () => {
      const bobsDodgeInstance = new Dodge(bob, tomas);

      const advanceRound = generateCombatAndAdvance([
        heavyInstance,
        bobsDodgeInstance,
      ]);
      expect(heavyInstance.mitigated.avoided).toBeFalsy();

      bobsDodgeInstance.setReady();
      heavyInstance.setReady();

      advanceRound(heavyInstance, bobsDodgeInstance);
      expect(heavyInstance.mitigated.avoided).toBeTruthy();
    });
    it("when striking against a prepared parry, records correctly", () => {
      const bobsParryInstance = new Parry(bob, tomas);

      const advanceRound = generateCombatAndAdvance([
        heavyInstance,
        bobsParryInstance,
      ]);
      expect(heavyInstance.mitigated.mult).not.toBe(0.74);

      bobsParryInstance.setReady();
      heavyInstance.setReady();

      advanceRound();
      expect(heavyInstance.mitigated.mult).toBe(0.5);
    });
    it("when striking against a near parry, records correctly", () => {
      const bobsParryInstance = new Parry(bob, tomas);
      const heavyType = heavyInstance.damageType;
      const bobsMitigation =
        bobsParryInstance.config.mitigationFactors[heavyType];
      const advanceRound = generateCombatAndAdvance([
        heavyInstance,
        bobsParryInstance,
      ]);
      expect(heavyInstance.mitigated.mult).toBe(1);

      bobsParryInstance.setReady();
      heavyInstance.setReady();

      advanceRound();
      expect(heavyInstance.mitigated.mult).toBe(bobsMitigation);
    });
  });
  describe("perception", () => {
    it("returns correct string in a success scenario", () => {
      const perceptionMap = heavyInstance.perceptMap;
      const bobsParryInstance = new Parry(bob, tomas);
      expect(heavyInstance.percept(perceptionEnums.SUCCESS)).toContain(
        perceptionMap[perceptionEnums.SUCCESS][0]({ name: tomas.name })
      );
      const continueAdvance = generateCombatAndAdvance([
        heavyInstance,
        bobsParryInstance,
      ]);
      expect(heavyInstance.percept(perceptionEnums.SUCCESS)).toContain(
        perceptionMap[perceptionEnums.SUCCESS][1]({ name: tomas.name })
      );
      continueAdvance();
      expect(heavyInstance.percept(perceptionEnums.SUCCESS)).toContain(
        perceptionMap[perceptionEnums.SUCCESS][2]({ name: tomas.name })
      );
      continueAdvance();
      expect(heavyInstance.percept(perceptionEnums.SUCCESS)).toContain(
        perceptionMap[perceptionEnums.SUCCESS][3]({ name: tomas.name })
      );
      continueAdvance();
      expect(heavyInstance.percept(perceptionEnums.SUCCESS)).toContain(
        perceptionMap[perceptionEnums.SUCCESS][4]({ name: tomas.name })
      );
      continueAdvance();
      expect(heavyInstance.percept(perceptionEnums.SUCCESS)).toContain(
        perceptionMap[perceptionEnums.SUCCESS][5]({ name: tomas.name })
      );
    });
    it("returns the correct string in a partial success scenario", () => {
      const bobsParryInstance = new Parry(bob, tomas);
      expect(heavyInstance.percept(perceptionEnums.PARTIAL_SUCCESS)).toContain(
        "takes an aggressive stance"
      );
      const continueAdvance = generateCombatAndAdvance([
        heavyInstance,
        bobsParryInstance,
      ]);
      expect(heavyInstance.percept(perceptionEnums.PARTIAL_SUCCESS)).toContain(
        "takes an aggressive stance"
      );
      continueAdvance();
      expect(heavyInstance.percept(perceptionEnums.PARTIAL_SUCCESS)).toContain(
        "takes an aggressive stance"
      );
      continueAdvance();
      expect(heavyInstance.percept(perceptionEnums.PARTIAL_SUCCESS)).toContain(
        "takes an aggressive stance"
      );
    });
  });
});
