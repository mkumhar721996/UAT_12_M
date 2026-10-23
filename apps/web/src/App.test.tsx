import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

beforeEach(() => {
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
});

afterEach(() => {
  vi.unstubAllGlobals();
  window.location.hash = "";
});

// jsdom may not fire hashchange synchronously on anchor clicks; dispatch it explicitly.
function navigate(name: string) {
  const href = screen.getByRole("link", { name }).getAttribute("href") ?? "";
  fireEvent.click(screen.getByRole("link", { name }));
  act(() => {
    window.location.hash = href;
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  });
}

describe("App", () => {
  it("renders the Dashboard with the only records link in the header (AC 1, 14)", async () => {
    window.location.hash = "#dashboard";
    render(<App />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
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

  it("shows the same header on Health records (AC 2)", () => {
    window.location.hash = "#health-records";
    render(<App />);
    expect(screen.getByRole("heading", { name: "Health records" })).toBeInTheDocument();
    const header = screen.getByRole("banner");
    expect(within(header).getByRole("link", { name: "Home" })).toBeInTheDocument();
    expect(within(header).getByRole("link", { name: "Records" })).toBeInTheDocument();
  });

  it("returns to the Dashboard when Home is selected (AC 6)", async () => {
    window.location.hash = "#health-records";
    render(<App />);
    navigate("Home");
    expect(await screen.findByRole("heading", { name: "Today" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page");
  });

  it("shows Health records when Records is selected (AC 7)", async () => {
    window.location.hash = "#dashboard";
    render(<App />);
    navigate("Records");
    expect(await screen.findByRole("heading", { name: "Health records" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Records" })).toHaveAttribute("aria-current", "page");
  });
});
