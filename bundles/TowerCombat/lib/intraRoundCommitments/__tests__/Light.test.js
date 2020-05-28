const Light = require("../Light");
const Guard = require("../Guard");
const Parry = require("../Parry");
const Dodge = require("../Dodge");
const { generatePlayer, advanceRound } = require("../../__tests__/helperFns");
const config = require("../configuration");

describe("Light", () => {
  let tomas, bob, lightInstance, bobsGuardInstance;
  beforeEach(() => {
    tomas = generatePlayer();
    tomas.emit = jest.fn();
    bob = generatePlayer();
    lightInstance = new Light(tomas, bob);
    bobsGuardInstance = new Guard(bob, tomas);
  });
  it("triggers the newLight event when instantiated", () => {
    expect(tomas.emit).toHaveBeenCalledWith("newLight", bob);
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
          "lightCommitMessage",
          "light strike"
        );

        for (let i = 0; i < roundsToElapse; i++) {
          advanceRound(lightInstance, bobsGuardInstance);
          expect(lightInstance.elapsedRounds).toBe(i + 1);
        }

        lightInstance.switch("light strike", bob);
        expect(tomas.emit).not.toHaveBeenCalledWith(
          "commitSwitch",
          "light strike",
          bob
        );

        expect(tomas.emit).toHaveBeenCalledWith(
          "lightCommitMessage",
          "light strike"
        );
      }
    );
    it("allows switch after 4 rounds elapsed", () => {
      advanceRound(lightInstance, bobsGuardInstance);
      advanceRound(lightInstance, bobsGuardInstance);
      advanceRound(lightInstance, bobsGuardInstance);
      advanceRound(lightInstance, bobsGuardInstance);
      lightInstance.switch("dodge", bob);
      expect(tomas.emit).toHaveBeenCalledWith("commitSwitch", "dodge", bob);
      expect(tomas.emit).not.toHaveBeenCalledWith(
        "lightCommitMessage",
        "dodge"
      );
    });
  });
  describe("postRoundProcess", () => {
    it("advances the 'elapsedRounds' counter on each resolve call", () => {
      expect(lightInstance.elapsedRounds).toEqual(0);

      advanceRound(lightInstance, bobsGuardInstance);
      expect(lightInstance.elapsedRounds).toEqual(1);

      advanceRound(lightInstance, bobsGuardInstance);
      expect(lightInstance.elapsedRounds).toEqual(2);
    });
    it("At T-0, begin to resolve a strike", () => {
      advanceRound(lightInstance, bobsGuardInstance);
      advanceRound(lightInstance, bobsGuardInstance);
      advanceRound(lightInstance, bobsGuardInstance);
      expect(lightInstance.ready).not.toBeTruthy();

      advanceRound(lightInstance, bobsGuardInstance);
      expect(lightInstance.ready).toBeTruthy();
    });
    it("against guard, correctly mitigates", () => {
      advanceRound(lightInstance, bobsGuardInstance);
      expect(lightInstance.strike.mitigated.mult).toBeFalsy();

      lightInstance.setReady();

      advanceRound(lightInstance, bobsGuardInstance);
      expect(lightInstance.strike.mitigated.mult).toBe(0.75);
    });
    it("when striking against a prepared dodge, records correctly", () => {
      const bobsDodgeInstance = new Dodge(bob, tomas);

      advanceRound(lightInstance, bobsDodgeInstance);
      expect(lightInstance.strike.mitigated.avoided).toBeFalsy();

      bobsDodgeInstance.setReady();
      lightInstance.setReady();

      advanceRound(lightInstance, bobsDodgeInstance);
      expect(lightInstance.strike.mitigated.avoided).toBeTruthy();
    });
    it("when striking against a prepared parry, records correctly", () => {
      const bobsParryInstance = new Parry(bob, tomas);

      advanceRound(lightInstance, bobsParryInstance);
      expect(lightInstance.strike.mitigated.mult).not.toBe(0.74);

      bobsParryInstance.setReady();
      lightInstance.setReady();

      advanceRound(lightInstance, bobsParryInstance);
      expect(lightInstance.strike.mitigated.mult).toBe(0.5);
    });
    it("when striking against a near parry, records correctly", () => {
      const bobsParryInstance = new Parry(bob, tomas);
      const lightType = lightInstance.damageType;
      const bobsMitigation =
        bobsParryInstance.config.mitigationFactors[lightType];

      advanceRound(lightInstance, bobsParryInstance);
      expect(lightInstance.strike.mitigated.mult).toBeFalsy();

      bobsParryInstance.setReady();
      lightInstance.setReady();

      advanceRound(lightInstance, bobsParryInstance);
      expect(lightInstance.strike.mitigated.mult).toBe(bobsMitigation);
    });
  });
});
