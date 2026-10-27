summary: |
  Add a Playwright happy-path E2E test for the UX design stage that runs against the QA environment through the real web UI. The test creates its own story and brings it to a planned state in a self-contained setup helper (it never depends on the plan-stage test), starts the UX design stage from the story page, asserts the story shows the stage as started, waits for the stage to finish, and asserts at least one design screen is listed in the story's design view. It lives in the existing comp_web_app Playwright suite but uses a separate QA config, so the existing mocked, locally served e2e tests are untouched and the QA test only runs when pointed at QA.
scope:
  - description: |
      QA Playwright config. A new config that reuses the `chromium` project, sets `testDir: "./e2e/qa"`, takes `baseURL` from `QA_BASE_URL` (fails fast with a clear error when unset), has NO `webServer` block (it targets the deployed QA env), `fullyParallel: false`, `workers: 1`, a generous per-test timeout for design generation, and a `retries` of 0 so a regression is not masked.
      ```ts
      const baseURL = process.env.QA_BASE_URL;
      if (!baseURL) throw new Error("QA_BASE_URL is required for the QA e2e suite");
      export default defineConfig({
        testDir: "./e2e/qa",
        timeout: Number(process.env.QA_DESIGN_TIMEOUT_MS) || 600_000,
        workers: 1,
        reporter: "html",
        use: { baseURL, trace: "retain-on-failure" },
        projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
      });
      ```
    files:
      - apps/web/playwright.qa.config.ts
    rationale: |
      The default playwright.config.ts starts a local `vite preview` server and mocks `/api/dashboard`; a QA run must hit the real deployed environment, so it needs its own config. A separate `testDir` keeps `pnpm test:e2e` unchanged.
  - description: |
      Add an npm script `test:e2e:qa` that runs `playwright test -c playwright.qa.config.ts`. Make the default config ignore `e2e/qa` (set `testIgnore: "**/qa/**"`) so the local run never picks up QA specs.
    files:
      - apps/web/package.json
      - apps/web/playwright.config.ts
    rationale: Keeps the QA test opt-in and out of the local and CI default run.
  - description: |
      Setup helper that creates its own story and brings it to a planned state through the real web UI (create story form, then start and complete the plan stage), independent of the plan test. It returns the story id/URL. It uses a unique title per run so concurrent or repeated runs do not collide.
      ```ts
      export async function createPlannedStory(page: Page): Promise<{ storyUrl: string; title: string }>;
      ```
      It waits for the story page to show the Planned state before returning, and throws a descriptive error if setup does not reach it, so a setup failure is distinguishable from a UX-design failure.
    files:
      - apps/web/e2e/qa/helpers/plannedStory.ts
    rationale: Covers AC2 (independence from the plan test) and gives the spec a reusable arrange step.
  - description: |
      The spec itself. One test, happy path only, in three steps matching the ACs: arrange via `createPlannedStory`, act by clicking the start control for the UX design stage on the story page, assert the stage shows as started, then wait for completion and assert the design view lists at least one design screen. Uses role/label locators and `expect(...).toPass` or web-first assertions with long timeouts rather than fixed sleeps.
      ```ts
      test("UX design stage produces design screens for a planned story", async ({ page }) => {
        const { storyUrl } = await createPlannedStory(page);
        await page.goto(storyUrl);
        await page.getByRole("button", { name: /start ux design/i }).click();
        await expect(page.getByTestId("ux-design-stage-status")).toHaveText(/started|in progress/i);
        await expect(page.getByTestId("ux-design-stage-status")).toHaveText(/complete/i, { timeout: 540_000 });
        await page.getByRole("tab", { name: /design/i }).click();
        await expect(page.getByTestId("design-screen")).not.toHaveCount(0);
      });
      ```
    files:
      - apps/web/e2e/qa/ux-design-stage.spec.ts
    rationale: Delivers AC1 and AC3 directly, and AC2 through the helper.
  - description: |
      Document how to run the QA suite (`QA_BASE_URL=... pnpm test:e2e:qa`), the optional timeout variable, and any QA credentials the app needs (supplied by environment, never committed).
    files:
      - apps/web/e2e/qa/README.md
    rationale: The suite needs env configuration that is not discoverable from the code.
