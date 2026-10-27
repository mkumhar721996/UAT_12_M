import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.QA_BASE_URL;
if (!baseURL) throw new Error("QA_BASE_URL is required for the QA intake check");

// Targets the deployed QA site, so no webServer. retries stays 0 so a missing
// draft is reported as failed rather than masked by a retry.
export default defineConfig({
  testDir: "./e2e/qa",
  fullyParallel: false,
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: { baseURL, trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
