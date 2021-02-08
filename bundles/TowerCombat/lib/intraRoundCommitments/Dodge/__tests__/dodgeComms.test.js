const { dodgeEmit } = require("../dodge.enum");
const dodgeComms = require("../dodgeComms");

describe("all emits have matching comms", () => {
  it.each(Object.keys(dodgeEmit))(
    "has a comm for each emit definition",
    (emit) => {
      expect(dodgeComms[emit]).toBeDefined();
    }
  );
});
