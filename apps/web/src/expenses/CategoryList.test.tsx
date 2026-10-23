import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CategoryList from "./CategoryList";

describe("CategoryList", () => {
  it("shows exactly Travel, Meals, Office and Other (AC 1)", () => {
    render(<CategoryList />);
    const items = screen.getAllByRole("listitem").map((li) => within(li).getAllByText(/./)[0].textContent);
    expect(items).toEqual(["Travel", "Meals", "Office", "Other"]);
  });

  it("has no add, rename or remove control (AC 3)", () => {
    render(<CategoryList />);
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.queryByRole("textbox")).toBeNull();
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByText("Categories are fixed and cannot be changed.")).toBeInTheDocument();
  });
});
