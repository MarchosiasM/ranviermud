const { Broadcast: B, Logger } = require("ranvier");
const { parryEmits } = require("./Parry.enum");

const {
  NEW_PARRY,
  PARRY_PREPARED,
  PARTIAL_PARRY,
  PERFECT_PARRY,
  PARRY_COMMIT,
} = parryEmits;

module.exports = {
  [NEW_PARRY]: (state) =>
    function (target) {
      B.sayAt(this, `You'll attempt to deflect their blow.`);
    },
  [PARRY_COMMIT]: (state) =>
    function (target) {
      B.sayAt(
        this,
        `You find yourself unable to pivot into that action from this stance.`
      );
    },
  [PARRY_PREPARED]: (state) =>
    function (target) {
      B.sayAt(this, `Your weapon is in position to deflect!`);
    },
  parryAttempt: (state) =>
    function (target) {
      B.sayAt(this, `You attempt to deflect ${target}'s attack!`);
    },
  [PARTIAL_PARRY]: (state) =>
    function (target) {
      B.sayAt(this, `Though your timing is off, you still deflect the blow.`);
    },
  [PERFECT_PARRY]: (state) =>
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
