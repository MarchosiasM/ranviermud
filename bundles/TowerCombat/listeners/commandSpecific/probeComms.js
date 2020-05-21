const { Broadcast: B, Logger } = require("ranvier");

module.exports = {
  probeGainAdvantage: (state) =>
    function (target) {
      B.sayAt(this, `You spot a vital flaw in ${target}'s defenses!`);
      // TODO: create advantage eff and insert it on user here
    },
  newProbe: (state) =>
    function (target) {
      B.sayAt(
        this,
        `You raise your weapon in front of you and make light jabs, testing your opponent's defenses.`
      );
    },
};
