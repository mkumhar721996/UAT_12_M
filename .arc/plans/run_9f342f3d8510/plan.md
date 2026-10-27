summary: |
  Add a happy-path Playwright E2E for the plan stage in `apps/web` (comp_web_app, Playwright is already the confirmed E2E tool and `@playwright/test` is already a dependency). A Playwright setup project creates its own Story in the existing Project and brings it to the refined state; the test then runs the plan stage through the real web UI at https://qa.bnts-arc.ai and asserts a plan is shown on that Story. The existing mocked-dashboard spec keeps running against the local preview server; the new spec runs under a separate `qa` project that targets QA and starts no local web server. Covers the plan stage only, happy path only; UX design and later stages are out of scope.
scope:
  - description: |
      Add a small, unit-testable target resolver and use it in the Playwright config. Signature:

      ```ts
      export function resolveQaTarget(env: NodeJS.ProcessEnv): { baseURL: string; projectName: string }
      ```

      Defaults to `https://qa.bnts-arc.ai` when `ARC_QA_BASE_URL` is unset; requires `ARC_QA_PROJECT_NAME` (the existing Project) and throws a clear error if it is missing. `playwright.config.ts` gains a `qa` project (`testDir ./e2e/qa`, `baseURL` from the resolver, `dependencies: ["qa-setup"]`) plus a `qa-setup` project that matches `*.setup.ts`. The local `chromium` project gets `testIgnore: "**/qa/**"` and the `webServer` block is only configured when the QA project is not the one selected (`ARC_E2E_TARGET !== "qa"`), so QA runs never build or serve locally.
    files:
      - apps/web/e2e/qa/qaTarget.ts
      - apps/web/e2e/qa/qaTarget.test.ts
      - apps/web/playwright.config.ts
      - apps/web/vitest.config.ts
    rationale: |
      AC2 needs the target to be QA by configuration, and that is checkable without a browser by testing the resolver. The vitest include pattern must pick up `e2e/qa/qaTarget.test.ts` (or the test lives under `src/` if vite.config.ts already scopes vitest there; confirm when implementing).
  - description: |
      Setup project that runs before the test (AC1). `e2e/qa/plan-stage.setup.ts` creates a uniquely named Story (`arc-e2e-plan-<timestamp>`) in the existing Project, advances it to the refined state through the same UI/API path a user would use, and asserts the Story is listed in that Project with the state "Refined". It writes the Story id/title to `e2e/qa/.state.json` (git-ignored) for the test to read. Authentication state is obtained in the same setup via credentials read from `ARC_QA_USER` and `ARC_QA_PASSWORD` env vars and saved to `e2e/qa/.auth.json` (git-ignored).
    files:
      - apps/web/e2e/qa/plan-stage.setup.ts
      - apps/web/e2e/qa/storyState.ts
      - apps/web/.gitignore
    rationale: |
      Test owns its own data so it is independent of other stories and repeatable. Credentials only come from the environment and are never committed.
  - description: |
      The plan-stage spec (AC3): open the setup-created Story in the Project, trigger the plan stage, wait for it to complete (generous `expect(...).toBeVisible({ timeout })` rather than fixed sleeps), and assert a plan section is shown on that Story. Role/name locators only, matching the style in `e2e/app.spec.ts`.
    files:
      - apps/web/e2e/qa/plan-stage.spec.ts
    rationale: |
      This is the regression guard the story asks for. Happy path only: no failure-injection, no UX design stage.
  - description: |
      Add a `test:e2e:qa` script to `apps/web/package.json`: `ARC_E2E_TARGET=qa playwright test --project=qa`. Document the required env vars (`ARC_QA_BASE_URL` optional, `ARC_QA_PROJECT_NAME`, `ARC_QA_USER`, `ARC_QA_PASSWORD`) in a short README next to the specs.
    files:
      - apps/web/package.json
      - apps/web/e2e/qa/README.md
    rationale: |
      Gives CI and humans one documented command and keeps the secrets contract explicit.
