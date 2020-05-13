"use strict";

const { Random } = require("rando-js");
const { Logger, Broadcast: B } = require("ranvier");
const Parser = require("../../bundle-example-lib/lib/ArgParser");
const CombatErrors = require("./CombatErrors");
const { roundState, combatOptions, resultPosition } = require("./Combat.enums");
const {
  resolveDodgeVsDodge,
  resolveStrikeVsDodge,
  resolveStrikeVsStrike,
} = require("./CombatResolutions/index");

const luck = {
  CRITICAL: 2,
  GOOD: 1,
  NEUTRAL: 0,
  POOR: -1,
  CRITFAIL: -2,
};

const resultsMapping = {
  6: resultPosition.GR_ADVANTAGED,
  5: resultPosition.GR_ADVANTAGED,
  4: resultPosition.ADVANTAGED,
  3: resultPosition.NEUTRAL,
  2: resultPosition.DISADVANTAGED,
  1: resultPosition.GR_DISADVANTAGED,
  0: resultPosition.GR_DISADVANTAGED,
  GR_ADVANTAGED: 5,
  ADVANTAGED: 4,
  NEUTRAL: 3,
  DISADVANTAGED: 2,
  GR_DISADVANTAGED: 1,
};

/**
 * This class is an example implementation of a Diku-style real time combat system. Combatants
 * attack and then have some amount of lag applied to them based on their weapon speed and repeat.
 */
class Combat {
  /**
   * Handle a single combat round for a given attacker
   * @param {GameState} state
   * @param {Character} attacker
   * @return {boolean}  true if combat actions were performed this round
   */
  static updateRound(state, attacker) {
    if (attacker.combatData.killed) {
      // entity was removed from the game but update event was still in flight, ignore it
      return false;
    }

    if (!attacker.isInCombat()) {
      if (!attacker.isNpc) {
        attacker.removePrompt("combat");
      }
      return false;
    }

    let lastRoundStarted = attacker.combatData.roundStarted;
    attacker.combatData.roundStarted = Date.now();

    // cancel if the attacker's combat lag hasn't expired yet
    if (attacker.combatData.lag > 0) {
      const elapsed = Date.now() - lastRoundStarted;
      attacker.combatData.lag -= elapsed;
      return false;
    }

    // currently just grabs the first combatant from their list but could easily be modified to
    // implement a threat table and grab the attacker with the highest threat
    let target = null;
    try {
      target = Combat.chooseCombatant(attacker);
    } catch (e) {
      attacker.removeFromCombat();
      attacker.combatData = {};
      throw e;
    }

    if (target.combatData.killed) {
      // entity was removed from the game but update event was still in flight, ignore it
      return false;
    }

    // no targets left, remove attacker from combat
    if (!target) {
      attacker.removeFromCombat();
      // reset combat data to remove any lag
      attacker.combatData = {};
      return false;
    }

    if (target.combatData.round !== attacker.combatData.round) {
      target.combatData.round = roundState.PREPARE;
      attacker.combatData.round = roundState.PREPARE;
    }

    Combat.markTime(attacker, target);
    Combat.advancePhase(attacker, target);

    switch (attacker.combatData.round) {
      case roundState.PREPARE:
        Combat.prepare(attacker, target);
        break;
      case roundState.REACT:
        Combat.react(attacker, target);
        break;
      case roundState.RESOLUTION:
        Combat.resolve(attacker, target);
        break;
      default:
        attacker.combatData.round = roundState.PREPARE;
        attacker.combatData.lag = 3000;
        Logger.error("Didn't find a round state");
    }

    B.sayAtExcept(attacker, "\r\n");
    return true;
  }

  static markTime(attacker, target) {
    attacker.combatData.roundStarted = Date.now();
    target.combatData.roundStarted = Date.now();
    attacker.combatData.lag = 3000;
    target.combatData.lag = 3000;
  }

  /**
   * Find a target for a given attacker
   * @param {Character} attacker
   */
  static prepare(attacker, target) {
    B.sayAt(attacker, "Consider your options");
    B.sayAt(target, "Consider your options");

    return true;
  }

  /**
   * Find a target for a given attacker
   * @param {Character} attacker
   */
  static react(attacker, target) {
    Combat.defaultActionSelection(attacker);
    Combat.defaultActionSelection(target);
    B.sayAt(attacker, "You study your opponent carefully");
    B.sayAt(target, "You study your opponent carefully");
    return true;
  }

  /**
   * Find a target for a given attacker
   * @param {Character} attacker
   */
  static resolve(attacker, target) {
    const { attackerResult, targetResult } = Combat.compileScores(
      attacker,
      target
    );
    const attackerPosition = Combat.calculatePosition(
      attackerResult,
      targetResult
    );
    Combat.resolvePositions(attacker, target, attackerPosition);
  }

  static advancePhase(attacker, target) {
    switch (attacker.combatData.round) {
      case roundState.PREPARE:
        attacker.combatData.round = roundState.REACT;
        target.combatData.round = roundState.REACT;
        break;
      case roundState.REACT:
        attacker.combatData.round = roundState.RESOLUTION;
        target.combatData.round = roundState.RESOLUTION;
        break;
      case roundState.RESOLUTION:
        attacker.combatData.round = roundState.PREPARE;
        target.combatData.round = roundState.PREPARE;
        Combat.clearDecisions(attacker, target);
        break;
      default:
        attacker.combatData.round = roundState.PREPARE;
        target.combatData.round = roundState.PREPARE;
        Combat.clearDecisions(attacker, target);
    }
  }

  static defaultActionSelection(combatant) {
    if (!combatant.combatData.decision) {
      combatant.combatData.decision = combatOptions.STRIKE;
      B.sayAt(combatant, "Your instincts lead you to strike!");
    }
  }

