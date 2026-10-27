import { expect, test } from "@playwright/test";
import type { BacklogItem, Story } from "../src/backlog/types";

const PROJECT = "proj_1ce836f0";
const API = `**/api/projects/${PROJECT}`;

// Per-test in-memory fake of the API: starts empty, so no other flow's data is needed.
test.beforeEach(async ({ page }) => {
  const items: BacklogItem[] = [];
  const stories: Story[] = [];

  await page.route(`${API}/backlog-items`, async (route) => {
    if (route.request().method() === "POST") {
      const { title } = route.request().postDataJSON() as { title: string };
      const item = { id: `bi_${items.length + 1}`, title };
      items.push(item);
      return route.fulfill({ json: item });
    }
    return route.fulfill({ json: items });
  });
  await page.route(`${API}/backlog-items/*/story`, (route) => {
    const id = route.request().url().split("/backlog-items/")[1].split("/")[0];
    const item = items.find((candidate) => candidate.id === id)!;
    const story = { id: `st_${stories.length + 1}`, title: item.title, backlogItemId: item.id };
    stories.push(story);
    return route.fulfill({ json: story });
  });
  await page.route(`${API}/stories`, (route) => route.fulfill({ json: stories }));
});

test("creates a story from a backlog item it created itself", async ({ page }) => {
  await page.goto("/#backlog");
  await page.getByLabel("Title").fill("Export report");
  await page.getByRole("button", { name: "Add item" }).click();
  await expect(page.getByText("Export report")).toBeVisible();

  await page.getByRole("button", { name: "Create story" }).click();
  await expect(page.getByRole("status")).toContainText("Story created");

  await page.getByRole("banner").getByRole("link", { name: "Stories" }).click();
  await expect(page.getByRole("heading", { name: "Stories" })).toBeVisible();
  await expect(page.getByRole("listitem").filter({ hasText: "Export report" })).toBeVisible();
});
