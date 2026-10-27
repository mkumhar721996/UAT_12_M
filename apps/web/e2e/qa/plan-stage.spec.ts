import { expect, test } from "@playwright/test";
import { resolveQaTarget } from "./qaTarget";
import { readStoryState } from "./storyState";

const { projectName } = resolveQaTarget(process.env);

test("runs the plan stage on a refined story and shows a plan", async ({ page }) => {
  const story = readStoryState();

  await page.goto("/");
  expect(new URL(page.url()).hostname).toBe("qa.bnts-arc.ai");

  await page.goto(`/projects/${projectName}`);
  await page.getByRole("link", { name: story.title }).click();

  await page.getByRole("button", { name: /run plan/i }).click();

  await expect(page.getByRole("heading", { name: /plan/i })).toBeVisible({ timeout: 300_000 });
  await expect(page.getByTestId("story-plan")).not.toBeEmpty();
});
