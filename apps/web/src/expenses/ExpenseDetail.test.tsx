import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ExpenseDetail from "./ExpenseDetail";
import { createMemoryExpenseStore } from "./expenseStore";
import SummaryView from "./SummaryView";

function setup() {
  const store = createMemoryExpenseStore("u1", [
    { id: "a", userId: "u1", category: "Travel", cents: 4000, date: "2026-10-12" },
    { id: "b", userId: "u1", category: "Meals", cents: 1200, date: "2026-10-08" },
  ]);
  const onDone = vi.fn();
  render(<ExpenseDetail store={store} id="a" onDone={onDone} />);
  return { store, onDone };
}

describe("ExpenseDetail", () => {
  it("shows exactly one category badge from the fixed list (AC 2)", () => {
    setup();
    expect(screen.getByText("Travel", { selector: "[data-category-badge]" })).toBeInTheDocument();
    expect(document.querySelectorAll("[data-category-badge]")).toHaveLength(1);
    expect(screen.getByText("40.00")).toBeInTheDocument();
    expect(screen.getByText("12 Oct 2026")).toBeInTheDocument();
  });

  it("asks for confirmation, then deletes through the store (AC 20)", () => {
    const { store, onDone } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    const dialog = screen.getByRole("dialog", { name: "Delete this expense?" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    expect(store.list()).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete expense" }));
    expect(store.list().map((x) => x.id)).toEqual(["b"]);
    expect(onDone).toHaveBeenCalled();
  });

  it("edits amount and category through the store (AC 20)", () => {
    const { store } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByLabelText("Amount"), { target: { value: "50.00" } });
    fireEvent.change(screen.getByLabelText("Category"), { target: { value: "Office" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(store.list()[0]).toMatchObject({ cents: 5000, category: "Office" });
    expect(screen.getByText("Office", { selector: "[data-category-badge]" })).toBeInTheDocument();
  });

  it("says so when the expense does not exist", () => {
    const store = createMemoryExpenseStore("u1");
    render(<ExpenseDetail store={store} id="nope" onDone={() => {}} />);
    expect(screen.getByText("Expense not found.")).toBeInTheDocument();
  });

  it("updates an open summary when the expense is deleted (AC 20)", () => {
    const store = createMemoryExpenseStore("u1", [
      { id: "a", userId: "u1", category: "Travel", cents: 4000, date: "2026-10-12" },
    ]);
    render(<SummaryView store={store} today={() => "2026-10-23"} />);
    expect(screen.getByRole("link", { name: /Travel/ })).toHaveAttribute("href", "#expenses/a");
    act(() => store.remove("a"));
    expect(screen.queryByRole("link", { name: /Travel/ })).toBeNull();
    expect(screen.getByText("No expenses in this period")).toBeInTheDocument();
  });
});
