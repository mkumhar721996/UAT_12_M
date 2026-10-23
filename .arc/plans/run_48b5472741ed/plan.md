summary: |
  Turn the static header from UAT-12-M-STORY-028 (apps/web/src/AppHeader.tsx, hard-coded Home as current, hrefs #home/#records) into the real shared header. Add a minimal hash-based route table so Home shows the Dashboard and Records shows a Health records placeholder screen, both wrapped in one signed-in layout that renders the same header with the correct aria-current item. Screens shown before sign-in are rendered outside that layout, so they get no header. No new dependency, no backend, no Profile control. The Health records screen itself belongs to the Health records epic; only the link target and a placeholder page are provided here.
scope:
  - description: |
      Route table and hash hook. New file `routes.ts` exports the route ids, their hashes and a pure parser, plus a `useHashRoute` hook that listens to `hashchange`.

      ```ts
      export type RouteId = "dashboard" | "health-records";
      export const ROUTE_HASH: Record<RouteId, string> = {
        dashboard: "#dashboard",
        "health-records": "#health-records",
      };
      // empty or unknown hash falls back to the dashboard
      export function parseRoute(hash: string): RouteId;
      export function useHashRoute(): RouteId;
      ```
    files:
      - apps/web/src/routes.ts
      - apps/web/src/routes.test.ts
    rationale: |
      The prototype navigates with #dashboard and #health-records. The web app has no router today and react is the only runtime dependency, so a tiny hash router avoids adding react-router for two links.
  - description: |
      Make AppHeader driven by the current route instead of hard-coded. Signature before to after:

      ```ts
      // before
      function AppHeader()
      // after
      function AppHeader({ current }: { current: RouteId })
      ```

      NAV_ITEMS becomes Home (href ROUTE_HASH.dashboard, id dashboard) and Records (href ROUTE_HASH["health-records"], id health-records); `aria-current="page"` and the underline/primary-colour classes apply to the item whose id equals `current`. Keep the existing Tailwind classes, logo text "Health", `nav aria-label="Main"` and 44px targets, which already match the prototype (.app-header, .main-nav, .nav-item). No Profile control.
    files:
      - apps/web/src/AppHeader.tsx
      - apps/web/src/AppHeader.test.tsx
    rationale: |
      Prototype design for the Dashboard and Health records screens uses the identical header, with the active page marked by a primary-colour underline and aria-current. The existing markup is reused verbatim so the two screens cannot drift.
  - description: |
      Signed-in layout and placeholder screen. `App.tsx` reads `useHashRoute()` and renders a `SignedInLayout` (AppHeader plus the screen) for the dashboard and health-records routes. Pre-sign-in screens must be rendered outside `SignedInLayout`, which is the single place the header is mounted. New `HealthRecordsPlaceholder` is a `<main>` with an h1 "Health records" and a `.card` carrying muted placeholder copy, mirroring the prototype's Health records screen (same `max-w-[960px]` page container, `p-space-5`, `gap-space-5` as Dashboard). The Health records epic replaces its body.

      ```tsx
      function SignedInLayout({ current, children }: { current: RouteId; children: ReactNode }) {
        return (<><AppHeader current={current} />{children}</>);
      }
      ```

      The existing App.test.tsx story 028 assertion (single Records link, only in the header) must keep passing on the Dashboard route; update it only where the route or href assumption changed.
    files:
      - apps/web/src/App.tsx
      - apps/web/src/SignedInLayout.tsx
      - apps/web/src/SignedInLayout.test.tsx
      - apps/web/src/health-records/HealthRecordsPlaceholder.tsx
      - apps/web/src/App.test.tsx
    rationale: |
      Header mounting moves from unconditional (App) to layout-scoped so AC 8 is enforced structurally. The prototype's Health records screen is explicitly a placeholder owned by another epic.
tests:
  - |
    AC 1 (apps/web/src/App.test.tsx) — failing first: the Dashboard route shows the shared header.
    ```tsx
    window.location.hash = "#dashboard";
    render(<App />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Today" })).toBeInTheDocument();
    ```
  - |
    AC 2 (App.test.tsx) — the Health records route shows the same header.
    ```tsx
    window.location.hash = "#health-records";
    render(<App />);
    expect(screen.getByRole("heading", { name: "Health records" })).toBeInTheDocument();
    const header = screen.getByRole("banner");
    expect(within(header).getByRole("link", { name: "Home" })).toBeInTheDocument();
    expect(within(header).getByRole("link", { name: "Records" })).toBeInTheDocument();
    ```
  - |
    AC 3 (AppHeader.test.tsx) — logo displayed.
    ```tsx
    render(<AppHeader current="dashboard" />);
    expect(within(screen.getByRole("banner")).getByText("Health")).toBeInTheDocument();
    ```
  - |
    AC 4 (AppHeader.test.tsx) — Home entry, marked current on the dashboard.
    ```tsx
    const nav = screen.getByRole("navigation", { name: "Main" });
    const home = within(nav).getByRole("link", { name: "Home" });
    expect(home).toHaveAttribute("href", "#dashboard");
    expect(home).toHaveAttribute("aria-current", "page");
    ```
  - |
    AC 5 (AppHeader.test.tsx) — Records entry pointing at the Health records screen and not current on the dashboard; also assert there is no Profile control.
    ```tsx
    const records = within(nav).getByRole("link", { name: "Records" });
    expect(records).toHaveAttribute("href", "#health-records");
    expect(records).not.toHaveAttribute("aria-current");
    expect(screen.queryByText(/profile/i)).toBeNull();
    ```
  - |
    AC 6 (App.test.tsx) — selecting Home on Health records returns to the Dashboard and moves aria-current. Uses fireEvent because @testing-library/user-event is not in package.json (do not add it). If jsdom does not fire hashchange on an anchor click, dispatch it manually inside act.
    ```tsx
    window.location.hash = "#health-records";
    render(<App />);
    fireEvent.click(screen.getByRole("link", { name: "Home" }));
    expect(await screen.findByRole("heading", { name: "Today" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page");
    ```
  - |
    AC 7 (App.test.tsx) — selecting Records on the Dashboard shows Health records.
    ```tsx
    window.location.hash = "#dashboard";
    render(<App />);
    fireEvent.click(screen.getByRole("link", { name: "Records" }));
    expect(await screen.findByRole("heading", { name: "Health records" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Records" })).toHaveAttribute("aria-current", "page");
    ```
  - |
    AC 8 (SignedInLayout.test.tsx) — a screen rendered outside the signed-in layout has no banner, while the layout does mount the header.
    ```tsx
    const { unmount } = render(<main><h1>Sign in to Health</h1></main>);
    expect(screen.queryByRole("banner")).toBeNull();
    expect(screen.queryByRole("navigation", { name: "Main" })).toBeNull();
    unmount();
    render(<SignedInLayout current="dashboard"><main /></SignedInLayout>);
    expect(screen.getByRole("banner")).toBeInTheDocument();
    ```
  - |
    routes.test.ts — pure parser.
    ```ts
    expect(parseRoute("#health-records")).toBe("health-records");
    expect(parseRoute("#dashboard")).toBe("dashboard");
    expect(parseRoute("")).toBe("dashboard");
    expect(parseRoute("#nonsense")).toBe("dashboard");
    ```
  - |
    Regression — existing story 028 assertion in App.test.tsx (exactly one Records link, inside the banner, none in main) still passes on the Dashboard route.
assumptions_or_open_questions:
  - |
    The repo has no sign-in screen (and no router) today. The sign-in screen in the prototype only illustrates AC 8; this plan does not build a sign-in screen, it makes the header layout-scoped and tests that a screen outside the layout has none. Whoever owns authentication mounts their screens outside SignedInLayout. Please confirm this is acceptable.
  - |
    Route hashes change from the story 028 placeholders (#home, #records) to the prototype's #dashboard and #health-records. Nothing else in the repo is believed to reference the old hashes (to be confirmed with a grep at implementation time).
  - |
    Hash routing is chosen to avoid a new dependency; if the Health records epic wants react-router, swapping useHashRoute is a one-file change.
  - |
    The prototype conflicts with the project UI guidelines (sidebar navigation for the workflow console). The prototype states that sidebar is not for this patient app, and story 028 already shipped a top-bar header, so the top-bar header is kept.
  - |
    Unknown hashes fall back to the Dashboard. Focus management and scroll reset on route change are not in the ACs and are left out.
estimated_points: 3
package_dependencies: []
notes: |
  ### Data & rollout
  None — front-end routing and layout only; no stored data, migrations, settings or provisioning. Safe to roll back by reverting the commit.

  Files read: apps/web/src/App.tsx, AppHeader.tsx, App.test.tsx, main.tsx, index.css, dashboard/Dashboard.tsx, package.json. Stack per ADR-0001 is React, Tailwind, vitest, pnpm; tests use vitest with @testing-library/react (jest-dom is configured in src/test/setup.ts).

  Design source (read): the prototype's header (.app-header with h3 logo "Health", nav "Main" with Home and Records, aria-current underline in primary colour, 44px nav targets), the Dashboard screen (Home current), the Health records placeholder screen (Records current, h1 "Health records" plus a muted card) and the Sign in screen (no header). Tokens only; light theme; the 720px breakpoint collapses spacing, which AppHeader already implements.

  ```mermaid
  flowchart TD
    main[main.tsx] --> App[App.tsx]
    App --> Routes[routes.ts]
    App --> Layout[SignedInLayout.tsx]
    Layout --> Header[AppHeader.tsx]
    App --> Dash[dashboard/Dashboard.tsx]
    App --> HR[health-records/HealthRecordsPlaceholder.tsx]
    Header --> Routes
    classDef touched fill:#f96,color:#000
    class App,Routes,Layout,Header,HR touched
  ```
  App picks the screen from the hash, Layout is the only place that mounts Header, and Header highlights the current route. Dashboard is unchanged.
review_focus: |
  IN scope: hash routing between Dashboard and a Health records placeholder, a shared header with a current-page marker, and header absence outside the signed-in layout. OUT: the real Health records screen, a sign-in screen, the Profile control, any new dependency. Riskiest part is AC 8 because no pre-sign-in screen exists yet, so it is enforced by layout structure and a test rather than a real route. Changing the hashes from #home/#records to #dashboard/#health-records is deliberate, to match the approved prototype.
