"use strict";

const handleIntraCmd = require("./intraCmdHandler");
const { commandTypes } = require("../lib/intraRoundCommitments/commands.enum");

module.exports = {
  command: (state) => (arg, character) =>
    handleIntraCmd(arg, character, commandTypes.PROBE),
};
