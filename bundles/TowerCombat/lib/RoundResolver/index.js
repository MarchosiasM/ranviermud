const {
  commandTypes,
  layers,
} = require("./../intraRoundCommitments/commands.enum");

class RoundResolver {
  /**
   * This is a neutral mediator for the actions taking place. Consider this a
   * kind of "safe space" where the attack can say "I want to do 100 damage",
   * then we record the intent.
   * This should be called in the compareAndApply methods.
   * @param {Player} target Intended target for this action
   * @param {Object} strike The information for this attack
   */
  static compareCards(engagement) {
    RoundResolver.preProcess(engagement);
    RoundResolver.elapseRounds(engagement);
    RoundResolver.compareAllCards(engagement);
  }

  static preProcess(engagement) {
    for (const character of engagement.characters) {
      character.combatData.decision.update();
    }
  }

  static elapseRounds(engagement) {
    for (const character of engagement.characters) {
      character.combatData.decision.elapseRounds();
    }
  }

  static compareAllCards(engagement) {
    // TODO: This can be more efficient by only examining commands that *can* apply effects.
    // Should you though? Each card should have an early exit where the card doesn't apply
    // I don't easily see this being a big time saver, and it'll for sure introduce regressions
    for (const character of engagement.characters) {
      const charactersDecision = character.combatData.decision;
      for (const otherCharacter of engagement.characters) {
        if (character !== otherCharacter) {
          const otherCharactersDecision = otherCharacter.combatData.decision;
          charactersDecision.compareAndApply(otherCharactersDecision);
        }
      }
    }
  }

  static commitCards(engagement) {
    for (const character of engagement.characters) {
      const charactersDecision = character.combatData.decision;
      charactersDecision.commit();
      if (charactersDecision.completed) {
        character.combatData.decision = null;
      }
    }
  }
}

module.exports = RoundResolver;
