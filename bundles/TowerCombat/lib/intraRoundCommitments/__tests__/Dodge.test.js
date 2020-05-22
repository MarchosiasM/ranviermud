const Guard = require("../Guard");
const Light = require("../Light");
const Heavy = require("../Heavy");
const Dodge = require("../Dodge");
const { generatePlayer } = require("../../__tests__/helperFns");

describe("Dodge", () => {
  let tomas, bob, dodgeInstance;
  beforeEach(() => {
    tomas = generatePlayer();
    tomas.emit = jest.fn();
    bob = generatePlayer();
    dodgeInstance = new Dodge(tomas, bob);
  });
  it("triggers the newGuard event when instantiated", () => {
    expect(tomas.emit).toHaveBeenCalledWith("newDodge", bob);
  });

  it("is recognized as an instance of itself", () => {
    // this seems redundant, but I use this method for some dynamic checking in the command handler
    expect(dodgeInstance.isInstanceOf(dodgeInstance.config.type)).toBeTruthy();
  });

  describe("switch", () => {
    const roundCount = [0, 1, 2, 3];
    it.each(roundCount)(
      "does not allow a switch if only %p rounds have elapsed",
      (roundsToElapse) => {
        expect(tomas.emit).not.toHaveBeenCalledWith(
          "dodgeCommitMessage",
          "light strike"
        );
        for (let i = 0; i < roundsToElapse; i++) {
          dodgeInstance.resolve(null); // resolves a round
        }
        dodgeInstance.switch("light strike", bob);
        expect(tomas.emit).not.toHaveBeenCalledWith(
          "commitSwitch",
          "light strike",
          bob
        );
        expect(tomas.emit).toHaveBeenCalledWith(
          "dodgeCommitMessage",
          "light strike"
        );
      }
    );
    it("allows switch after 4 rounds elapsed", () => {
      dodgeInstance.resolve(null); // 0
      dodgeInstance.resolve(null); // 1
      dodgeInstance.resolve(null); // 2
      dodgeInstance.resolve(null); // 3
      dodgeInstance.switch("light strike", bob);
      expect(tomas.emit).toHaveBeenCalledWith(
        "commitSwitch",
        "light strike",
        bob
      );
      expect(tomas.emit).not.toHaveBeenCalledWith(
        "dodgeCommitMessage",
        "light strike"
      );
    });
  });
  describe("resolve", () => {
    it("advances the 'elapsedRounds' counter on each resolve call", () => {
      expect(dodgeInstance.elapsedRounds).toEqual(0);
      dodgeInstance.resolve(null);
      expect(dodgeInstance.elapsedRounds).toEqual(1);
      dodgeInstance.resolve(null);
      expect(dodgeInstance.elapsedRounds).toEqual(2);
    });
    it("at the end of the 2nd round, player enters invulnerability", () => {
      dodgeInstance.resolve(null);
      expect(tomas.emit).not.toHaveBeenCalledWith("dodgeInvulnBegin");
      dodgeInstance.resolve(null);
      expect(tomas.emit).toHaveBeenCalledWith("dodgeInvulnBegin");
      expect(dodgeInstance.dodging).toBeTruthy();
    });
    it("does not emit an event to mitigate heavy damage if two rounds haven't elapsed", () => {
      dodgeInstance.resolve(new Heavy(bob, tomas));
      dodgeInstance.resolve(new Light(bob, tomas));
      expect(tomas.emit).not.toHaveBeenCalledWith("heavyDodge", bob);
      expect(tomas.emit).not.toHaveBeenCalledWith("lightDodge", bob);
    });
    it("does emit an event to mitigate heavy damage if two rounds have elapsed", () => {
      dodgeInstance.resolve(null);
      dodgeInstance.resolve(null);

      dodgeInstance.resolve(new Heavy(bob, tomas));
      expect(tomas.emit).toHaveBeenCalledWith("heavyDodge", bob);
    });
    it("does emit an event to mitigate light damage if two rounds have elapsed", () => {
      dodgeInstance.resolve(null);
      dodgeInstance.resolve(null);

      dodgeInstance.resolve(new Light(bob, tomas));
      expect(tomas.emit).toHaveBeenCalledWith("lightDodge", bob);
    });
    it.todo("activates the mitigation method on the incoming damage obj");
  });
});
