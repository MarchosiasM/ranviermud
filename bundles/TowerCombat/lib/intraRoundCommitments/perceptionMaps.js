const { perceptionMap: probeMap } = require("./Probe/probe.enum");
const { perceptionMap: lightMap } = require("./Light/light.enum");
const { perceptionMap: heavyMap } = require("./Heavy/heavy.enum");
const { perceptionMap: dodgeMap } = require("./Dodge/dodge.enum");
// const { perceptionMap: parryMap } = require("./Parry/parry.enum");

const perceptionMap = require("../Perception/percept.enum");

const misleadBegin = [
  lightMap[perceptionMap.SUCCESS][0],
  heavyMap[perceptionMap.SUCCESS][0],
  dodgeMap[perceptionMap.SUCCESS][0],
];

module.exports = {
  probeMap,
  lightMap,
  misleadBegin,
};
