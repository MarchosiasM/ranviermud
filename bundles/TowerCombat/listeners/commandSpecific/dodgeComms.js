const { Broadcast: B, Logger } = require("ranvier");

module.exports = {
  newProbe: (state) =>
    function (target) {
      B.sayAt(
        this,
        `You plant your feet and bend your knees, preparing an evasive maneuver.`
      );
    },
  dodgeInvulnBegin: (state) =>
    function () {
      B.sayAt(this, `You're so fast as to be nearly imperceptible to the eye!`);
    },
  lightDodge: (state) =>
    function (target) {
      B.sayAt(
        this,
        `You handily evade ${target}'s strike.
        They're off-balance!`
      );
    },
  dodgeCommitMessage: (state) =>
    function (type) {
      B.sayAt(
        this,
        `Your commitment to a dodge leaves you unable to pivot into a ${String.toLowerCase(
          type
        )}!`
      );
    },
};
