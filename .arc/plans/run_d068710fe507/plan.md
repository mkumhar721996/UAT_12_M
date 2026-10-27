summary: |
  Add a Playwright E2E check (comp_web_app, existing Testing Tool E2E) that runs against the QA environment: a signed-in user opens the existing project, submits a new request, completes intake, and the check asserts a drafted story appears for that request. The check passes when the drafted story appears and fails when it does not (Playwright's own pass/fail result). It is delivered as a dedicated QA Playwright config plus a spec and small helper, so intake regressions are caught automatically without touching the local-preview E2E suite. Backlog story creation and acceptance-criteria refinement are out of scope.
scope:
  - description: |
      Create a QA-targeted Playwright config. Unlike playwright.config.ts it has NO webServer block (the target is the deployed QA site) and reads its target from env.

      ```ts
      import { defineConfig, devices } from "@playwright/test";

      const baseURL = process.env.QA_BASE_URL;
      if (!baseURL) throw new Error("QA_BASE_URL is required for the QA intake check");

      export default defineConfig({
        testDir: "./e2e/qa",
        fullyParallel: false,
        retries: 0,
        reporter: [["list"], ["html", { open: "never" }]],
        use: { baseURL, trace: "retain-on-failure" },
        projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
      });
      ```
    files:
      - apps/web/playwright.qa.config.ts
    rationale: |
      Gives the QA check its own entry point. retries is 0 so a missing draft is reported as failed (AC5) rather than masked by a retry.
  - description: |
      Add `testIgnore: "**/qa/**"` to the existing playwright.config.ts so the default local run (which builds and previews the app with mocked /api/dashboard) never picks up the QA spec.
    files:
      - apps/web/playwright.config.ts
    rationale: The QA spec needs QA env vars and a deployed target; it must not run in the default suite.
  - description: |
      Create the helper module with sign-in, submit-request, complete-intake and drafted-story assertion steps, each wrapping Playwright role/label locators and web-first assertions.

      ```ts
      export async function signIn(page: Page): Promise<void>;
      export async function openProject(page: Page, projectName: string): Promise<void>;
      export async function submitRequest(page: Page, title: string): Promise<void>; // asserts submitted confirmation (AC1)
      export async function completeIntake(page: Page, title: string): Promise<void>; // asserts intake shown as completed (AC2)
      export async function expectDraftedStory(page: Page, title: string, timeoutMs?: number): Promise<void>; // AC3/AC4/AC5
      ```

      expectDraftedStory uses expect(locator).toBeVisible({ timeout }) so it throws when no drafted story appears. Credentials and project name come only from env (QA_USER_EMAIL, QA_USER_PASSWORD, QA_PROJECT_NAME); nothing is hard-coded or logged.
    files:
      - apps/web/e2e/qa/intake-helpers.ts
    rationale: |
      Separating the steps lets a local self-test prove the pass/fail behaviour (AC4/AC5) without needing QA.
  - description: |
      Create the QA spec: one test that signs in, opens the existing project, submits a request with a unique title (`intake-to-draft ${Date.now()}`), completes intake, and asserts the drafted story. Missing QA config fails loudly via the config guard rather than skipping.
    files:
      - apps/web/e2e/qa/intake-to-draft.spec.ts
    rationale: The acceptance flow itself (AC1-AC4).
  - description: |
      Create a local self-test of expectDraftedStory using page.setContent with static HTML (one page containing a drafted-story element for the request, one without), so AC5's failure path is exercised deterministically. It lives under e2e/ so the existing playwright.config.ts runs it; it needs no QA access.
    files:
      - apps/web/e2e/intake-helpers.spec.ts
    rationale: Proves the check reports failed when no drafted story appears, and passed when it does.
  - description: |
      Add a script `"test:e2e:qa": "playwright test -c playwright.qa.config.ts"` to apps/web/package.json, and document the env vars (QA_BASE_URL, QA_USER_EMAIL, QA_USER_PASSWORD, QA_PROJECT_NAME) and the run command in README.md.
    files:
      - apps/web/package.json
      - README.md
    rationale: Gives CI and developers one documented command to run the check.
tests:
  - |
    AC1 (write first, fails until submitRequest exists). In e2e/qa/intake-to-draft.spec.ts:
    ```ts
    await submitRequest(page, title);
    await expect(page.getByRole("status").filter({ hasText: /request submitted/i })).toBeVisible();
    ```
  - |
    AC2 (fails until completeIntake exists):
    ```ts
    await completeIntake(page, title);
    await expect(page.getByRole("row", { name: new RegExp(title) }).getByText(/intake completed/i)).toBeVisible();
    ```
  - |
    AC3 (fails until expectDraftedStory exists):
    ```ts
    await expect(page.getByRole("article", { name: new RegExp(title) }).getByText(/drafted/i)).toBeVisible({ timeout: 60_000 });
    ```
  - |
    AC4, local self-test in e2e/intake-helpers.spec.ts. With a page containing a drafted story the helper resolves, so the check passes:
    ```ts
    await page.setContent(`<article aria-label="T1"><span>Drafted</span></article>`);
    await expect(expectDraftedStory(page, "T1", 1_000)).resolves.toBeUndefined();
    ```
    The real QA run is reported passed by `pnpm run test:e2e:qa` exiting 0.
  - |
    AC5, local self-test. With no drafted story the helper rejects, so the check is reported failed:
    ```ts
    await page.setContent(`<main>No stories yet</main>`);
    await expect(expectDraftedStory(page, "T2", 500)).rejects.toThrow();
    ```
    Also run `pnpm run test:e2e:qa` and confirm a non-zero exit status when the draft never appears.
assumptions_or_open_questions:
  - |
    The repository contains no intake, request or story UI today (apps/web only has the Dashboard), so the QA environment's intake screens are assumed to exist. The accessible roles, labels and copy in the snippets above are placeholders and must be aligned with the real QA UI. Please share the screen names, button labels and the confirmation and status wording.
  - |
    Sign-in method on QA is unknown (Cognito federated login per ADR-0007 vs a simple form). Assumed a test user can sign in through the UI with email and password supplied via QA_USER_EMAIL and QA_USER_PASSWORD. If SSO is mandatory, a Playwright storageState setup step would be needed instead.
  - |
    Assumed the QA URL, a test account with access to the existing project, and the project name will be supplied as environment variables or CI secrets, and are not stored in the repository.
  - |
    Assumed the user completes intake manually through the UI, and draft generation is asynchronous (job queue and worker), so a 60s timeout is used. Please confirm the expected latency.
  - |
    Each run creates a real request on QA, with a unique title. Assumed that is acceptable and that cleanup is out of scope.
  - |
    Assumed the pass/fail reporting required by AC4/AC5 is satisfied by the Playwright result and exit status, with no custom reporter.
estimated_points: 3
package_dependencies: []
notes: |
  ### Data & rollout

  None — adds test code, a Playwright config and a README section only. No schema, stored data or seed changes. The new test-only env vars (QA_BASE_URL, QA_USER_EMAIL, QA_USER_PASSWORD, QA_PROJECT_NAME) have no default: the QA config throws if QA_BASE_URL is unset, and they are documented in README.md. Provisioning: a QA test user with access to the existing project must exist. Rollback is deleting the new files and script.

  Uses only tooling already in apps/web (Playwright ^1.48, pnpm), so no new dependencies. The existing e2e/app.spec.ts is unchanged; the default config's testDir ./e2e picks up the local self-test e2e/intake-helpers.spec.ts but ignores e2e/qa/ via testIgnore.

  ```mermaid
  flowchart TD
    pkg[apps/web/package.json] -->|test:e2e:qa script| qacfg[playwright.qa.config.ts]
    qacfg -->|testDir e2e/qa| spec[e2e/qa/intake-to-draft.spec.ts]
    spec --> helpers[e2e/qa/intake-helpers.ts]
    self[e2e/intake-helpers.spec.ts] -->|self-test AC4/AC5| helpers
    defcfg[playwright.config.ts] -->|testIgnore qa| self
    classDef touched fill:#f96,color:#000
    class pkg,qacfg,spec,helpers,self,defcfg touched
  ```
review_focus: |
  IN scope: a QA-only Playwright check for submit, complete intake and drafted story, plus a local self-test for the pass/fail behaviour and docs. OUT of scope: creating stories from the backlog, refining acceptance criteria, any app source changes. Riskiest area is the locators and copy, which are placeholders because no intake UI exists in this repo and must match QA. retries is deliberately 0 and credentials come only from env, both on purpose.
