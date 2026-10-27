import { expect, test } from "@playwright/test";
import { createPlannedStory } from "./helpers/plannedStory";

test("UX design stage produces design screens for a planned story", async ({
  page,
}) => {
  const { storyUrl } = await createPlannedStory(page);
  await page.goto(storyUrl);

  await page.getByRole("button", { name: /start ux design/i }).click();
  const stageStatus = page.getByTestId("ux-design-stage-status");
  await expect(stageStatus).toHaveText(/started|in progress/i);

  await expect(stageStatus).toHaveText(/complete/i, { timeout: 540_000 });

  await page.getByRole("tab", { name: /design/i }).click();
  await expect(page.getByTestId("design-screen")).not.toHaveCount(0);
});
