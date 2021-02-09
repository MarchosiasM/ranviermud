const Light = require("../../Light");
const Heavy = require("../../Heavy");
const Parry = require("../");
const Guard = require("../../Guard");
const {
  generatePlayer,
  advanceRound,
  generateCombatAndAdvance,
} = require("../../../__tests__/helperFns");
const { parryEmits } = require("../Parry.enum");
const { parry } = require("../../configuration");

describe("Parry", () => {
  let tomas, bob, parryInstance, bobsGuardInstance;
  beforeEach(() => {
    [tomas] = generatePlayer();
    [bob] = generatePlayer();
    parryInstance = new Parry(tomas, bob);
    bobsGuardInstance = new Guard(bob, tomas);
  });
  it("triggers the newParry event when instantiated", () => {
    expect(tomas.emit).toHaveBeenCalledWith(parryEmits.NEW_PARRY, bob);
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
          "lightCommitError",
          "light strike"
        );
        for (let i = 0; i < roundsToElapse; i++) {
          advanceRound(parryInstance, bobsGuardInstance);
        }
        parryInstance.switch("light strike", bob);
        expect(tomas.emit).not.toHaveBeenCalledWith(
          "commitSwitch",
          "light strike",
          bob
        );
        expect(tomas.emit).toHaveBeenCalledWith(
          parryEmits.PARRY_COMMIT,
          "light strike"
        );
      }
    );
    it("allows switch after 2 rounds elapsed", () => {
      const continueAdvance = generateCombatAndAdvance([
        parryInstance,
        bobsGuardInstance,
      ]);
      continueAdvance(parryInstance, bobsGuardInstance);
      parryInstance.switch("light strike", bob);
      expect(tomas.emit).toHaveBeenCalledWith(
        "commitSwitch",
        "light strike",
        bob
      );
      expect(tomas.emit).not.toHaveBeenCalledWith(
        parryEmits.PARRY_COMMIT,
        "light strike"
      );
    });
  });
  describe("resolve", () => {
    it("advances the 'elapsedRounds' counter on each resolve call", () => {
      expect(parryInstance.elapsedRounds).toEqual(0);
      const continueAdvance = generateCombatAndAdvance([
        parryInstance,
        bobsGuardInstance,
      ]);
      expect(parryInstance.elapsedRounds).toEqual(1);
      continueAdvance();
      expect(parryInstance.elapsedRounds).toEqual(2);
    });

    it("At T-1, emit a message signaling the player they're ready to parry", () => {
      const continueAdvance = generateCombatAndAdvance([
        parryInstance,
        bobsGuardInstance,
      ]);
      expect(tomas.emit).not.toHaveBeenCalledWith(
        parryEmits.PARRY_PREPARED,
        bob
      );

      continueAdvance();
      expect(tomas.emit).toHaveBeenCalledWith(parryEmits.PARRY_PREPARED, bob);
      expect(parryInstance.parrying).toBeTruthy();
    });

    const attacks = [
      // these were made fns to resolve for undefined bob/tomas in the space between tests
      { attack: (bob, tomas) => new Heavy(bob, tomas) },
      { attack: (bob, tomas) => new Light(bob, tomas) },
    ];
    xit.each(attacks)(
      "At T-1, when resolving a %p, emit an appropriate message",
      ({ attack }) => {
        const bobsAttack = attack(bob, tomas);
        bobsAttack.setReady();
        expect(tomas.emit).not.toHaveBeenCalledWith(
          parryEmits.PARTIAL_PARRY,
          bob
        );

        generateCombatAndAdvance([parryInstance, bobsAttack]);
        expect(tomas.emit).toHaveBeenCalledWith(parryEmits.PARTIAL_PARRY, bob);
      }
    );

    it.todo("triggers mitigate functions on attack classes");

    it.each(attacks)("at T-0, mitigate all", ({ attack }) => {
      const bobsAttack = attack(bob, tomas);

      const continueAdvance = generateCombatAndAdvance([
        parryInstance,
        bobsAttack,
      ]);
      expect(tomas.emit).not.toHaveBeenCalledWith(
        parryEmits.PERFECT_PARRY,
        bob
      );

      bobsAttack.setReady();
      continueAdvance();
      expect(tomas.emit).toHaveBeenCalledWith(parryEmits.PERFECT_PARRY, bob);
    });

    it.each(attacks)("at T+1, mitigate some", ({ attack }) => {
      const bobsAttack = attack(bob, tomas);

      const continueAdvance = generateCombatAndAdvance([
        parryInstance,
        bobsAttack,
      ]);
      continueAdvance();
      bobsAttack.setReady();
      expect(tomas.emit).not.toHaveBeenCalledWith(
        parryEmits.PARTIAL_PARRY,
        bob
      );

      advanceRound(parryInstance, bobsAttack);
      expect(tomas.emit).toHaveBeenCalledWith(parryEmits.PARTIAL_PARRY, bob);
    });
  });
});
