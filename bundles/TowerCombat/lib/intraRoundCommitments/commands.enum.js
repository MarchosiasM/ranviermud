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
  parry: "PARRY",
  dodge: "DODGE",
  guard: "GUARD",
  probe: "PROBE",
  "light strike": "LIGHT",
  "heavy strike": "HEAVY",
};

const evadableTypes = {
  [commandTypes.LIGHT]: commandTypes.LIGHT,
  [commandTypes.HEAVY]: commandTypes.HEAVY,
};

const layers = {
  DEFENSE: "DEFENSE",
  OFFENSE: "OFFENSE",
};

const damageTypes = {
  PHYSICAL: "PHYSICAL",
};

module.exports = {
  perceptionTypes,
  commandTypes,
  evadableTypes,
  layers,
  damageTypes,
};
