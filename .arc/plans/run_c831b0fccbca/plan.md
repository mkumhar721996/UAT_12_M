summary: |
  Add a self-contained Playwright happy-path spec (`apps/web/e2e/backlog-to-story.spec.ts`) that, in project proj_1ce836f0, creates its own backlog item, creates a story from it through the UI, and sees that story in the project's story list. Reading the code shows the web app (`apps/web`) is currently only a Health dashboard and workflow-api has only health/app controllers, so there is NO backlog or story UI or API for the test to drive. The plan therefore also adds the smallest possible Backlog and Stories UI in `apps/web` behind an injectable HTTP client, and the e2e spec stubs `/api/projects/proj_1ce836f0/...` with `page.route` (the same pattern `e2e/app.spec.ts` uses for `/api/dashboard`). Refining acceptance criteria is out of scope.
scope:
  - description: |
      Domain types and an injectable client, mirroring `dashboard/dashboardClient.ts`.
      ```ts
      export interface BacklogItem { id: string; title: string }
      export interface Story { id: string; title: string; backlogItemId: string }
      export interface BacklogClient {
        listBacklog(projectId: string): Promise<BacklogItem[]>;
        addBacklogItem(projectId: string, title: string): Promise<BacklogItem>;
        createStoryFromBacklogItem(projectId: string, backlogItemId: string): Promise<Story>;
        listStories(projectId: string): Promise<Story[]>;
      }
      export const httpBacklogClient: BacklogClient;
      ```
      HTTP routes used: GET/POST `/api/projects/{id}/backlog-items`, POST `/api/projects/{id}/backlog-items/{itemId}/story`, GET `/api/projects/{id}/stories`.
    files:
      - apps/web/src/backlog/types.ts
      - apps/web/src/backlog/backlogClient.ts
    rationale: |
      Keeps the UI testable with a fake client in vitest and stubbable with `page.route` in Playwright, matching the existing dashboard layout.
  - description: |
      `BacklogPage` renders an "Add backlog item" form (label "Title", button "Add item"), the backlog list, and a "Create story" button per item. `StoryList` renders the project's stories under the heading "Stories". The project id is the constant `proj_1ce836f0`, passed as a prop with that default. Nav gets "Backlog" and "Stories" links; `App.tsx` shows the page for `#backlog` / `#stories` and the Dashboard otherwise.
    files:
      - apps/web/src/backlog/BacklogPage.tsx
      - apps/web/src/backlog/StoryList.tsx
      - apps/web/src/App.tsx
      - apps/web/src/AppHeader.tsx
    rationale: |
      Minimal UI the ACs need ("through the UI", "story list is viewed"). Existing Tailwind tokens and the Dashboard styling are reused; no new dependencies.
  - description: |
      Vitest component tests (written first) and the Playwright spec. The spec keeps a per-test in-memory fake of the API inside its own `beforeEach`, so it depends on no other spec and no pre-existing data.
    files:
      - apps/web/src/backlog/BacklogPage.test.tsx
      - apps/web/e2e/backlog-to-story.spec.ts
    rationale: |
      TDD order: tests first and failing, then the UI. The e2e spec is the deliverable of the story.
tests:
  - |
    AC1 (vitest, BacklogPage.test.tsx) — a backlog item the test adds appears in the list for proj_1ce836f0. Uses `fireEvent` because `@testing-library/user-event` is not a dependency:
    ```ts
    render(<BacklogPage projectId="proj_1ce836f0" client={fake} />);
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Export report" } });
    fireEvent.click(screen.getByRole("button", { name: "Add item" }));
    expect(await screen.findByText("Export report")).toBeVisible();
    expect(fake.addBacklogItem).toHaveBeenCalledWith("proj_1ce836f0", "Export report");
    ```
  - |
    AC2 (vitest) — clicking "Create story" calls the client with that item and shows the story:
    ```ts
    fireEvent.click(await screen.findByRole("button", { name: "Create story" }));
    await waitFor(() =>
      expect(fake.createStoryFromBacklogItem).toHaveBeenCalledWith("proj_1ce836f0", "bi_1"),
    );
    ```
  - |
    AC3 (Playwright) — the spec seeds nothing outside itself. The route stub starts with an empty state in `beforeEach`, and the test adds its own item first:
    ```ts
    test("creates a story from a backlog item it created itself", async ({ page }) => {
      await page.goto("/#backlog");
      await page.getByLabel("Title").fill("Export report");
      await page.getByRole("button", { name: "Add item" }).click();
      await expect(page.getByText("Export report")).toBeVisible();   // AC1
      await page.getByRole("button", { name: "Create story" }).click(); // AC2
    ```
    It runs alone with `pnpm exec playwright test e2e/backlog-to-story.spec.ts` and must pass (AC3).
  - |
    AC4 (Playwright, same spec) — after creating the story, open the story list:
    ```ts
      await page.getByRole("banner").getByRole("link", { name: "Stories" }).click();
      await expect(page.getByRole("heading", { name: "Stories" })).toBeVisible();
      await expect(page.getByRole("listitem").filter({ hasText: "Export report" })).toBeVisible();
    });
    ```
    There is no step that edits acceptance criteria.
  - |
    Regression — existing `e2e/app.spec.ts` ("exactly one Records link") and `App.test.tsx` still pass after the nav change. Run `pnpm test && pnpm lint && pnpm typecheck && pnpm test:e2e` in `apps/web`.
assumptions_or_open_questions:
  - |
    BIGGEST QUESTION: no backlog/story feature exists in the repo (web is a Health dashboard, workflow-api only has health endpoints). I assumed the story means adding a minimal UI in `apps/web` plus a stubbed API. If a backlog/story UI is delivered by another item, drop the UI scope and keep only the e2e spec. Please confirm.
  - |
    The API contract (routes and shapes above) is invented, since no real workflow-api endpoints exist. Backend implementation in `services/workflow-api` and the database are deliberately NOT included. The e2e test is therefore a UI-level happy path with a stubbed API, not a full-stack one.
  - "The project id proj_1ce836f0 is a fixed constant in the UI and the test; no project selection UI is built."
  - "Backlog item is created through the UI form (not a direct API call), so the test is independent of other flows."
estimated_points: 5
package_dependencies: []
notes: |
  ### Data & rollout

  None — front-end UI and tests only, with a stubbed API; no schema, stored data, seed, setting or env var changes.

  ```mermaid
  flowchart TD
    Main[main.tsx] --> App[App.tsx]
    App --> Header[AppHeader.tsx]
    App --> Dash[dashboard/Dashboard.tsx]
    App --> Page[backlog/BacklogPage.tsx]
    Page --> Stories[backlog/StoryList.tsx]
    Page --> Client[backlog/backlogClient.ts]
    E2E[e2e/backlog-to-story.spec.ts] -. page.route stub .-> Client
    classDef touched fill:#f96,color:#000
    class App,Header,Page,Stories,Client,E2E touched
  ```

  Touched nodes: App and AppHeader (routing and nav), Page, Stories and Client (new UI), E2E (the deliverable). Follows the `dashboardClient.ts` injectable-client pattern and the `page.route` stubbing in `e2e/app.spec.ts`. Stack: React, Tailwind, vitest, Playwright, pnpm (comp_web_app).
review_focus: |
  IN: one Playwright spec plus the minimal Backlog/Stories UI it needs, with the API stubbed at the network layer. OUT: real workflow-api endpoints, persistence, and refining acceptance criteria. Riskiest part is the assumption that the UI must be built here (nothing exists today) and the invented API contract. The nav change must not break the existing "exactly one Records link" e2e test.