tests:
  - |
    AC1 (start shows stage started). Write the spec first and run it before the helper is finished to see it fail on the missing helper, then on the assertion.
    ```ts
    await page.getByRole("button", { name: /start ux design/i }).click();
    await expect(page.getByTestId("ux-design-stage-status")).toHaveText(/started|in progress/i);
    ```
  - |
    AC2 (independent of the plan test). The spec file imports nothing from any plan spec, and `createPlannedStory` runs in the same test. Verify by running only this spec in a clean run with `--grep "UX design stage"` and confirming it passes with no other spec executed, and that the helper throws if the Planned state is not reached.
    ```ts
    await expect(page.getByTestId("story-status")).toHaveText(/planned/i, { timeout: 120_000 });
    ```
  - |
    AC3 (design screens listed after finish).
    ```ts
    await expect(page.getByTestId("ux-design-stage-status")).toHaveText(/complete/i, { timeout: 540_000 });
    await expect(page.getByTestId("design-screen")).not.toHaveCount(0);
    ```
  - |
    Guard test for config. Run `pnpm test:e2e:qa` with `QA_BASE_URL` unset and confirm it fails fast with "QA_BASE_URL is required"; run `pnpm test:e2e --list` and confirm no `e2e/qa` spec is listed.
assumptions_or_open_questions:
  - |
    The repository contains no story page, plan stage, UX design stage or design view today (apps/web has only the dashboard; workflow-api has only health). The test targets features that exist in the QA deployment but not in this codebase, so all selectors (button names, `data-testid` values such as `ux-design-stage-status`, `design-screen`, `story-status`, the design tab) are placeholders to be confirmed against the deployed QA UI. Please supply the real labels or testids, or confirm the implementer may inspect QA.
  - |
    How a story is created and planned in setup is unspecified. The AC says to bring it to a planned state, and the item says through the real web UI for the stage itself. I assumed setup also uses the UI (create story, run plan stage). If a faster API route exists, setup could use it, but that needs the API contract.
  - |
    QA base URL and authentication are unknown. I assumed `QA_BASE_URL` plus, if SSO via Cognito is required, a pre-provisioned QA test user whose credentials come from environment variables or a Playwright storageState file. Please confirm how the test should sign in.
  - |
    Design generation duration is unknown. I assumed up to about 10 minutes and made it configurable. Please confirm a realistic upper bound.
  - |
    Test data cleanup is out of scope (happy path only). Stories created in QA are left in place with unique titles. Say if QA needs cleanup.
estimated_points: 3
package_dependencies: []
notes: |
  ### Data & rollout

  None — adds test code, a test-only Playwright config and an npm script. No schema, stored data, seed or production setting changes. The new env vars (`QA_BASE_URL`, optional `QA_DESIGN_TIMEOUT_MS`) are read only by the QA test run and are documented in apps/web/e2e/qa/README.md; the suite fails fast when `QA_BASE_URL` is unset, so the default local and CI runs are unaffected.

  ### Research

  - `apps/web/playwright.config.ts` serves a local build on `ARC_WEB_PORT` and the existing `apps/web/e2e/app.spec.ts` mocks `/api/dashboard` with `page.route`. The QA test must not mock anything, which is why it gets its own config.
  - Playwright is already a devDependency (`@playwright/test` ^1.48.0), so no new package is needed (ADR-0001 stack: React, Playwright for E2E, pnpm).
  - A prior plan file exists under `.arc/plans/` for another run; it was not used.

  ```mermaid
  flowchart TD
    pkg[apps/web/package.json] -->|test:e2e:qa script| qaCfg[apps/web/playwright.qa.config.ts]
    qaCfg -->|testDir e2e/qa| spec[apps/web/e2e/qa/ux-design-stage.spec.ts]
    spec -->|arrange| helper[apps/web/e2e/qa/helpers/plannedStory.ts]
    defCfg[apps/web/playwright.config.ts] -->|testIgnore qa| spec
    defCfg --> existing[apps/web/e2e/app.spec.ts]
    classDef touched fill:#f96,color:#000
    class pkg,qaCfg,spec,helper,defCfg touched
  ```
review_focus: |
  IN scope: one QA-only Playwright happy-path spec, its planned-story setup helper, a separate QA config and script, and a short README. OUT: any app or API code, the plan-stage test, negative paths, and cleanup. Riskiest part is the selectors and sign-in, which are unverifiable from this repo because the story and design UI is not in the codebase, so reviewers should check them against QA. Deliberate choices: no `webServer` and no mocking in the QA config, retries 0, and long timeouts for design generation instead of fixed sleeps.
