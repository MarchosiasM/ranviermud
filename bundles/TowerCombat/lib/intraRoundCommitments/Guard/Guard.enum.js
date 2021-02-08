const { Random } = require("rando-js");
const perceptionEnums = require("../../Perception/percept.enum");
const { misleadBegin } = require("../perceptionMaps");

const guardEmits = {
  GUARD_MITIGATE_LIGHT: "GUARD_MITIGATE_LIGHT",
  GUARD_MITIGATE_HEAVY: "GUARD_MITIGATE_HEAVY",
  GUARD_DODGE_ADVANTAGE: "GUARD_DODGE_ADVANTAGE",
  NEW_GUARD: "NEW_GUARD",
};

const returnRandomArrayMember = (array) => {
  const arrayLength = array.length;
  return array[Random.inRange(0, arrayLength - 1)];
};

const perceptionMap = {
  [perceptionEnums.SUCCESS]: ({ name }) =>
    `${name} has their weapon raised, in preparation for a defense.`,
  [perceptionEnums.PARTIAL_SUCCESS]: ({ name }) =>
    returnRandomArrayMember(misleadBegin)({ name }),
};

module.exports = {
  guardEmits,
  perceptionMap,
};
