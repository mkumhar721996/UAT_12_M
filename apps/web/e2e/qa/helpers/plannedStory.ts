import { expect, type Page } from "@playwright/test";

const PLAN_TIMEOUT_MS = 120_000;

// Creates a story and takes it through the plan stage via the real web UI.
// Independent of the plan-stage spec. Selectors are to be confirmed against QA.
export async function createPlannedStory(
  page: Page,
): Promise<{ storyUrl: string; title: string }> {
  const title = `e2e-ux-design-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  try {
    await page.goto("/");
    await page.getByRole("button", { name: /new story|create story/i }).click();
    await page.getByLabel(/title/i).fill(title);
    await page.getByRole("button", { name: /^(create|save)/i }).click();
    await page.waitForURL(/stor(y|ies)\//);

    await page.getByRole("button", { name: /start plan/i }).click();
    await expect(page.getByTestId("story-status")).toHaveText(/planned/i, {
      timeout: PLAN_TIMEOUT_MS,
    });
  } catch (error) {
    throw new Error(
      `Setup failed: story "${title}" did not reach the Planned state: ${String(error)}`,
    );
  }

  return { storyUrl: page.url(), title };
}
