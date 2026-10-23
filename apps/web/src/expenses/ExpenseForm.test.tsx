import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CATEGORIES } from "./categories";
import ExpenseForm from "./ExpenseForm";
import { createMemoryExpenseStore } from "./expenseStore";

function setup(amount: string, category?: string) {
  const store = createMemoryExpenseStore("u1");
  render(<ExpenseForm store={store} today={() => "2026-10-23"} />);
  fireEvent.change(screen.getByLabelText("Amount"), { target: { value: amount } });
  if (category) fireEvent.change(screen.getByLabelText("Category"), { target: { value: category } });
  fireEvent.click(screen.getByRole("button", { name: "Save" }));
  return store;
}

describe("ExpenseForm", () => {
  it("saves with exactly one category from the fixed list (AC 2)", () => {
    const store = setup("18.00", "Meals");
    expect(store.list()).toHaveLength(1);
    expect(CATEGORIES).toContain(store.list()[0].category);
    expect(store.list()[0]).toMatchObject({ cents: 1800, date: "2026-10-23" });
  });

  it("does not save without a category (AC 18)", () => {
    const store = setup("18.00");
    expect(store.list()).toHaveLength(0);
  });

  it("asks for a category and focuses the select (AC 19)", () => {
    setup("18.00");
    expect(screen.getByRole("alert")).toHaveTextContent("Choose a category before saving.");
    expect(screen.getByLabelText("Category")).toHaveFocus();
    expect(screen.getByLabelText("Category")).toHaveAttribute("aria-invalid", "true");
    fireEvent.change(screen.getByLabelText("Category"), { target: { value: "Travel" } });
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("does not save an amount of zero or less", () => {
    const store = setup("0", "Travel");
    expect(store.list()).toHaveLength(0);
    expect(screen.getByRole("alert")).toHaveTextContent("Enter an amount greater than 0.00.");
  });
});
