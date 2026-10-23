import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CATEGORIES, type Category } from "./categories";
import { createMemoryExpenseStore, type Expense } from "./expenseStore";
import SummaryView from "./SummaryView";

const today = () => "2026-10-23";
const row = (id: string, category: Category, cents: number, date = "2026-10-10", userId = "u1"): Expense => ({
  id,
  userId,
  category,
  cents,
  date,
});
const seed = [
  row("a", "Travel", 4000),
  row("b", "Travel", 2550),
  row("c", "Meals", 1200),
  row("x", "Travel", 99900, "2026-10-10", "u2"),
];

function setup(rows: Expense[] = seed) {
  const store = createMemoryExpenseStore("u1", rows);
  render(<SummaryView store={store} today={today} />);
  return store;
}
const tileFor = (c: Category) => screen.getByText(c, { selector: ".tile-label" }).closest(".card") as HTMLElement;
const overallTile = () => screen.getByText("Overall total").closest(".card") as HTMLElement;
const chooseCustom = (from: string, to: string) => {
  fireEvent.click(screen.getByRole("tab", { name: "Custom" }));
  fireEvent.change(screen.getByLabelText("From"), { target: { value: from } });
  fireEvent.change(screen.getByLabelText("To"), { target: { value: to } });
  fireEvent.click(screen.getByRole("button", { name: "Apply" }));
};

describe("SummaryView", () => {
  it("shows category totals (AC 4) and overall (AC 5), excluding other users (AC 6)", () => {
    setup();
    expect(within(tileFor("Travel")).getByText("65.50")).toBeInTheDocument();
    expect(within(tileFor("Meals")).getByText("12.00")).toBeInTheDocument();
    expect(within(overallTile()).getByText("77.50")).toBeInTheDocument();
  });

  it("offers week, month and year presets (AC 7)", () => {
    setup();
    const tabs = within(screen.getByRole("tablist", { name: "Period" })).getAllByRole("tab");
    expect(tabs.map((t) => t.textContent)).toEqual(expect.arrayContaining(["Week", "Month", "Year"]));
  });

  it("defaults to the current month (AC 8)", () => {
    setup();
    expect(screen.getByRole("tab", { name: "Month" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("1 Oct 2026 to 31 Oct 2026")).toBeInTheDocument();
  });

  it("switches to the week preset (AC 16)", () => {
    setup();
    fireEvent.click(screen.getByRole("tab", { name: "Week" }));
    expect(screen.getByText("19 Oct 2026 to 25 Oct 2026")).toBeInTheDocument();
  });

  it("counts only expenses within a custom range, inclusive (AC 9)", () => {
    setup([
      row("1", "Other", 100, "2026-09-30"),
      row("2", "Other", 200, "2026-10-01"),
      row("3", "Other", 400, "2026-10-31"),
      row("4", "Other", 800, "2026-11-01"),
    ]);
    chooseCustom("2026-10-01", "2026-10-31");
    expect(within(overallTile()).getByText("6.00")).toBeInTheDocument();
  });

  it("shows 0.00 in every category and the note when empty (AC 10, 11)", () => {
    setup([]);
    for (const c of CATEGORIES) expect(within(tileFor(c)).getByText("0.00")).toBeInTheDocument();
    expect(screen.getByText("No expenses in this period")).toBeInTheDocument();
  });

  it("hides the note when expenses exist in range", () => {
    setup();
    expect(screen.queryByText("No expenses in this period")).toBeNull();
  });

  it("shows an error and no totals when from is after to (AC 12, 13)", () => {
    setup();
    chooseCustom("2026-10-25", "2026-10-01");
    expect(screen.getByRole("alert")).toHaveTextContent("From date must be on or before the to date.");
    expect(screen.queryByText("Overall total")).toBeNull();
    expect(screen.queryByText("Travel")).toBeNull();
  });

  it.each([
    ["from", "", "2026-10-31"],
    ["to", "2026-10-01", ""],
  ])("shows an error and no totals when %s is missing (AC 14, 15)", (_name, from, to) => {
    setup();
    chooseCustom(from, to);
    expect(screen.getByRole("alert")).toHaveTextContent("Enter both a from date and a to date.");
    expect(screen.queryByText("Overall total")).toBeNull();
  });

  it("follows an add without a reload (AC 20)", () => {
    const store = setup();
    act(() => {
      store.add({ category: "Travel", cents: 1000, date: "2026-10-10" });
    });
    expect(within(tileFor("Travel")).getByText("75.50")).toBeInTheDocument();
    expect(within(overallTile()).getByText("87.50")).toBeInTheDocument();
  });

  it("follows an update and a remove (AC 20)", () => {
    const store = setup();
    act(() => {
      store.update("a", { cents: 5000 });
    });
    expect(within(tileFor("Travel")).getByText("75.50")).toBeInTheDocument();
    act(() => {
      store.remove("a");
    });
    expect(within(tileFor("Travel")).getByText("25.50")).toBeInTheDocument();
    expect(within(overallTile()).getByText("37.50")).toBeInTheDocument();
  });

  it("ignores an add dated outside the period (AC 20)", () => {
    const store = setup();
    act(() => {
      store.add({ category: "Travel", cents: 1000, date: "2026-09-10" });
    });
    expect(within(overallTile()).getByText("77.50")).toBeInTheDocument();
  });
});
