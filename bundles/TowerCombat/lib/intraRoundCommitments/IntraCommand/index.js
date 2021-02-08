const { perceptionTypes } = require("../commands.enum");
const { Player } = require("ranvier");
const { Damage } = require("ranvier");
const perceptionEnums = require("../../Perception/percept.enum");

class IntraCommand {
  constructor(user, target) {
    if (!user || !target) throw new TypeError("Please define user and target");
    if (this.constructor === IntraCommand)
      throw new TypeError(`Abstract class shouldn't be instantiated itself`);
    this.enforceConfig();
    this.user = user;
    this.target = target;
    this.elapsedRounds = 0;
    this.completed = false;
  }

  isInstanceOf(string) {
    return string.match(new RegExp(this.type, "gi"));
  }

  update() {}

  elapseRounds(times = 1) {
    this.elapsedRounds += times;
  }

  compareAndApply() {}
  /**
   * This funciton reinforces basic rules for the configs. A sanity check
   * against my own carelessness.
   */
  enforceConfig() {
    if (this.user instanceof Player)
      throw new Error(
        "Passed something other than a player to your intraCommand"
      );
    if (this.target instanceof Player)
      throw new Error(
        "Passed something other than a player to your intraCommand"
      );
    const { config } = this;
    if (config == null) throw new Error("Config is undefined");
    if (typeof config.castTime !== "number")
      throw new Error("castTime should be a number");
    if (typeof config.range !== "number")
      throw new Error("range should be a number");
    if (typeof config.disruptive !== "number")
      throw new Error("disruptive should be a number");
    const mapping = perceptionTypes[config.perceiveAs];
    if (!mapping)
      throw new Error(
        `perceivedAs "${config.perceiveAs}" isn't in the commandType map, returned
        ${mapping}`
      );
    if (
      typeof config.perceptMod !== "number" ||
      config.perceptMod < 0 ||
      config.perceptMod > 1
    )
      throw new Error("perceptMod must be a number from 0 to 1");
    if (
      typeof config.perceptThreshold !== "number" ||
      config.perceptThreshold < 0 ||
      config.perceptThreshold > 100
    )
      throw new Error(
        `perceptThreshold must be a number from 0 to 100, received ${config.perceptThreshold}`
      );
  }

  isTypeOf() {
    return false;
  }

  get damageType() {
    return null;
  }

  get config() {
    return {
      castTime: 2,
      range: 1,
      interruptable: null,
      type: null, // strike, probe, parry, dodge
      disruptive: 0, // 0 to
      perceiveAs: perceptionTypes.DEFENSE,
      perceptMod: 1, // 0 to 1, 1 being the most perceptive, 0 being unable to perceive
      perceptThreshold: 10, // 0 to 100, 100 being totally unperceptable,
      baseDamage: 1,
    };
  }

  commit() {
    if (!this.ready) return;
    if (this.mitigated.avoided) {
      return;
    }
    const mod = this.mitigated.mult;
    let amount = this.config.baseDamage;
    if (mod) {
      amount = Math.ceil(amount * mod);
    }
    const weapon = this.user.equipment.get("wield");
    const damage = new Damage("health", amount, this.user, weapon || this.user);
    damage.commit(this.target);
    this.completed = true;
  }

  setReady() {
    this.elapsedRounds === this.config.castTime;
  }

  percept(outcome) {
    if (perceptionEnums.SUCCESS === outcome) {
      return this.perceptMap[perceptionEnums.SUCCESS][this.elapsedRounds]({
        name: this.user.name,
      });
    }
    return this.perceptMap[perceptionEnums.PARTIAL_SUCCESS]({
      name: this.user.name,
    });
  }
}

module.exports = IntraCommand;
