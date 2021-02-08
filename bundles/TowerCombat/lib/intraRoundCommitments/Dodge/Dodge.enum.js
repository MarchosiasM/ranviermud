const perceptionEnums = require("../../Perception/percept.enum");

const dodgeEmit = {
  NEW_DODGE: "NEW_DODGE",
  DODGE_INVULN_BEGIN: "DODGE_INVULN_BEGIN",
  DODGE_COMMIT_ERROR: "DODGE_COMMIT_ERROR",
  LIGHT_DODGE: "LIGHT_DODGE",
  HEAVY_DODGE: "HEAVY_DODGE",
};

const perceptionMap = {
  [perceptionEnums.SUCCESS]: {
    0: ({ name }) =>
      `${name} plants their feet and bends their knees, looking nimble.`,
    1: ({ name }) => `${name} begins to dart away, anticipating a strike.`,
    2: ({ name }) =>
      `${name} is a moving target, it would be very challenging to hit them!`,
    3: ({ name }) => `${name} is finishing their evasive maneuver.`,
  },
  [perceptionEnums.PARTIAL_SUCCESS]: ({ name }) =>
    `${name} takes an aggressive stance!`,
};

module.exports = {
  dodgeEmit,
  perceptionMap,
};
