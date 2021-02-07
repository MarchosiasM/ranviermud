const { Broadcast: B, Logger } = require("ranvier");
const {
  commandTypes,
  layers,
} = require("../intraRoundCommitments/commands.enum");
const perceptEmit = require("./percept.enum");

const generalPercepMap = {
  [layers.OFFENSE]: ({ name }) => `${name} has taken an aggressive stance.`,
  [layers.DEFENSE]: ({ name }) => `${name} is on the defensive.`,
  [layers.OFFENSE]: ({ name }) => `${name} is winding up for a big hit!`,
  [layers.OFFENSE]: ({ name }) => `${name} is poised to withdraw.`,
};

const specificPercepMap = {
  [commandTypes.PROBE]: ({ name, his }) =>
    `${name} thrusts ${his} weapon forward, searching for an opening.`,
  [commandTypes.GUARD]: ({ name, his }) =>
    `${name} has assumed a neutral stance, biding ${his} time.`,
  [commandTypes.LIGHT]: ({ name }) => `${name} is prepared to strike!`,
  [commandTypes.HEAVY]: ({ name }) => `${name} is winding up for a huge blow!`,
  [commandTypes.DODGE]: ({ name, his }) =>
    `${name} looks light on ${his} feet!`,
};

module.exports = {
  [perceptEmit.SUCCESS]: (state) =>
    function (decision, opposition) {
      const { config } = decision;
      if (specificPercepMap[config.type]) {
        B.sayAt(this, specificPercepMap[config.type](opposition));
        return;
      }
      Logger.log(
        `Failed a type check, decision type ${config.type}: perceiveAs: ${config.perceiveAs}`
      );
    },
  [perceptEmit.PARTIAL_SUCCESS]: (state) =>
    function (decision, opposition) {
      const { config } = decision;
      if (config && generalPercepMap[config.perceiveAs]) {
        B.sayAt(this, generalPercepMap[config.perceiveAs](opposition));
        return;
      }
      Logger.log(
        `Failed a type check, decision type ${config.type}: perceiveAs: ${config.perceiveAs}`
      );
    },
  [perceptEmit.CRITICAL_FAILURE]: (state) =>
    function (decision, opposition) {
      const { config } = decision;
      B.sayAt(this, generalPercepMap[config.perceiveAs](opposition));
    },
};
