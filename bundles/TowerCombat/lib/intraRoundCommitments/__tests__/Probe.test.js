const Probe = require("../Probe");
const Light = require("../Light");
const { generatePlayer, advanceRound } = require("../../__tests__/helperFns");

describe("Probe", () => {
  let tomas, bob, probeInstance, bobsLightInstance;
  beforeEach(() => {
    tomas = generatePlayer();
    tomas.emit = jest.fn();
    bob = generatePlayer();
    probeInstance = new Probe(tomas, bob);
    bobsLightInstance = new Light(bob, tomas);
  });
  it("triggers the newProbe event when instantiated", () => {
    expect(tomas.emit).toHaveBeenCalledWith("newProbe", bob);
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
    advanceRound(probeInstance, bobsLightInstance);
    expect(probeInstance.elapsedRounds).toEqual(1);
    advanceRound(probeInstance, bobsLightInstance);
    expect(probeInstance.elapsedRounds).toEqual(2);
  });

  it("When resolving, rolls the chance for an advantage when two rounds have elapsed", () => {
    const mockRollAdvantageChance = jest.fn();
    probeInstance.rollAdvantageChance = mockRollAdvantageChance;

    expect(mockRollAdvantageChance).not.toHaveBeenCalled();

    advanceRound(probeInstance, bobsLightInstance);
    expect(mockRollAdvantageChance).not.toHaveBeenCalled();

    advanceRound(probeInstance, bobsLightInstance);
    expect(mockRollAdvantageChance).toHaveBeenCalledTimes(1);

    advanceRound(probeInstance, bobsLightInstance);
    expect(mockRollAdvantageChance).toHaveBeenCalledTimes(2);
  });

  it("statistically speaking this test will fail now and then, but we should expect this test to mostly pass", () => {
    probeInstance.switch("dodge", bob);
    for (let i = 0; i < 40; i++) {
      probeInstance.rollAdvantageChance();
    }
    expect(tomas.emit).toHaveBeenCalledWith("probeGainAdvantage");
  });
});
