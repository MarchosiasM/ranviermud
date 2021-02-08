const { Broadcast: B, Logger } = require("ranvier");
const { probeEmits } = require("./probe.enum");

module.exports = {
  [probeEmits.GAIN_ADVANTAGE]: (state) =>
    function (target) {
      B.sayAt(this, `You spot a vital flaw in ${target}'s defenses!`);
      // TODO: create advantage eff and insert it on user here
    },
  [probeEmits.NEW_PROBE]: (state) =>
    function (target) {
      B.sayAt(
        this,
        `You raise your weapon in front of you and make light jabs, testing your opponent's defenses.`
      );
    },
};
