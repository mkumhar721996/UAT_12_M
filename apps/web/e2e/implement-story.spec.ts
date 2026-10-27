import { expect, test } from "@playwright/test";
import {
  createPlannedStory,
  escapeRegExp,
  IMPLEMENT_TIMEOUT,
  isImplementStageConfigured,
  openStory,
  sandboxRepoUrl,
} from "./support/story";

test.skip(
  !isImplementStageConfigured(),
  "Set ARC_E2E_BASE_URL and ARC_SANDBOX_REPO_URL to run the implement-stage tests",
);
test.setTimeout(IMPLEMENT_TIMEOUT + 60_000);

test("a planned story starts implementing with no action from the test", async ({ page }) => {
  const story = await createPlannedStory(page);
  await openStory(page, story);
  await expect(page.getByTestId("story-status")).not.toHaveText(/planned/i, {
    timeout: IMPLEMENT_TIMEOUT,
  });
  await expect(page.getByTestId("story-status")).toHaveText(/implement/i);
});

test("a finished implementation shows an open pull request on the story", async ({ page }) => {
  const story = await createPlannedStory(page);
  await openStory(page, story);
  const pr = page.getByTestId("story-pull-request");
  await expect(pr).toBeVisible({ timeout: IMPLEMENT_TIMEOUT });
  await expect(pr).toContainText(/open/i);
  await expect(pr.getByRole("link")).toHaveAttribute(
    "href",
    new RegExp(`^${escapeRegExp(sandboxRepoUrl())}/pull/\\d+$`),
  );
});

test("a story whose implementation has not finished shows no pull request", async ({ page }) => {
  const story = await createPlannedStory(page);
  await openStory(page, story);
  await expect(page.getByTestId("story-status")).toHaveText(/implement/i, {
    timeout: IMPLEMENT_TIMEOUT,
  });
  await expect(page.getByTestId("story-pull-request")).toHaveCount(0);
});
