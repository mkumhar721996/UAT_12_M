import { expect, test as setup } from "@playwright/test";
import { resolveQaTarget } from "./qaTarget";
import { authFile, writeStoryState } from "./storyState";

const { projectName } = resolveQaTarget(process.env);

setup("create a refined story in the existing project", async ({ page }) => {
  const user = process.env.ARC_QA_USER;
  const password = process.env.ARC_QA_PASSWORD;
  if (!user || !password) {
    throw new Error("ARC_QA_USER and ARC_QA_PASSWORD must be set");
  }

  await page.goto("/");
  expect(new URL(page.url()).hostname).toBe(new URL(setup.info().project.use.baseURL!).hostname);
  await page.getByLabel(/email|username/i).fill(user);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /sign in|log in/i }).click();
  await page.context().storageState({ path: authFile });

  const storyTitle = `arc-e2e-plan-${Date.now()}`;
  await page.goto(`/projects/${projectName}`);
  await page.getByRole("button", { name: /new story|create story/i }).click();
  await page.getByLabel(/title/i).fill(storyTitle);
  await page.getByRole("button", { name: /^create/i }).click();

  const row = page.getByRole("listitem").filter({ hasText: storyTitle });
  await expect(row).toBeVisible();
  await row.getByRole("link", { name: storyTitle }).click();
  const storyId = new URL(page.url()).pathname.split("/").pop() ?? "";

  await page.getByRole("button", { name: /run refine/i }).click();

  await page.goto(`/projects/${projectName}`);
  await expect(row).toBeVisible();
  await expect(row).toContainText(/refined/i, { timeout: 300_000 });
  await page.context().storageState({ path: authFile });

  writeStoryState({ id: storyId, title: storyTitle });
});
