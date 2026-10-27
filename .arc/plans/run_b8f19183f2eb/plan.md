summary: |
  Add one self-contained Playwright e2e test in `apps/web/e2e` that covers the "refine acceptance criteria" step end to end: it creates its own story in project `proj_1ce836f0`, confirms the story is listed in that project, starts refinement, waits for it to finish, and then checks the refined acceptance criteria by structure (a non-empty list) and a loose keyword match against the story's title and description (no fixed wording). The test depends on no other flow's test or fixture. The keyword check lives in a small pure helper with its own vitest unit tests, so the loose-match rule is pinned down before the e2e uses it. Important finding: the repo has no story, project or refinement code today (the web app is only a Dashboard, and `workflow-api` only serves `/` and `/health`). The plan therefore assumes a Workflow API contract that must be confirmed; see the open questions.
scope:
  - description: |
      Pure helper for the loose keyword check (AC 5), written test-first.
      ```ts
      export function keywordsOf(text: string): string[]            // lowercase words of 4+ letters, minus a small stop-word list, de-duplicated
      export function sharesKeyword(criteria: string[], title: string, description: string): boolean
      ```
      `sharesKeyword` is true when at least one criterion contains (case-insensitive) at least one keyword from the title or description. It never compares whole sentences, so wording can change freely.
    files:
      - apps/web/e2e/support/keywords.ts
      - apps/web/src/test/keywords.test.ts
    rationale: |
      Keeps the "structure plus loose keyword" pass rule in one unit-tested place. Note vitest only picks up `src/**` (see open questions), so the unit test sits in `src/test` and imports from `e2e/support`.
  - description: |
      Story API helper used by the e2e, over Playwright's `request` fixture (no UI dependency, no shared state).
      ```ts
      export const PROJECT_ID = "proj_1ce836f0";
      export interface Story { id: string; title: string; description: string; acceptanceCriteria: string[]; refinementStatus: "none" | "running" | "done" | "failed" }
      export async function createStory(api: APIRequestContext, input: { title: string; description: string }): Promise<Story>   // POST /api/projects/:projectId/stories
      export async function listStories(api: APIRequestContext): Promise<Story[]>                                                // GET /api/projects/:projectId/stories
      export async function refineStory(api: APIRequestContext, id: string): Promise<void>                                       // POST /api/projects/:projectId/stories/:id/refine
      export async function waitForRefined(api: APIRequestContext, id: string): Promise<Story>                                   // polls GET until refinementStatus === "done", 60s timeout
      ```
      The story title carries a unique suffix (`Refine AC ${Date.now()}`) so reruns and parallel runs do not collide.
    files:
      - apps/web/e2e/support/storyApi.ts
    rationale: |
      Lets the test create its own story (ACs 1 and 2) and avoid fixtures from other flows. Polling uses `expect.poll`, not fixed sleeps.
  - description: |
      The e2e spec itself, `refine-acceptance-criteria.spec.ts`. One test, in a single `test()` so it needs no ordering with other specs. It creates the story, asserts the listing, starts refinement, waits for it, then asserts the refined criteria (non-empty list, each a non-blank string, at least one shares a keyword). If the story page exposes the criteria in the UI, it also asserts the criteria are visible there; see open questions.
    files:
      - apps/web/e2e/refine-acceptance-criteria.spec.ts
    rationale: |
      Delivers ACs 1 to 5. Playwright is the confirmed e2e tool for comp_web_app, and `e2e_command` in setup.yaml already runs it.
tests:
  - |
    Unit (write first, red), `apps/web/src/test/keywords.test.ts`: the loose-match helper behaves as AC 5 describes.
    ```ts
    expect(sharesKeyword(["Invoice export is a CSV file"], "Export invoices", "Finance wants invoice data")).toBe(true);
    expect(sharesKeyword(["Page loads quickly"], "Export invoices", "Finance wants invoice data")).toBe(false);
    expect(sharesKeyword([], "Export invoices", "x")).toBe(false);
    expect(keywordsOf("The Export of invoices")).toEqual(["export", "invoices"]);
    ```
  - |
    AC 1, e2e: the test creates its own story and it is listed in project proj_1ce836f0 before refinement starts.
    ```ts
    const story = await createStory(request, { title, description });
    const listed = await listStories(request);
    expect(listed.map((s) => s.id)).toContain(story.id);
    expect(story.refinementStatus).toBe("none"); // refinement has not started yet
    ```
  - |
    AC 2, e2e: the test is self-contained and passes on its own on a fresh project.
    ```sh
    cd apps/web && pnpm exec playwright test e2e/refine-acceptance-criteria.spec.ts
    ```
    The spec imports nothing from other specs, uses no `test.describe.serial`, and makes no assertion about the number of stories already in the project (it looks its story up by the id it just created). It exits 0 when run alone.
  - |
    AC 3, e2e: refinement is started and completes, and the story then shows refined criteria.
    ```ts
    await refineStory(request, story.id);
    const refined = await waitForRefined(request, story.id);
    expect(refined.refinementStatus).toBe("done");
    expect(refined.acceptanceCriteria.length).toBeGreaterThan(0);
    ```
  - |
    AC 4, e2e: the refined criteria are a non-empty list of criteria (structure only, no fixed wording).
    ```ts
    expect(Array.isArray(refined.acceptanceCriteria)).toBe(true);
    expect(refined.acceptanceCriteria.length).toBeGreaterThan(0);
    for (const c of refined.acceptanceCriteria) expect(c.trim().length).toBeGreaterThan(0);
    ```
  - |
    AC 5, e2e: at least one refined criterion contains a keyword from the story.
    ```ts
    expect(sharesKeyword(refined.acceptanceCriteria, story.title, story.description)).toBe(true);
    ```
