const Guard = require("../Guard");
const Light = require("../Light");
const Heavy = require("../Heavy");
const { generatePlayer } = require("../../__tests__/helperFns");

describe("Guard", () => {
  it("triggers the newGuard event when instantiated", () => {
    const tomas = generatePlayer();
    tomas.emit = jest.fn();
    const bob = generatePlayer();
    new Guard(tomas, bob);
    expect(tomas.emit).toHaveBeenCalledWith("newGuard", bob);
  });

  it("is recognized as an instance of itself", () => {
    // this seems redundant, but I use this method for some dynamic checking in the command handler
    const tomas = generatePlayer();
    tomas.emit = jest.fn();
    const bob = generatePlayer();
    const guardObj = new Guard(tomas, bob);
    expect(guardObj.isInstanceOf(guardObj.config.type)).toBeTruthy();
  });

  describe("switch", () => {
    it("emits the event for action change", () => {
      const tomas = generatePlayer();
      tomas.emit = jest.fn();
      const bob = generatePlayer();
      const guardObj = new Guard(tomas, bob);
      guardObj.switch("light strike", bob);
      expect(tomas.emit).toHaveBeenCalledWith(
        "commitSwitch",
        "light strike",
        bob
      );
    });
    it("does not emit 'guardDodgeAdvantage' if a dodge is next but two rounds haven't elapsed", () => {
      const tomas = generatePlayer();
      tomas.emit = jest.fn();
      const bob = generatePlayer();
      const guardObj = new Guard(tomas, bob);
      guardObj.switch("dodge", bob);
      expect(tomas.emit).not.toHaveBeenCalledWith("guardDodgeAdvantage");
      expect(tomas.emit).toHaveBeenCalledWith("commitSwitch", "dodge", bob);
    });
    it("emits 'guardDodgeAdvantage' if a dodge is next but two rounds haven't elapsed", () => {
      const tomas = generatePlayer();
      tomas.emit = jest.fn();
      const bob = generatePlayer();
      const guardObj = new Guard(tomas, bob);
      guardObj.resolve(null);
      guardObj.resolve(null);
      guardObj.switch("dodge", bob);
      expect(tomas.emit).toHaveBeenCalledWith("guardDodgeAdvantage");
      expect(tomas.emit).toHaveBeenCalledWith("commitSwitch", "dodge", bob);
    });
    it("does not emit 'guardDodgeAdvantage' when switched to any other commandType", () => {
      const tomas = generatePlayer();
      tomas.emit = jest.fn();
      const bob = generatePlayer();
      const guardObj = new Guard(tomas, bob);
      guardObj.resolve(null);
      guardObj.switch("light strike", bob);
      expect(tomas.emit).not.toHaveBeenCalledWith("guardDodgeAdvantage");
      expect(tomas.emit).toHaveBeenCalledWith(
        "commitSwitch",
        "light strike",
        bob
      );
    });
  });
  describe("resolve", () => {
    it("advances the 'elapsedRounds' counter on each resolve call", () => {
      const tomas = generatePlayer();
      tomas.emit = jest.fn();
      const bob = generatePlayer();
      const guardObj = new Guard(tomas, bob);
      expect(guardObj.elapsedRounds).toEqual(0);
      guardObj.resolve(null);
      expect(guardObj.elapsedRounds).toEqual(1);
      guardObj.resolve(null);
      expect(guardObj.elapsedRounds).toEqual(2);
      expect(tomas.emit).not.toHaveBeenCalledWith("guardLightMitigate");
      expect(tomas.emit).not.toHaveBeenCalledWith("guardHeavyMitigate");
    });
    it("emits an event to mitigate light damage", () => {
      const tomas = generatePlayer();
      tomas.emit = jest.fn();
      const bob = generatePlayer();
      const guardObj = new Guard(tomas, bob);
      expect(guardObj.elapsedRounds).toEqual(0);
      guardObj.resolve(new Light(bob, tomas));
      expect(guardObj.elapsedRounds).toEqual(1);
      expect(tomas.emit).toHaveBeenCalledWith("guardLightMitigate");
    });
    it("emits an event to mitigate heavy damage", () => {
      const tomas = generatePlayer();
      tomas.emit = jest.fn();
      const bob = generatePlayer();
      const guardObj = new Guard(tomas, bob);
      expect(guardObj.elapsedRounds).toEqual(0);
      guardObj.resolve(new Heavy(bob, tomas));
      expect(guardObj.elapsedRounds).toEqual(1);
      expect(tomas.emit).toHaveBeenCalledWith("guardHeavyMitigate");
    });
    it.todo("activates the mitigation method on the incoming damage obj");
  });
});
