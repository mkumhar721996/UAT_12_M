summary: |
  Add a Playwright end-to-end spec that proves the implement stage on its own through the web UI of the system under test. The spec sets up a story in the planned state, takes no action, waits for implementation to start by itself (AC1), then opens the story and asserts an open pull request in the sandbox repository is shown once implementation has finished (AC2), and that no pull request is shown while implementation has not finished (AC3). Review and feedback stages are out of scope. The test lives in the existing comp_web_app Playwright suite and is driven by environment variables, so no production code is added.
scope:
  - description: |
      Create `apps/web/e2e/implement-story.spec.ts` with three tests, one per acceptance criterion, plus a small helper module for the story set-up. Target and credentials come from env vars read in the helper; the spec is skipped with a clear message when they are unset, so the default `pnpm test:e2e` run (which mocks `/api/dashboard`) stays green.
      Helper signatures:
      ```ts
      export interface StoryFixture { id: string; url: string }
      export async function createPlannedStory(page: Page): Promise<StoryFixture>;
      export async function openStory(page: Page, story: StoryFixture): Promise<void>;
      export function sandboxRepoUrl(): string; // from ARC_SANDBOX_REPO_URL
      ```
    files:
      - apps/web/e2e/implement-story.spec.ts
      - apps/web/e2e/support/story.ts
    rationale: |
      The item is a verification story, so the deliverable is the test. Playwright is the confirmed E2E tool for comp_web_app (stack decisions), and `apps/web/e2e` is where the existing spec lives.
  - description: |
      Allow the e2e run to target the system under test without the built-in preview server when `ARC_E2E_BASE_URL` is set, and document the env vars (`ARC_E2E_BASE_URL`, `ARC_SANDBOX_REPO_URL`, optional `ARC_E2E_IMPLEMENT_TIMEOUT_MS`). Unset means the current behaviour is unchanged.
    files:
      - apps/web/playwright.config.ts
    rationale: |
      The current config hard-codes baseURL to the local preview port and builds the dashboard app, which has no story concept. A single optional override keeps existing tests untouched.
tests:
  - |
    AC1 (implementation starts on its own). Write first, expect it to fail until the helper and spec exist.
    ```ts
    test("a planned story starts implementing with no action from the test", async ({ page }) => {
      const story = await createPlannedStory(page);
      await openStory(page, story);
      // no clicks on the story: only observe
      await expect(page.getByTestId("story-status")).not.toHaveText(/planned/i, { timeout: IMPLEMENT_TIMEOUT });
      await expect(page.getByTestId("story-status")).toHaveText(/implement/i);
    });
    ```
  - |
    AC2 (finished implementation shows an open PR from the sandbox repo).
    ```ts
    test("a finished implementation shows an open pull request on the story", async ({ page }) => {
      const story = await createPlannedStory(page);
      await openStory(page, story);
      const pr = page.getByTestId("story-pull-request");
      await expect(pr).toBeVisible({ timeout: IMPLEMENT_TIMEOUT });
      await expect(pr).toContainText(/open/i);
      await expect(pr.getByRole("link")).toHaveAttribute("href", new RegExp(`^${escapeRegExp(sandboxRepoUrl())}/pull/\\d+$`));
    });
    ```
  - |
    AC3 (unfinished implementation shows no PR). Assert on a story observed mid-implementation, before the PR appears.
    ```ts
    test("a story whose implementation has not finished shows no pull request", async ({ page }) => {
      const story = await createPlannedStory(page);
      await openStory(page, story);
      await expect(page.getByTestId("story-status")).toHaveText(/implement/i, { timeout: IMPLEMENT_TIMEOUT });
      await expect(page.getByTestId("story-pull-request")).toHaveCount(0);
    });
    ```
assumptions_or_open_questions:
  - |
    The repository's web app (apps/web) is a health Dashboard with no story or pull request views, and no workflow-api story endpoints exist yet. I assumed the "web UI" under test is the deployed platform UI reachable through ARC_E2E_BASE_URL, and that it exposes the data-testid hooks story-status and story-pull-request. Please confirm the real selectors or point me at the UI.
  - |
    How a story is "set up in the planned state" is unspecified (API call, seeded record, or UI flow). I assumed createPlannedStory can do this through the UI or a documented API using credentials from env vars. Please confirm the mechanism.
  - |
    AC3 is timing-sensitive, since implementation may finish before the assertion. I assumed the check is made on a story observed in an implementing state; if that window is too short to catch reliably, a controllable stub of the implement stage would be needed.
  - The sandbox repository URL is supplied via ARC_SANDBOX_REPO_URL and is not hard-coded.
estimated_points: 3
package_dependencies: []
notes: |
  ### Data & rollout
  None — adds an e2e test and an optional test-config override only; no stored data, schema, seed, or required setting (new env vars are optional and the spec skips when they are unset).

  The change is test-only. It uses the already-installed `@playwright/test` and adds no dependencies. The spec should not run in the default CI job unless the env vars are provided.
review_focus: |
  IN scope - the implement stage only, with three Playwright tests (one per AC) and a minimal optional baseURL override. OUT - review, feedback, and any production code or new UI. Riskiest part is test flakiness (long implement timeout, AC3 timing window) and the unconfirmed selectors/set-up mechanism listed in the open questions. The skip-when-unconfigured behaviour is deliberate so the existing mocked dashboard e2e suite is unaffected.
