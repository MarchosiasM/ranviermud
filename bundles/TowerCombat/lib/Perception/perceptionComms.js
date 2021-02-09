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

module.exports = {
  [perceptEmit.SUCCESS]: (state) =>
    function (decision, opposition) {
      const { config } = decision;
      B.sayAt(this, decision.percept(perceptEmit.SUCCESS));
      Logger.log(
        `Failed a type check, decision type ${config.type}: perceiveAs: ${config.perceiveAs}`
      );
    },
  [perceptEmit.PARTIAL_SUCCESS]: (state) =>
    function (decision, opposition) {
      const { config } = decision;
      B.sayAt(this, decision.percept(perceptEmit.SUCCESS));
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
