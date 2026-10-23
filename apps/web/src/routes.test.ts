import { describe, expect, it } from "vitest";
import { parseRoute } from "./routes";

describe("parseRoute", () => {
  it("maps known hashes and falls back to the dashboard", () => {
    expect(parseRoute("#health-records")).toBe("health-records");
    expect(parseRoute("#dashboard")).toBe("dashboard");
    expect(parseRoute("")).toBe("dashboard");
    expect(parseRoute("#nonsense")).toBe("dashboard");
  });
});
