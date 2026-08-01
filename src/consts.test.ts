import { describe, test, expect } from "vitest";

import { BASE_PATH } from "./consts";

describe("BASE_PATH", () => {
  test("is empty when the site is served from the domain root", () => {
    expect(BASE_PATH).toBe("");
  });
});