assumptions_or_open_questions:
  - |
    BLOCKER TO CONFIRM: nothing in the repo implements stories, projects, or refinement. `services/workflow-api` exposes only `GET /` and `GET /health`, and `apps/web` is the Dashboard only. I assumed REST endpoints `POST/GET /api/projects/:projectId/stories` and `POST /api/projects/:projectId/stories/:id/refine`, and a `Story` shape with `acceptanceCriteria: string[]` and `refinementStatus`. Please confirm the real contract, or the system under test (it may be an external deployed app, in which case the base URL needs a setting). If the endpoints do not exist yet, another story must supply them before this e2e can pass; I have not planned to build them here, since no AC asks for it.
  - |
    Where the API is reached from: `playwright.config.ts` only serves the web preview on `ARC_WEB_PORT`. I assumed the API is reachable through the same base URL (a proxy at `/api`). If it is on another origin, the helper needs an `ARC_API_URL` env var (default the Playwright `baseURL`); that would be a small change to `storyApi.ts` only.
  - |
    The ACs do not say whether refinement is done through the UI or the API. I chose API-level calls for creation and refinement for stability, and I will add UI assertions only if a story page exists. Please say if you want the flow driven through the browser instead.
  - |
    Refinement may call an LLM, so I allowed a 60s poll timeout and no mocking. If refinement should be stubbed for determinism, say so; the "loose keyword" rule suggests a real, non-deterministic refiner.
  - |
    The vitest config only includes `src/**`, so the helper unit test sits in `apps/web/src/test/` and imports `../../e2e/support/keywords`. The `tsconfig.app.json` include may need `e2e/support` for typecheck; I will check this at implementation time and adjust the include only if typecheck fails.
  - |
    Keyword rule: words of 4+ letters, lowercased, minus a short stop-word list. This is my reading of "loose keyword check"; the exact rule is not specified.
  - |
    Test data is created in the real project `proj_1ce836f0` and is not cleaned up unless a delete endpoint exists (then an `afterEach` delete is added). The unique title suffix keeps reruns from colliding.
estimated_points: 3
package_dependencies: []
notes: |
  ### Data & rollout

  None — test-only change. No schema, stored data shape, seed, env var or config file is changed. (If the API turns out to be on a separate origin, an optional `ARC_API_URL` env var may be added, defaulting to the Playwright base URL; it would be documented in the spec's header comment.) The test writes one story per run into project `proj_1ce836f0`. Rollback is reverting the commit.

  ### Context

  - Stack (architecture docs): comp_web_app uses React, Tailwind, pnpm, vitest for unit and Playwright for e2e, so the e2e lives in `apps/web/e2e` beside `app.spec.ts` and runs with `cd apps/web && pnpm run test:e2e`.
  - `apps/web/e2e/app.spec.ts` mocks `/api/dashboard` with `page.route`. This test must NOT mock the story endpoints, since the point is end-to-end coverage of refinement.
  - `playwright.config.ts` has `fullyParallel: true`, which is why the test must be independent and use unique titles.
  - No new dependencies: `@playwright/test` and vitest are already installed.

  ```mermaid
  flowchart TD
    cfg[apps/web/playwright.config.ts: testDir ./e2e, baseURL] --> spec[e2e/refine-acceptance-criteria.spec.ts: the AC 1-5 flow]
    spec --> api[e2e/support/storyApi.ts: create, list, refine, poll]
    spec --> kw[e2e/support/keywords.ts: loose keyword match]
    ut[src/test/keywords.test.ts: unit tests for AC 5 rule] --> kw
    api -.->|HTTP, assumed contract| wapi[services/workflow-api: not touched]
    classDef touched fill:#f96,color:#000
    class spec,api,kw,ut touched
  ```

  The two untouched nodes (`playwright.config.ts`, `workflow-api`) are context only.

  ### Order of work (TDD)

  1. `keywords.test.ts` (red), then `keywords.ts`.
  2. The e2e spec (red, as it fails until the story API exists), then `storyApi.ts` to make it compile and run.
  3. Run the spec alone, then the whole e2e suite, to confirm AC 2 and no interference with `app.spec.ts`.
review_focus: |
  IN: one self-contained Playwright e2e spec, its API helper, and a unit-tested keyword helper. OUT: building any story, project or refinement endpoint or UI, and cleanup of data in other flows. The riskiest part is the assumed story API contract (nothing like it exists in the repo), so a reviewer should check the endpoint paths and shape against the real system. The keyword check is deliberately loose and the structure check is deliberately wording-free; do not flag the lack of fixed-text assertions.
