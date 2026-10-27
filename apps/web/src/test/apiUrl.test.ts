import { apiUrl } from "../../e2e/support/apiUrl";

describe("apiUrl", () => {
  it("keeps the path relative to the Playwright baseURL when ARC_API_URL is unset", () => {
    expect(apiUrl("/api/x", undefined)).toBe("/api/x");
  });

  it("prefixes the path with ARC_API_URL, ignoring a trailing slash", () => {
    expect(apiUrl("/api/x", "http://localhost:4000/")).toBe("http://localhost:4000/api/x");
  });
});
