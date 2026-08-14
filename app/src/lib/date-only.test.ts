import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { getLocalDateString } from "./date-only";

describe("getLocalDateString", () => {
  it("usa o calendário local, inclusive perto da meia-noite", () => {
    assert.equal(getLocalDateString(new Date(2026, 6, 13, 23, 59, 59)), "2026-07-13");
    assert.equal(getLocalDateString(new Date(2026, 6, 14, 0, 0, 1)), "2026-07-14");
  });
});
