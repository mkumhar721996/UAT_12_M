import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AppHeader from "./AppHeader";

describe("AppHeader", () => {
  it("displays a logo (AC 3)", () => {
    render(<AppHeader current="dashboard" />);
    expect(within(screen.getByRole("banner")).getByText("Health")).toBeInTheDocument();
  });

  it("shows Home as current on the dashboard (AC 4)", () => {
    render(<AppHeader current="dashboard" />);
    const nav = screen.getByRole("navigation", { name: "Main" });
    const home = within(nav).getByRole("link", { name: "Home" });
    expect(home).toHaveAttribute("href", "#dashboard");
    expect(home).toHaveAttribute("aria-current", "page");
  });

  it("shows Records linking to Health records, with no Profile (AC 5)", () => {
    render(<AppHeader current="dashboard" />);
    const nav = screen.getByRole("navigation", { name: "Main" });
    const records = within(nav).getByRole("link", { name: "Records" });
    expect(records).toHaveAttribute("href", "#health-records");
    expect(records).not.toHaveAttribute("aria-current");
    expect(screen.queryByText(/profile/i)).toBeNull();
  });

  it("marks Records current on Health records", () => {
    render(<AppHeader current="health-records" />);
    expect(screen.getByRole("link", { name: "Records" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute("aria-current");
  });
});
