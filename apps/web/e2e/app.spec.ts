import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/api/dashboard", (route) =>
    route.fulfill({
      json: {
        readings: [],
        appointments: [],
        care: { doctorName: "Dr. Patel, General Medicine", lastVisitDate: "2026-09-12" },
      },
    }),
  );
});

test("shows the Dashboard and opens and cancels the vitals dialog", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Today" })).toBeVisible();
  await page.getByRole("button", { name: "Log vitals" }).click();
  await expect(page.getByRole("dialog", { name: "Log a vital" })).toBeVisible();
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
});

test("has exactly one Records link, inside the header", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: /records/i })).toHaveCount(1);
  await expect(page.getByRole("banner").getByRole("link", { name: "Records" })).toBeVisible();
});
