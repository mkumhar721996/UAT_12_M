import { expect, test } from "@playwright/test";
import { sharesKeyword } from "./support/keywords";
import { createStory, listStories, refineStory, waitForRefined } from "./support/storyApi";

test("refines acceptance criteria on a story created by the test", async ({ request }) => {
  const title = `Refine AC ${Date.now()}`;
  const description = "Customers want to export their invoices as a spreadsheet file";

  const story = await createStory(request, { title, description });
  const listed = await listStories(request);
  expect(listed.map((s) => s.id)).toContain(story.id);
  expect(story.refinementStatus).toBe("none");

  await refineStory(request, story.id);
  const refined = await waitForRefined(request, story.id);

  expect(refined.refinementStatus).toBe("done");
  expect(Array.isArray(refined.acceptanceCriteria)).toBe(true);
  expect(refined.acceptanceCriteria.length).toBeGreaterThan(0);
  for (const criterion of refined.acceptanceCriteria) {
    expect(criterion.trim().length).toBeGreaterThan(0);
  }
  expect(sharesKeyword(refined.acceptanceCriteria, story.title, story.description)).toBe(true);
});
