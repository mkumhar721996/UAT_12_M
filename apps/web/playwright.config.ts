import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.ARC_WEB_PORT) || 3010;
// Optional env vars for the implement-stage spec (e2e/implement-story.spec.ts):
//   ARC_E2E_BASE_URL            target system under test; skips the local preview server
//   ARC_SANDBOX_REPO_URL        sandbox repository the open pull request must belong to
//   ARC_E2E_TOKEN               optional bearer token for setting up a planned story
//   ARC_E2E_IMPLEMENT_TIMEOUT_MS  optional wait for implementation (default 600000)
const targetUrl = process.env.ARC_E2E_BASE_URL;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  reporter: "html",
  use: {
    baseURL: targetUrl ?? `http://localhost:${port}`,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: targetUrl
    ? undefined
    : {
        command: "pnpm run build && pnpm run preview",
        url: `http://localhost:${port}`,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
