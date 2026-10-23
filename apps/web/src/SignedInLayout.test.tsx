import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SignedInLayout from "./SignedInLayout";

describe("SignedInLayout", () => {
  it("mounts the header only inside the layout (AC 8)", () => {
    const { unmount } = render(
      <main>
        <h1>Sign in to Health</h1>
      </main>,
    );
    expect(screen.queryByRole("banner")).toBeNull();
    expect(screen.queryByRole("navigation", { name: "Main" })).toBeNull();
    unmount();
    render(
      <SignedInLayout current="dashboard">
        <main />
      </SignedInLayout>,
    );
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });
});
