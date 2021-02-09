const { Broadcast: B, Logger } = require("ranvier");
const Light = require("../lib/intraRoundCommitments/Light");
const Guard = require("../lib/intraRoundCommitments/Guard");
const Probe = require("../lib/intraRoundCommitments/Probe");
const Dodge = require("../lib/intraRoundCommitments/Dodge");
const Parry = require("../lib/intraRoundCommitments/Parry");
const Heavy = require("../lib/intraRoundCommitments/Heavy");
const guardComms = require("../lib/intraRoundCommitments/Guard/guardComms");
const probeComms = require("../lib/intraRoundCommitments/Probe/probeComms");
const dodgeComms = require("../lib/intraRoundCommitments/Dodge/dodgeComms");
const lightComms = require("../lib/intraRoundCommitments/Light/lightComms");
const heavyComms = require("../lib/intraRoundCommitments/Heavy/heavyComms");
const parryComms = require("../lib/intraRoundCommitments/Parry/parryComms");
const { commandTypes } = require("../lib/intraRoundCommitments/commands.enum");

module.exports = {
  ...guardComms,
  ...probeComms,
  ...dodgeComms,
  ...lightComms,
  ...parryComms,
  ...heavyComms,
  attemptSwitch: (state) =>
    function (type, target) {
      if (!target) Logger.error(`No target found for type ${type}`);
      if (commandTypes[type]) {
        this.combatData.decision.switch(type, target);
        return;
      }
      Logger.error(
        `${this.name} input a command type I couldn't parse. ${type}`
      );
    },
  commitSwitch: (state) =>
    function (type, target) {
      if (!target) Logger.error(`No target found for type ${type}`);
      switch (type) {
        case commandTypes.LIGHT:
          this.combatData.decision = new Light(this, target);
          break;
        case commandTypes.GUARD:
          this.combatData.decision = new Guard(this, target);
          break;
        case commandTypes.DODGE:
          this.combatData.decision = new Dodge(this, target);
          break;
        case commandTypes.PARRY:
          this.combatData.decision = new Parry(this, target);
          break;
        case commandTypes.HEAVY:
          this.combatData.decision = new Heavy(this, target);
          break;
        case commandTypes.PROBE:
          this.combatData.decision = new Probe(this, target);
          break;
        default:
          Logger.error(
            `${this.name} input a command type I couldn't parse. ${type}`
          );
      }
    },
  outOfCombatErr: (state) =>
    function (type) {
      B.sayAt(this, `You prepare to ${type}! ... Against whom?`);
    },
  alreadyErr: (state) =>
    function (type) {
      B.sayAt(this, `You're already prepared to ${type}!`);
    },
  commandSwitch: (state) =>
    function (type) {
      B.sayAt(this, `You change your mind...`);
    },
  newGuard: (state) =>
    function (target) {
      B.sayAt(
        this,
        `You regard ${target.name} warily, waiting for a chance to strike.`
      );
    },
  guardLightMitigate: (state) =>
    function (target) {
      B.sayAt(
        this,
        `You lean into ${target.name}'s strike, shrugging off some of the blow.`
      );
    },
  guardHeavyMitigate: (state) =>
    function (target) {
      B.sayAt(
        this,
        `You lean into ${target.name}'s mighty blow, taking the worst of it but preventing some of the pain.`
      );
    },
};
