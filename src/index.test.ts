import { main } from "./index.js";

test("main runs", () => {
  expect(main).not.toThrow();
});
