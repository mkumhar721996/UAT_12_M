import { expect, test } from "@playwright/test";

test("renders the app title", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Workflow Platform")).toBeVisible();
});
