import { expect, type Page } from "@playwright/test";

// NOTE: roles, labels and copy below are placeholders — align with the real QA UI.

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required for the QA intake check`);
  return value;
}

export async function signIn(page: Page): Promise<void> {
  const email = requireEnv("QA_USER_EMAIL");
  const password = requireEnv("QA_USER_PASSWORD");
  await page.goto("/");
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
}

export async function openProject(page: Page, projectName: string): Promise<void> {
  await page.getByRole("link", { name: projectName }).click();
}

export async function submitRequest(page: Page, title: string): Promise<void> {
  await page.getByRole("button", { name: /new request/i }).click();
  await page.getByLabel(/title/i).fill(title);
  await page.getByRole("button", { name: /submit/i }).click();
  await expect(
    page.getByRole("status").filter({ hasText: /request submitted/i }),
  ).toBeVisible();
}

export async function completeIntake(page: Page, title: string): Promise<void> {
  const row = page.getByRole("row", { name: new RegExp(title) });
  await row.getByRole("button", { name: /complete intake/i }).click();
  await expect(row.getByText(/intake completed/i)).toBeVisible();
}

export async function expectDraftedStory(
  page: Page,
  title: string,
  timeoutMs = 60_000,
): Promise<void> {
  await expect(
    page.getByRole("article", { name: new RegExp(title) }).getByText(/drafted/i),
  ).toBeVisible({ timeout: timeoutMs });
}
