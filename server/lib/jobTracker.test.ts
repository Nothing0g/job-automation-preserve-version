import { describe, expect, it } from "vitest";
import { parseFollowUpDate } from "./jobTracker";

describe("job tracker dates", () => {
  it("stores a date-only follow-up at a stable UTC time", () => {
    expect(parseFollowUpDate("2026-08-17")?.toISOString()).toBe("2026-08-17T12:00:00.000Z");
  });

  it("allows a tracker action without a scheduled date", () => {
    expect(parseFollowUpDate(null)).toBeNull();
  });

  it("rejects malformed dates", () => {
    expect(() => parseFollowUpDate("17/08/2026")).toThrow("YYYY-MM-DD");
  });
});
