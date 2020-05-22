const perceptionTypes = {
  ATTACK: "ATTACK",
  DEFENSE: "DEFENSE",
  BIG_ATTACK: "BIG_ATTACK",
  BIG_DEFENSE: "BIG_DEFENSE",
};

const commandTypes = {
  DODGE: "dodge",
  GUARD: "guard",
  PROBE: "probe",
  LIGHT: "light strike",
  HEAVY: "heavy strike",
  PARRY: "parry",
};

const evadableTypes = {
  [commandTypes.LIGHT]: commandTypes.LIGHT,
  [commandTypes.HEAVY]: commandTypes.HEAVY,
};

module.exports = {
  perceptionTypes,
  commandTypes,
  evadableTypes,
};
