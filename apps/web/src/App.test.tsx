import { act, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("App", () => {
  it("renders the Dashboard with the only records link in the header (AC 14)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          readings: [],
          appointments: [],
          care: { doctorName: null, lastVisitDate: null },
        }),
      }),
    );
    render(<App />);
    expect(screen.getByRole("heading", { name: "Today" })).toBeInTheDocument();
    const records = await screen.findAllByRole("link", { name: /records/i });
    expect(records).toHaveLength(1);
    expect(within(screen.getByRole("banner")).getByRole("link", { name: "Records" })).toBe(
      records[0],
    );
    const main = within(screen.getByRole("main"));
    expect(main.queryByRole("link", { name: /record/i })).toBeNull();
    expect(main.queryByRole("button", { name: /record/i })).toBeNull();
  });

  it("links to Expenses, Categories and Summary from the sidebar and opens each", () => {
    window.location.hash = "#categories";
    render(<App />);
    const nav = within(screen.getByRole("navigation", { name: "Main" }));
    for (const name of ["Expenses", "Categories", "Summary"]) {
      expect(nav.getByRole("link", { name })).toBeInTheDocument();
    }
    expect(screen.getByRole("heading", { name: "Categories" })).toBeInTheDocument();
    act(() => {
      window.location.hash = "#summary";
    });
    return waitFor(() =>
      expect(screen.getByRole("heading", { name: "Summary" })).toBeInTheDocument(),
    );
  });
});
