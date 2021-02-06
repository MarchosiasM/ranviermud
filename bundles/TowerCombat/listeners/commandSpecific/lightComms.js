const { Broadcast: B, Logger } = require("ranvier");
const {
  commandTypes,
} = require("../../lib/intraRoundCommitments/commands.enum");

module.exports = {
  lightCommitError: (state) =>
    function (target) {
      B.sayAt(this, `Your weapon is already mid-swing!`);
      // TODO: create advantage eff and insert it on user here
    },
  newLight: (state) =>
    function (target) {
      B.sayAt(this, `You begin a quick strike!`);
    },
  lightMitigation: (state) =>
    function (source) {
      switch (source.type) {
        case commandTypes.PARRY:
          B.sayAt(this, `${source.user.name} deflects some of your blow!`);
          break;
        case commandTypes.GUARD:
          B.sayAt(
            this,
            `${source.user.name} manages to avoid the worst of your blow!`
          );
          break;
      }
    },
  lightAvoided: (state) =>
    function (source) {
      switch (source.type) {
        case commandTypes.DODGE:
          B.sayAt(
            this,
            `Your strike finds only air as your weapon sails effortlessly through where ${source.user.name} was.`
          );
          break;
        case commandTypes.PARRY:
          B.sayAt(
            this,
            `With a deft parry your blow is sent off course by ${source.user.name}`
          );
          break;
      }
    },
};
