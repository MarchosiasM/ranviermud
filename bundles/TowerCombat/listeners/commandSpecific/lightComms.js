const { Broadcast: B, Logger } = require("ranvier");
const {
  commandTypes,
} = require("../../lib/intraRoundCommitments/commands.enum");

module.exports = {
  lightCommitMessage: (state) =>
    function (target) {
      B.sayAt(this, `Your weapon is already mid-swing!`);
      // TODO: create advantage eff and insert it on user here
    },
  newLight: (state) =>
    function (target) {
      B.sayAt(this, `You begin a quick strike!`);
    },
  lightMitigation: (state) =>
    function (source, mitigator) {
      switch (source) {
        case commandTypes.PARRY:
          B.sayAt(this, `${mitigator} deflects some of your blow!`);
          break;
        case commandTypes.GUARD:
          B.sayAt(
            this,
            `${mitigator} manages to avoid the worst of your blow!`
          );
          break;
      }
    },
  lightAvoided: (state) =>
    function (source) {
      B.sayAt(
        this,
        `Your strike finds only air as your weapon sails effortlessly through where your opponent was.`
      );
    },
};
