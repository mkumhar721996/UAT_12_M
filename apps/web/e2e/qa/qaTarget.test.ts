import { describe, expect, it } from "vitest";
import { resolveQaTarget } from "./qaTarget";

describe("resolveQaTarget", () => {
  it("defaults to the QA environment", () => {
    const t = resolveQaTarget({ ARC_QA_PROJECT_NAME: "p" });
    expect(t.baseURL).toBe("https://qa.bnts-arc.ai");
    expect(t.projectName).toBe("p");
  });

  it("honours an ARC_QA_BASE_URL override", () => {
    const t = resolveQaTarget({ ARC_QA_PROJECT_NAME: "p", ARC_QA_BASE_URL: "https://x.example" });
    expect(t.baseURL).toBe("https://x.example");
  });

  it("throws when the project name is not configured", () => {
    expect(() => resolveQaTarget({})).toThrow(/ARC_QA_PROJECT_NAME/);
  });
});
