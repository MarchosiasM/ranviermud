const Probe = require("../Probe");
const { generatePlayer } = require("../../__tests__/helperFns");

describe("Probe", () => {
  it("triggers the newProbe event when instantiated", () => {
    const tomas = generatePlayer();
    tomas.emit = jest.fn();
    const bob = generatePlayer();
    new Probe(tomas, bob);
    expect(tomas.emit).toHaveBeenCalledWith("newProbe", bob);
  });

  it("is recognized as an instance of itself", () => {
    // this seems redundant, but I use this method for some dynamic checking in the command handler
    const tomas = generatePlayer();
    tomas.emit = jest.fn();
    const bob = generatePlayer();
    const probeObj = new Probe(tomas, bob);
    expect(probeObj.isInstanceOf(probeObj.config.type)).toBeTruthy();
  });

  it("emits the switch event when switch is called", () => {
    const tomas = generatePlayer();
    tomas.emit = jest.fn();
    const bob = generatePlayer();
    const probeObj = new Probe(tomas, bob);
    probeObj.switch("light strike", bob);
    expect(tomas.emit).toHaveBeenCalledWith(
      "commitSwitch",
      "light strike",
      bob
    );
  });

  it("advances the 'elapsedRounds' counter on each resolve call", () => {
    const tomas = generatePlayer();
    tomas.emit = jest.fn();
    const bob = generatePlayer();
    const probeObj = new Probe(tomas, bob);
    expect(probeObj.elapsedRounds).toEqual(0);
    probeObj.resolve(null);
    expect(probeObj.elapsedRounds).toEqual(1);
    probeObj.resolve(null);
    expect(probeObj.elapsedRounds).toEqual(2);
  });

  it("When resolving, rolls the chance for an advantage when two rounds have elapsed", () => {
    const tomas = generatePlayer();
    tomas.emit = jest.fn();
    const bob = generatePlayer();
    const probeObj = new Probe(tomas, bob);

    const mockRollAdvantageChance = jest.fn();
    probeObj.rollAdvantageChance = mockRollAdvantageChance;

    expect(mockRollAdvantageChance).not.toHaveBeenCalled();

    probeObj.resolve(null); // terminus rnd 1
    expect(mockRollAdvantageChance).not.toHaveBeenCalled();

    probeObj.resolve(null); // terminus rnd 2
    expect(mockRollAdvantageChance).toHaveBeenCalledTimes(1);

    probeObj.resolve(null); // terminus rnd 3
    expect(mockRollAdvantageChance).toHaveBeenCalledTimes(2);
  });

  it("statistically speaking this test will fail now and then, but we should expect this test to mostly pass", () => {
    const tomas = generatePlayer();
    tomas.emit = jest.fn();
    const bob = generatePlayer();
    const probeObj = new Probe(tomas, bob);
    probeObj.switch("dodge", bob);
    for (let i = 0; i < 40; i++) {
      probeObj.rollAdvantageChance();
    }
    expect(tomas.emit).toHaveBeenCalledWith("probeGainAdvantage");
  });
});
