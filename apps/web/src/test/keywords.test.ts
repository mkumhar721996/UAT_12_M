import { keywordsOf, sharesKeyword } from "../../e2e/support/keywords";

describe("keywordsOf", () => {
  it("returns lowercase words of 4+ letters without stop words", () => {
    expect(keywordsOf("The Export of invoices")).toEqual(["export", "invoices"]);
  });

  it("de-duplicates", () => {
    expect(keywordsOf("Export export EXPORT")).toEqual(["export"]);
  });
});

describe("sharesKeyword", () => {
  it("is true when a criterion contains a story keyword", () => {
    expect(
      sharesKeyword(["Invoice export is a CSV file"], "Export invoices", "Finance wants invoice data"),
    ).toBe(true);
  });

  it("is false when no criterion shares a keyword", () => {
    expect(sharesKeyword(["Page loads quickly"], "Export invoices", "Finance wants invoice data")).toBe(false);
  });

  it("is false for an empty criteria list", () => {
    expect(sharesKeyword([], "Export invoices", "x")).toBe(false);
  });
});
