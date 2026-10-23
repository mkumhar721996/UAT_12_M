import { act, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ExpenseList from "./ExpenseList";
import { createMemoryExpenseStore } from "./expenseStore";

describe("ExpenseList", () => {
  it("lists each expense with one category and links to its detail (AC 2)", () => {
    const store = createMemoryExpenseStore("u1", [
      { id: "a", userId: "u1", category: "Travel", cents: 4000, date: "2026-10-12" },
    ]);
    render(<ExpenseList store={store} />);
    const row = screen.getByRole("link", { name: /Travel/ });
    expect(row).toHaveAttribute("href", "#expenses/a");
    expect(within(row).getByText("40.00")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Add expense" })).toHaveAttribute("href", "#expenses/new");
  });

  it("shows an empty note and follows new expenses", () => {
    const store = createMemoryExpenseStore("u1");
    render(<ExpenseList store={store} />);
    expect(screen.getByText("No expenses recorded")).toBeInTheDocument();
    act(() => {
      store.add({ category: "Meals", cents: 500, date: "2026-10-01" });
    });
    expect(screen.getByRole("link", { name: /Meals/ })).toBeInTheDocument();
  });
});
