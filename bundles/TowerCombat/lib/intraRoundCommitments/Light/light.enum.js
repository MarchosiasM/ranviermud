const perceptionEnums = require("../../Perception/percept.enum");

const lightEmits = {
  NEW_LIGHT: "NEW_LIGHT",
  LIGHT_COMMIT_ERROR: "LIGHT_COMMIT_ERROR",
  LIGHT_MITIGATION: "LIGHT_MITIGATION",
  LIGHT_AVOIDED: "LIGHT_AVOIDED",
};

const perceptionMap = {
  [perceptionEnums.SUCCESS]: {
    0: ({ name }) => `${name} prepares a swift attack.`,
    1: ({ name }) => `${name} begins to strike swiftly.`,
    2: ({ name }) => `${name} is in the middle of a swift attack!`,
    3: ({ name }) => `${name} is executing a swift attack!`,
  },
  [perceptionEnums.PARTIAL_SUCCESS]: ({ name }) =>
    `${name} takes an aggressive stance!`,
};

module.exports = {
  lightEmits,
  perceptionMap,
};
