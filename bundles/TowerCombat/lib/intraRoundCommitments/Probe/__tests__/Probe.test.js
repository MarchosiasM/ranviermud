const Probe = require("../index");
const Light = require("../../Light");
const {
  generatePlayer,
  generateCombatAndAdvance,
} = require("../../../__tests__/helperFns");
const perceptionEnums = require("../../../Perception/percept.enum");
const { probeEmits } = require("../probe.enum");

describe("Probe", () => {
  let tomas, bob, probeInstance, bobsLightInstance;
  beforeEach(() => {
    [tomas] = generatePlayer();
    [bob] = generatePlayer();
    probeInstance = new Probe(tomas, bob);
    bobsLightInstance = new Light(bob, tomas);
  });
  it("triggers the newProbe event when instantiated", () => {
    expect(tomas.emit).toHaveBeenCalledWith(probeEmits.NEW_PROBE, bob);
  });

  it("is recognized as an instance of itself", () => {
    expect(probeInstance.isInstanceOf(probeInstance.config.type)).toBeTruthy();
  });

  it("emits the switch event when switch is called", () => {
    probeInstance.switch("light strike", bob);
    expect(tomas.emit).toHaveBeenCalledWith(
      "commitSwitch",
      "light strike",
      bob
    );
  });

  it("advances the 'elapsedRounds' counter on each resolve call", () => {
    expect(probeInstance.elapsedRounds).toEqual(0);
    const continueAdvance = generateCombatAndAdvance([
      probeInstance,
      bobsLightInstance,
    ]);
    expect(probeInstance.elapsedRounds).toEqual(1);
    continueAdvance();
    expect(probeInstance.elapsedRounds).toEqual(2);
  });

  it("When resolving, rolls the chance for an advantage when two rounds have elapsed", () => {
    const mockRollAdvantageChance = jest.fn();
    probeInstance.rollAdvantageChance = mockRollAdvantageChance;

    expect(mockRollAdvantageChance).not.toHaveBeenCalled();
    const continueAdvance = generateCombatAndAdvance([
      probeInstance,
      bobsLightInstance,
    ]);
    expect(mockRollAdvantageChance).not.toHaveBeenCalled();

    continueAdvance();
    expect(mockRollAdvantageChance).toHaveBeenCalledTimes(1);

    continueAdvance();
    expect(mockRollAdvantageChance).toHaveBeenCalledTimes(2);
  });

  it("statistically speaking this test will fail now and then, but we should expect this test to mostly pass", () => {
    probeInstance.switch("dodge", bob);
    for (let i = 0; i < 100; i++) {
      probeInstance.rollAdvantageChance();
    }
    expect(tomas.emit).toHaveBeenCalledWith(probeEmits.GAIN_ADVANTAGE);
  });
  describe("perception", () => {
    it("returns correct string in a success scenario", () => {
      const perceptionMap = probeInstance.perceptMap;
      const bobsLightInstance = new Light(bob, tomas);
      expect(probeInstance.percept(perceptionEnums.SUCCESS)).toContain(
        perceptionMap[perceptionEnums.SUCCESS]({ name: tomas.name })
      );
      const continueAdvance = generateCombatAndAdvance([
        probeInstance,
        bobsLightInstance,
      ]);
      expect(probeInstance.percept(perceptionEnums.SUCCESS)).toContain(
        perceptionMap[perceptionEnums.SUCCESS]({ name: tomas.name })
      );
      continueAdvance();
      expect(probeInstance.percept(perceptionEnums.SUCCESS)).toContain(
        perceptionMap[perceptionEnums.SUCCESS]({ name: tomas.name })
      );
      continueAdvance();
      expect(probeInstance.percept(perceptionEnums.SUCCESS)).toContain(
        perceptionMap[perceptionEnums.SUCCESS]({ name: tomas.name })
      );
      continueAdvance();
      expect(probeInstance.percept(perceptionEnums.SUCCESS)).toContain(
        perceptionMap[perceptionEnums.SUCCESS]({ name: tomas.name })
      );
    });
    it("returns the correct string in a partial success scenario", () => {
      expect(
        typeof probeInstance.percept(perceptionEnums.PARTIAL_SUCCESS)
      ).toBe("string");
    });
  });
});
