const { lightEmits } = require("../light.enum");
const lightComms = require("../lightComms");

describe("all emits have matching comms", () => {
  it.each(Object.keys(lightEmits))(
    "has a comm for each emit definition",
    (emit) => {
      expect(lightComms[emit]).toBeDefined();
    }
  );
});