tests:
  - |
    AC2 (written first, fails until resolver exists), vitest in `apps/web/e2e/qa/qaTarget.test.ts`:

    ```ts
    import { describe, expect, it } from "vitest";
    import { resolveQaTarget } from "./qaTarget";

    describe("resolveQaTarget", () => {
      it("defaults to the QA environment", () => {
        const t = resolveQaTarget({ ARC_QA_PROJECT_NAME: "p" });
        expect(t.baseURL).toBe("https://qa.bnts-arc.ai");
      });
      it("throws when the project name is not configured", () => {
        expect(() => resolveQaTarget({})).toThrow(/ARC_QA_PROJECT_NAME/);
      });
    });
    ```
  - |
    AC2 (E2E): first assertion of the spec confirms the app really loaded from QA, e.g.

    ```ts
    await page.goto("/");
    expect(new URL(page.url()).hostname).toBe("qa.bnts-arc.ai");
    ```
  - |
    AC1, in `plan-stage.setup.ts` (fails first because nothing creates the Story):

    ```ts
    await page.goto(`/projects/${projectName}`);
    const row = page.getByRole("listitem").filter({ hasText: storyTitle });
    await expect(row).toBeVisible();
    await expect(row).toContainText(/refined/i);
    ```
  - |
    AC3, in `plan-stage.spec.ts`:

    ```ts
    await page.getByRole("button", { name: /run plan/i }).click();
    await expect(page.getByRole("heading", { name: /plan/i })).toBeVisible({ timeout: 300_000 });
    await expect(page.getByTestId("story-plan")).not.toBeEmpty();
    ```
  - |
    Regression check: `cd apps/web && pnpm test && pnpm lint && pnpm typecheck` still pass and `pnpm test:e2e` (local, mocked) still runs only the existing spec.
assumptions_or_open_questions:
  - |
    The repository's `apps/web` currently holds a care Dashboard app (no Stories, Projects or plan stage), so the UI under test is the deployed ARC web app at qa.bnts-arc.ai, not code in this repo. All selectors in the plan (button "Run plan", heading "Plan", Story list rows, state label "Refined") are placeholders to be confirmed against the real QA UI at implement time.
  - |
    How setup should create the Story and reach the refined state is unspecified (UI steps vs. a Workflow API call). The plan assumes UI/API actions available to a normal QA user; if a refine stage must be run, setup runs it through the UI. Please confirm the preferred route.
  - |
    Name of the "existing project" and the QA test account are not given; supplied via `ARC_QA_PROJECT_NAME`, `ARC_QA_USER`, `ARC_QA_PASSWORD`. Login may be via Cognito SSO (ADR-0007), which could need a dedicated test user without MFA.
  - |
    Setup does not delete the Story afterwards (no cleanup in the ACs); stories are timestamp-named so they do not collide. Say if teardown is wanted.
  - Plan stage duration on QA is assumed to be under 5 minutes; the timeout is adjustable.
estimated_points: 5
package_dependencies: []
notes: |
  ### Data & rollout

  None — test-only change plus a Playwright config and an npm script; no schema, stored data, or deployed setting changes. New env vars (`ARC_QA_BASE_URL`, `ARC_QA_PROJECT_NAME`, `ARC_QA_USER`, `ARC_QA_PASSWORD`, `ARC_E2E_TARGET`) are test-runner inputs only, documented in `apps/web/e2e/qa/README.md`; the QA project, test user and credentials must exist beforehand and are provisioned by the team, not by this change. Setup creates one Story per run in QA.

  Mirrors the existing `apps/web/e2e/app.spec.ts` / `playwright.config.ts` conventions (Playwright, role-based locators, pnpm scripts); no new packages.

  ```mermaid
  flowchart TD
    cfg[apps/web/playwright.config.ts]:::touched
    tgt[apps/web/e2e/qa/qaTarget.ts]:::touched
    setup[apps/web/e2e/qa/plan-stage.setup.ts]:::touched
    spec[apps/web/e2e/qa/plan-stage.spec.ts]:::touched
    old[apps/web/e2e/app.spec.ts]
    pkg[apps/web/package.json]:::touched
    cfg -->|reads QA baseURL| tgt
    cfg -->|qa-setup project| setup
    cfg -->|qa project, depends on setup| spec
    cfg -->|local chromium project, ignores qa dir| old
    pkg -->|test:e2e:qa script| cfg
    classDef touched fill:#f96,color:#000
  ```
review_focus: |
  IN: one new QA-targeted Playwright project (setup + one plan-stage spec), the config resolver and an npm script. OUT: UX design and later stages, failure paths, any change to app source. Riskiest part is the selectors and the setup route to the refined state, which are guesses until checked against the real QA UI; also verify the local `chromium` project and `webServer` behaviour are unchanged and that no credentials are committed.
