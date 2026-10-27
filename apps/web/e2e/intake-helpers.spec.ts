import { expect, test } from "@playwright/test";
import { expectDraftedStory } from "./qa/intake-helpers";

test("expectDraftedStory resolves when a drafted story is shown (check passes)", async ({
  page,
}) => {
  await page.setContent(`<article aria-label="T1"><span>Drafted</span></article>`);
  await expect(expectDraftedStory(page, "T1", 1_000)).resolves.toBeUndefined();
});

test("expectDraftedStory rejects when no drafted story appears (check fails)", async ({
  page,
}) => {
  await page.setContent(`<main>No stories yet</main>`);
  await expect(expectDraftedStory(page, "T2", 500)).rejects.toThrow();
});
