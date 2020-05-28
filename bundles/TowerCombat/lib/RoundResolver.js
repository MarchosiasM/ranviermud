const { commandTypes } = require("./intraRoundCommitments/commands.enum");

const defensiveActionMap = {};

class RoundResolver {
  /**
   * This is a neutral mediator for the actions taking place. Consider this a
   * kind of "safe space" where the attack can say "I want to do 100 damage",
   * then we record the intent.
   * This should be called in the postRoundProcess methods.
   * @param {Player} target Intended target for this action
   * @param {Object} strike The information for this attack
   */
  static manageAttackIntent(engagement) {
    const targets = this.extractTargets(engagement);

    for (const target of targets) {
      const targetsAction = target.combatData.decision;
      const actionsAgainstTarget = this.getActionsAgainstTarget(
        engagement,
        target
      );
      const defensiveActions = [...defensiveActions, targetsAction].filter(
        (action) => action.type
      );
      this.handleDefensiveActions(actionsAgainstTarget, targetsAction);
      this.handleOffensiveActions(actionsAgainstTarget, targetsAction);
    }
  }

  handleDefensiveActions(actions, targetsAction) {
    for (const action of actions) {
      action.preRoundProcess(targetsAction);
    }
    for (const action of actions) {
      action.elapseRounds();
    }
    for (const action of actions) {
      action.elapseRounds();
    }
  }

  extractTargets(engagement) {
    const characters = engagement.getCharacters();
    const targetSet = new Set();
    for (const character of characters) {
      const action = character.combatData.decision;
      targetSet.add(action.target);
    }
    return targetSet;
  }

  getActionsAgainstTarget(engagement, target) {
    const characters = engagement.getCharacters();
    const actionSet = new Set();
    for (const character of characters) {
      const action = character.combatData.decision;
      if (action.target === target) {
        actionSet.add(action.target);
      }
    }
    return actionSet;
  }
}

module.exports = RoundResolver;
