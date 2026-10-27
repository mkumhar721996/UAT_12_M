import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.QA_BASE_URL;
if (!baseURL) {
  throw new Error("QA_BASE_URL is required for the QA e2e suite");
}

// Targets the deployed QA environment: no webServer and no mocking.
// retries stay at 0 so a regression is never masked by a lucky re-run.
export default defineConfig({
  testDir: "./e2e/qa",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: Number(process.env.QA_DESIGN_TIMEOUT_MS) || 600_000,
  reporter: "html",
  use: {
    baseURL,
    storageState: process.env.QA_STORAGE_STATE || undefined,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
