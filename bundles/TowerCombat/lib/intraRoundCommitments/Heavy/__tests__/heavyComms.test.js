const { heavyEmits } = require("../heavy.enum");
const heavyComms = require("../heavyComms");

describe("all emits have matching comms", () => {
  it.each(Object.keys(heavyEmits))(
    "has a comm for each emit definition",
    (emit) => {
      expect(heavyComms[emit]).toBeDefined();
    }
  );
});