  static clearDecisions(attacker, target) {
    attacker.combatData.decision = null;
    target.combatData.decision = null;
  }

  static compileScores(attacker, target) {
    return {
      attackerResult: {
        skill: Combat.compileSkillScore(attacker),
        luck: Combat.calculateLuck(attacker),
      },
      targetResult: {
        skill: Combat.compileSkillScore(target),
        luck: Combat.calculateLuck(target),
      },
    };
  }

  static compileSkillScore() {
    return 100;
  }

  static calculateLuck() {
    const pureLuck = Random.inRange(0, 40);
    if (pureLuck > 39) return luck.CRITICAL;
    if (pureLuck > 38) return luck.GOOD;
    if (pureLuck > 5) return luck.NEUTRAL;
    if (pureLuck > 3) return luck.POOR;
    return luck.CRITFAIL;
  }

  static calculatePosition(attackerRes, targetRes) {
    const attackerSkillRoll = Random.inRange(1, attackerRes.skill);
    const targetSkillRoll = Random.inRange(1, targetRes.skill);
    const delta = attackerSkillRoll - targetSkillRoll;
    let result;
    result = resultPosition.GR_DISADVANTAGED;
    if (delta > -90) result = resultPosition.DISADVANTAGED;
    if (delta > -66) result = resultPosition.NEUTRAL;
    if (delta > 66) result = resultPosition.ADVANTAGED;
    if (delta > 90) result = resultPosition.GR_ADVANTAGED;
    const luckMod = Combat.calculateLuckMod(attackerRes.luck, targetRes.luck);
    const modifiedResult = resultsMapping[resultsMapping[result] + luckMod];
    return modifiedResult;
  }

  static calculateLuckMod(attackerLuck, targetLuck) {
    return attackerLuck - targetLuck;
  }

  static resolvePositions(attacker, target, attackerPosition) {
    const { DODGE, STRIKE } = combatOptions;
    const attackerDecision = attacker.combatData.decision;
    const targetDecision = target.combatData.decision;
    switch (attackerDecision) {
      case STRIKE:
        switch (targetDecision) {
          case STRIKE:
            resolveStrikeVsStrike(attacker, target, attackerPosition);
            break;
          case DODGE:
            resolveStrikeVsDodge(attacker, target, attackerPosition);
            break;
        }
        break;
      case DODGE:
        switch (targetDecision) {
          case STRIKE:
            resolveStrikeVsDodge(
              target,
              attacker,
              Combat.findInverseCombatPosition(attackerPosition)
            );
            break;
          case DODGE:
            resolveDodgeVsDodge(attacker, target, attackerPosition);
            break;
        }
        break;
    }
  }

  static findInverseCombatPosition(position) {
    if (position === resultPosition.NEUTRL) return position;
    return resultsMapping[6 - resultsMapping[position]];
  }

  /**
   * Find a target for a given attacker
   * @param {Character} attacker
   * @return {Character|null}
   */
  static chooseCombatant(attacker) {
    if (!attacker.combatants.size) {
      return null;
    }

    for (const target of attacker.combatants) {
      if (!target.hasAttribute("health")) {
        throw new CombatErrors.CombatInvalidTargetError();
      }
      if (target.getAttribute("health") > 0) {
        return target;
      }
    }

    return null;
  }

  /**
   * Any cleanup that has to be done if the character is killed
   * @param {Character} deadEntity
   * @param {?Character} killer Optionally the character that killed the dead entity
   */
  static handleDeath(state, deadEntity, killer) {
    if (deadEntity.combatData.killed) {
      return;
    }

    deadEntity.combatData.killed = true;
    deadEntity.removeFromCombat();

    Logger.log(
      `${killer ? killer.name : "Something"} killed ${deadEntity.name}.`
    );

    if (killer) {
      deadEntity.combatData.killedBy = killer;
      killer.emit("deathblow", deadEntity);
    }
    deadEntity.emit("killed", killer);

    if (deadEntity.isNpc) {
      state.MobManager.removeMob(deadEntity);
    }
  }

  static startRegeneration(state, entity) {
    if (entity.hasEffectType("regen")) {
      return;
    }

    let regenEffect = state.EffectFactory.create(
      "regen",
      { hidden: true },
      { magnitude: 15 }
    );
    if (entity.addEffect(regenEffect)) {
      regenEffect.activate();
    }
  }

  /**
   * @param {string} args
   * @param {Player} player
   * @return {Entity|null} Found entity... or not.
   */
  static findCombatant(attacker, search) {
    if (!search.length) {
      return null;
    }

    let possibleTargets = [...attacker.room.npcs];
    if (attacker.getMeta("pvp")) {
      possibleTargets = [...possibleTargets, ...attacker.room.players];
    }

    const target = Parser.parseDot(search, possibleTargets);

    if (!target) {
      return null;
    }

    if (target === attacker) {
      throw new CombatErrors.CombatSelfError(
        "You smack yourself in the face. Ouch!"
      );
    }

    if (!target.hasBehavior("combat")) {
      throw new CombatErrors.CombatPacifistError(
        `${target.name} is a pacifist and will not fight you.`,
        target
      );
    }

    if (!target.hasAttribute("health")) {
      throw new CombatErrors.CombatInvalidTargetError(
        "You can't attack that target"
      );
    }

    if (!target.isNpc && !target.getMeta("pvp")) {
      throw new CombatErrors.CombatNonPvpError(
        `${target.name} has not opted into PvP.`,
        target
      );
    }

    return target;
  }
}

module.exports = Combat;
// console.log(module.exports);
