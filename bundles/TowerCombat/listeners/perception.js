const { Broadcast: B, Logger } = require("ranvier");
const {
  commandTypes,
  layers,
} = require("../lib/intraRoundCommitments/commands.enum");

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
  [commandTypes.HEAVY]: ({ name }) => `${name} is prepared to strike!`,
  [commandTypes.DODGE]: ({ name }) => `${name} !`,
};

module.exports = {
  perceptSuccess: (state) =>
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
  partialPerceptSuccess: (state) =>
    function (decision, opposition) {
      const { config } = decision;
      if (generalPercepMap[config.perceiveAs]) {
        B.sayAt(this, generalPercepMap[config.perceiveAs](opposition));
        return;
      }
      Logger.log(
        `Failed a type check, decision type ${config.type}: perceiveAs: ${config.perceiveAs}`
      );
    },
  criticalPerceptFailure: (state) =>
    function (decision, opposition) {
      const { config } = decision;
      B.sayAt(this, generalPercepMap[config.perceiveAs](opposition));
    },
};
