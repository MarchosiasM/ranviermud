const perceptionEnums = require("../../Perception/percept.enum");

const heavyEmits = {
  NEW_HEAVY: "NEW_HEAVY",
  HEAVY_COMMIT_ERROR: "HEAVY_COMMIT_ERROR",
  HEAVY_MITIGATION: "HEAVY_MITIGATION",
  HEAVY_AVOIDED: "HEAVY_AVOIDED",
};

const perceptionMap = {
  [perceptionEnums.SUCCESS]: {
    0: ({ name }) =>
      `${name} reels their weapon back in preparation for a heavy attack!`,
    1: ({ name }) => `${name} begins swinging their weapon in a giant arc!`,
    2: ({ name }) => `${name}'s weapon is in the middle of a giant arc!`,
    3: ({ name }) => `${name}'s weapon is in the middle of a giant arc!`,
    4: ({ name }) => `${name}'s weapon is in the middle of a giant arc!`,
    5: ({ name }) =>
      `${name} is bringing their weapon down for a massive blow!`,
  },
  [perceptionEnums.PARTIAL_SUCCESS]: ({ name }) =>
    `${name} takes an aggressive stance!`,
};

module.exports = {
  heavyEmits,
  perceptionMap,
};
