const { Broadcast: B, Logger } = require("ranvier");

module.exports = {
  newParry: (state) =>
    function (target) {
      B.sayAt(this, `You'll attempt to deflect their blow.`);
    },
  parryCommitMessage: (state) =>
    function (target) {
      B.sayAt(
        this,
        `You find yourself unable to pivot into that action from this stance.`
      );
    },
  parryPreparedMessage: (state) =>
    function (target) {
      B.sayAt(this, `Your weapon is in position to deflect!`);
    },
  parryAttempt: (state) =>
    function (target) {
      B.sayAt(this, `You attempt to deflect ${target}'s attack!`);
    },
  partialParry: (state) =>
    function (target) {
      B.sayAt(this, `Though your timing is off, you still deflect the blow.`);
    },
  perfectParry: (state) =>
    function (target) {
      B.sayAt(
        this,
        `Your timing is perfect, you fully deflect the blow and prepare to .`
      );
    },
  disadvantagedParry: (state) =>
    function (target) {
      B.sayAt(
        this,
        `They see through your attempt and easily bypass the deflection.`
      );
    },
  disadvantagedPerfectParry: (state) =>
    function (target) {
      B.sayAt(
        this,
        `Though ${target} powers through your deflection, you manage to avoid the worst of it.`
      );
    },
};
