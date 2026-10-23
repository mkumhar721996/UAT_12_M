import { describe, expect, it } from "vitest";
import type { Category } from "./categories";
import type { Expense } from "./expenseStore";
import { formatMoney, sharePercent, summarise } from "./summary";

const month = { from: "2026-10-01", to: "2026-10-31" };
let n = 0;
const e = (category: Category, cents: number, date = "2026-10-10"): Expense => ({
  id: String(++n),
  userId: "u1",
  category,
  cents,
  date,
});

describe("summarise", () => {
  const list = [e("Travel", 4000), e("Travel", 2550), e("Meals", 1200)];

  it("totals per category (AC 4)", () => {
    const s = summarise(list, month);
    expect(formatMoney(s.byCategory.Travel)).toBe("65.50");
    expect(formatMoney(s.byCategory.Meals)).toBe("12.00");
  });

  it("totals overall (AC 5)", () => {
    expect(formatMoney(summarise(list, month).overall)).toBe("77.50");
  });

  it("counts both range ends and nothing outside (AC 9)", () => {
    const s = summarise(
      [
        e("Other", 100, "2026-09-30"),
        e("Other", 200, "2026-10-01"),
        e("Other", 400, "2026-10-31"),
        e("Other", 800, "2026-11-01"),
      ],
      month,
    );
    expect(s.overall).toBe(600);
  });

  it("has every category at 0 when empty (AC 10)", () => {
    expect(summarise([], month)).toEqual({
      byCategory: { Travel: 0, Meals: 0, Office: 0, Other: 0 },
      overall: 0,
    });
  });
});

describe("formatMoney", () => {
  it("renders cents with two decimals", () => {
    expect(formatMoney(6550)).toBe("65.50");
    expect(formatMoney(0)).toBe("0.00");
    expect(formatMoney(5)).toBe("0.05");
  });
});

describe("sharePercent", () => {
  it("rounds a share and is 0 when overall is 0", () => {
    expect(sharePercent(6550, 7750)).toBe(85);
    expect(sharePercent(0, 0)).toBe(0);
  });
});
