const { Broadcast: B, Logger } = require("ranvier");
const { dodgeEmit } = require("./Dodge.enum");

const {
  NEW_DODGE,
  DODGE_INVULN_BEGIN,
  DODGE_COMMIT_ERROR,
  LIGHT_DODGE,
  HEAVY_DODGE,
} = dodgeEmit;

module.exports = {
  [NEW_DODGE]: (state) =>
    function (target) {
      B.sayAt(
        this,
        `You plant your feet and bend your knees, preparing an evasive maneuver.`
      );
    },
  [DODGE_INVULN_BEGIN]: (state) =>
    function () {
      B.sayAt(this, `You're a moving target!`);
    },
  [LIGHT_DODGE]: (state) =>
    function (target) {
      B.sayAt(
        this,
        `You handily evade ${target}'s strike.
        They're off-balance!`
      );
    },
  [HEAVY_DODGE]: (state) =>
    function (target) {
      B.sayAt(
        this,
        `You maneuver out of the way of a massive blow from ${target}.
        They're off-balance!`
      );
    },
  [DODGE_COMMIT_ERROR]: (state) =>
    function (type) {
      B.sayAt(
        this,
        `Your commitment to a dodge leaves you unable to pivot into a ${String.toLowerCase(
          type
        )}!`
      );
    },
};
