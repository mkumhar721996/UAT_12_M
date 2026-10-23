import { describe, expect, it } from "vitest";
import { formatRange, presetRange, validateCustomRange } from "./period";

describe("presetRange", () => {
  it("week runs Monday to Sunday (AC 16)", () => {
    expect(presetRange("week", "2026-10-23")).toEqual({ from: "2026-10-19", to: "2026-10-25" });
  });

  it("a Sunday and a Monday give the same week", () => {
    const week = { from: "2026-10-19", to: "2026-10-25" };
    expect(presetRange("week", "2026-10-25")).toEqual(week);
    expect(presetRange("week", "2026-10-19")).toEqual(week);
  });

  it("a week can span a month boundary", () => {
    expect(presetRange("week", "2026-11-01")).toEqual({ from: "2026-10-26", to: "2026-11-01" });
  });

  it("month runs first to last day (AC 17)", () => {
    expect(presetRange("month", "2026-10-23")).toEqual({ from: "2026-10-01", to: "2026-10-31" });
  });

  it("February ends on the 29th in a leap year", () => {
    expect(presetRange("month", "2028-02-10")).toEqual({ from: "2028-02-01", to: "2028-02-29" });
  });

  it("year runs 1 Jan to 31 Dec", () => {
    expect(presetRange("year", "2026-10-23")).toEqual({ from: "2026-01-01", to: "2026-12-31" });
  });
});

describe("validateCustomRange", () => {
  it("accepts from on or before to", () => {
    expect(validateCustomRange("2026-10-01", "2026-10-01")).toEqual({
      ok: true,
      range: { from: "2026-10-01", to: "2026-10-01" },
    });
  });

  it("rejects from after to (AC 12)", () => {
    expect(validateCustomRange("2026-10-25", "2026-10-01")).toEqual({
      ok: false,
      message: "From date must be on or before the to date.",
    });
  });

  it("rejects a missing from or to (AC 14)", () => {
    const missing = { ok: false, message: "Enter both a from date and a to date." };
    expect(validateCustomRange("", "2026-10-31")).toEqual(missing);
    expect(validateCustomRange("2026-10-01", "")).toEqual(missing);
  });
});

describe("formatRange", () => {
  it("formats as d Mon yyyy to d Mon yyyy", () => {
    expect(formatRange({ from: "2026-10-01", to: "2026-10-31" })).toBe("1 Oct 2026 to 31 Oct 2026");
  });
});
