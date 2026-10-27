import { defineConfig, devices } from "@playwright/test";
import { resolveQaTarget } from "./e2e/qa/qaTarget";
import { authFile } from "./e2e/qa/storyState";

const port = Number(process.env.ARC_WEB_PORT) || 3010;
const targetsQa = process.env.ARC_E2E_TARGET === "qa";

// The QA target is only resolved for QA runs, so local runs need no QA env vars.
const qaProjects = targetsQa
  ? [
      {
        name: "qa-setup",
        testDir: "./e2e/qa",
        testMatch: /.*\.setup\.ts/,
        use: { ...devices["Desktop Chrome"], baseURL: resolveQaTarget(process.env).baseURL },
      },
      {
        name: "qa",
        testDir: "./e2e/qa",
        dependencies: ["qa-setup"],
        use: {
          ...devices["Desktop Chrome"],
          baseURL: resolveQaTarget(process.env).baseURL,
          storageState: authFile,
        },
      },
    ]
  : [];

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  reporter: "html",
  use: {
    baseURL: `http://localhost:${port}`,
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", testIgnore: "**/qa/**", use: { ...devices["Desktop Chrome"] } },
    ...qaProjects,
  ],
  webServer: targetsQa
    ? undefined
    : {
        command: "pnpm run build && pnpm run preview",
        url: `http://localhost:${port}`,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
