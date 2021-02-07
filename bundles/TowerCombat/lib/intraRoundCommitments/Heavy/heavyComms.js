const { Broadcast: B } = require("ranvier");
const { commandTypes } = require("../commands.enum");
const { heavyEmits } = require("./heavy.enum");

module.exports = {
  [heavyEmits.HEAVY_COMMIT_ERROR]: (state) =>
    function (target) {
      B.sayAt(this, `Your weapon is already mid-swing!`);
      // TODO: create advantage eff and insert it on user here
    },
  [heavyEmits.NEW_HEAVY]: (state) =>
    function (target) {
      B.sayAt(this, `You wind up for a heavy blow!`);
    },
  [heavyEmits.HEAVY_MITIGATION]: (state) =>
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
  [heavyEmits.HEAVY_AVOIDED]: (state) =>
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
