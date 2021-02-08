const { Random } = require("rando-js");
const perceptionEnums = require("../../Perception/percept.enum");
const { misleadBegin } = require("../perceptionMaps");

const probeEmits = {
  NEW_PROBE: "NEW_PROBE",
  GAIN_ADVANTAGE: "GAIN_ADVANTAGE",
};

const bonusFollowUps = {
  LIGHT: "LIGHT",
  HEAVY: "HEAVY",
  PARRY: "PARRY",
};

const returnRandomArrayMember = (array) => {
  const arrayLength = array.length;
  return array[Random.inRange(0, arrayLength - 1)];
};

const perceptionMap = {
  [perceptionEnums.SUCCESS]: ({ name }) =>
    `${name} pokes their weapon forward, searching for openings. `,
  [perceptionEnums.PARTIAL_SUCCESS]: ({ name }) =>
    returnRandomArrayMember(misleadBegin)({ name }),
};

module.exports = {
  probeEmits,
  bonusFollowUps,
  perceptionMap,
};
