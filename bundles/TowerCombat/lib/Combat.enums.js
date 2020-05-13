const roundState = {
  PREPARE: "PREPARE",
  REACT: "REACT",
  RESOLUTION: "RESOLUTION",
};

const combatOptions = {
  STRIKE: "STRIKE",
  DODGE: "DODGE",
  BLOCK: "BLOCK",
  RETREAT: "RETREAT",
  FEINT: "FEINT",
};

const resultPosition = {
  GR_ADVANTAGED: "GR_ADVANTAGED",
  ADVANTAGED: "ADVANTAGED",
  NEUTRAL: "NEUTRAL",
  DISADVANTAGED: "DISADVANTAGED",
  GR_DISADVANTAGED: "GR_DISADVANTAGED",
};

const probabilityMap = {
  SOFTEN_BLOW: 0.75,
  MITIGATE_BLOW: 0.50,
  DEFLECT_BLOW: 0.25,
};

module.exports = {
  roundState,
  combatOptions,
  resultPosition,
  probabilityMap,
};
