const Light = require("../Light");
const Heavy = require("../Heavy");
const Parry = require("../Parry");
const { generatePlayer } = require("../../__tests__/helperFns");

describe("Dodge", () => {
  let tomas, bob, parryInstance;
  beforeEach(() => {
    tomas = generatePlayer();
    tomas.emit = jest.fn();
    bob = generatePlayer();
    parryInstance = new Parry(tomas, bob);
  });
  it("triggers the newParry event when instantiated", () => {
    expect(tomas.emit).toHaveBeenCalledWith("newParry", bob);
  });

  it("is recognized as an instance of itself", () => {
    // this seems redundant, but I use this method for some dynamic checking in the command handler
    expect(parryInstance.isInstanceOf(parryInstance.config.type)).toBeTruthy();
  });

  describe("switch", () => {
    const roundCount = [0, 1];
    it.each(roundCount)(
      "does not allow a switch if only %p rounds have elapsed",
      (roundsToElapse) => {
        expect(tomas.emit).not.toHaveBeenCalledWith(
          "dodgeCommitMessage",
          "light strike"
        );
        for (let i = 0; i < roundsToElapse; i++) {
          parryInstance.resolve(null); // resolves a round
        }
        parryInstance.switch("light strike", bob);
        expect(tomas.emit).not.toHaveBeenCalledWith(
          "commitSwitch",
          "light strike",
          bob
        );
        expect(tomas.emit).toHaveBeenCalledWith(
          "parryCommitMessage",
          "light strike"
        );
      }
    );
    it("allows switch after 2 rounds elapsed", () => {
      parryInstance.resolve(null);
      parryInstance.resolve(null);
      parryInstance.switch("light strike", bob);
      expect(tomas.emit).toHaveBeenCalledWith(
        "commitSwitch",
        "light strike",
        bob
      );
      expect(tomas.emit).not.toHaveBeenCalledWith(
        "parryCommitMessage",
        "light strike"
      );
    });
  });
  describe("resolve", () => {
    it("advances the 'elapsedRounds' counter on each resolve call", () => {
      expect(parryInstance.elapsedRounds).toEqual(0);
      parryInstance.resolve(null);
      expect(parryInstance.elapsedRounds).toEqual(1);
      parryInstance.resolve(null);
      expect(parryInstance.elapsedRounds).toEqual(2);
    });
    it("At T-1, emit a message signaling the player they're ready to parry", () => {
      expect(tomas.emit).not.toHaveBeenCalledWith("parryPreparedMessage", bob);
      parryInstance.resolve(null);
      expect(tomas.emit).toHaveBeenCalledWith("parryPreparedMessage", bob);
      parryInstance.resolve(null);
      expect(parryInstance.parrying).toBeTruthy();
    });
    const attacks = [
      // these were made fns to resolve for undefined bob/tomas in the space between tests
      { attack: (bob, tomas) => new Heavy(bob, tomas) },
      { attack: (bob, tomas) => new Light(bob, tomas) },
    ];
    it.each(attacks)(
      "At T-1, when resolving a %p, emit an appropriate message",
      ({ attack }) => {
        parryInstance.resolve(null);
        parryInstance.resolve(attack(bob, tomas));
        expect(tomas.emit).toHaveBeenCalledWith("partialParry", bob);
        expect(parryInstance.parrying).toBeTruthy();
      }
    );
    it.todo("triggers mitigate functions on attack classes");
    it.each(attacks)("at T-0, mitigate all", ({ attack }) => {
      parryInstance.resolve(null);
      parryInstance.resolve(null);
      expect(tomas.emit).not.toHaveBeenCalledWith("perfectParry", bob);
      parryInstance.resolve(attack(bob, tomas));
      expect(tomas.emit).toHaveBeenCalledWith("perfectParry", bob);
    });
    it.each(attacks)("at T+1, mitigate some", ({ attack }) => {
      parryInstance.resolve(null);
      parryInstance.resolve(null);
      parryInstance.resolve(null);
      expect(tomas.emit).not.toHaveBeenCalledWith("partialParry", bob);
      parryInstance.resolve(attack(bob, tomas));
      expect(tomas.emit).toHaveBeenCalledWith("partialParry", bob);
    });
  });
});
