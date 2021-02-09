const perceptionEnums = require("../../Perception/percept.enum");

const parryEmits = {
  NEW_PARRY: "NEW_PARRY",
  PARRY_PREPARED: "PARRY_PREPARED",
  PARTIAL_PARRY: "PARTIAL_PARRY",
  PERFECT_PARRY: "PERFECT_PARRY",
  PARRY_COMMIT: "PARRY_COMMIT",
};

const parryRoundMap = {
  1: parryEmits.PARTIAL_PARRY,
  2: parryEmits.PERFECT_PARRY,
  3: parryEmits.PARTIAL_PARRY,
};

const perceptionMap = {
  [perceptionEnums.SUCCESS]: {
    0: ({ name }) => `${name} prepares to raise their weapon in defense.`,
    1: ({ name }) => `${name} moves their weapon to block.`,
    2: ({ name }) => `${name} is prepared to block a blow with their weapon!`,
    3: ({ name }) => `${name} starts lowering their weapon.`,
  },
  [perceptionEnums.PARTIAL_SUCCESS]: ({ name }) =>
    `${name} takes a defensive stance!`,
};

module.exports = {
  parryEmits,
  perceptionMap,
  parryRoundMap,
};
