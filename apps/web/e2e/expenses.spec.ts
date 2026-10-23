import { expect, test } from "@playwright/test";

test("summary defaults to the month and updates after adding a Travel expense", async ({ page }) => {
  await page.goto("/#summary");
  await expect(page.getByRole("tab", { name: "Month" })).toHaveAttribute("aria-selected", "true");

  await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Expenses" }).click();
  await page.getByRole("link", { name: "Add expense" }).click();
  await page.getByLabel("Amount").fill("40.00");
  await page.getByLabel("Category").selectOption("Travel");
  await page.getByRole("button", { name: "Save" }).click();

  await expect(page.getByRole("heading", { name: "Summary" })).toBeVisible();
  const travel = page.locator(".card", { hasText: "Travel" });
  await expect(travel.getByText("40.00")).toBeVisible();
});
