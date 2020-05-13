"use strict";

const { Broadcast, EffectFlag } = require("ranvier");

module.exports = {
  id: "offBalance",
  config: {
    name: "Off Balance",
    unique: true,
    persists: false,
    maxStacks: 3,
  },
  description: "You feel less sure-footed, complicating your attack strategy!",
  duration: 3 * 6000,
  elapsed: 0,
  flags: [EffectFlag.DEBUFF],
  state: {},
  modifiers: {},
  listeners: {
    killed() {
      this.remove();
    },
    effectActivated: function () {
      Broadcast.sayAt(this.target, "You feel off-balance!");
    },

    effectDeactivated: function () {
      Broadcast.sayAt(this.target, "You regain your footing.");
    },
  },
};
