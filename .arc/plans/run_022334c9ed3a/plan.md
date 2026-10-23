summary: |
  Build the patient Dashboard (Home) screen in `apps/web` (React + Tailwind + vitest, pnpm), which today is only a placeholder "Workflow Platform" heading in `src/App.tsx`. The screen follows the approved prototype: a header (Health logo, Home and Records links), a "Today" title, three display-only stat tiles (Steps, Resting heart rate, Sleep) showing the latest reading recorded today, a primary "Log vitals" button that opens a "Log a vital" dialog (Cancel returns to the Dashboard), a "Next appointment" card that shows the soonest upcoming appointment and advances on its own when that appointment's time passes, and a "Your care" card showing only doctor name and last visit date (never a diagnosis). The only records entry point on the page is the Records link in the header. Work is test-first: pure selectors (latest reading today, next upcoming appointment) are unit-tested, then components, then the assembled page.
scope:
  - description: |
      Design tokens in Tailwind. Add the prototype's token values to `theme.extend` so components use token-named utilities and no raw hex values: colors `bg`, `surface`, `fg`, `fg-muted`, `border`, `primary`, `primary-fg`, `warning`, `warning-bg`, `danger`, `danger-bg`; spacing `space-1..6` = 4/8/12/16/24/32px; radii `sm`/`md`/`lg` = 4/8/12px; fontSize `sm`/`md`/`lg`/`xl` = 12/14/18/22px; font family Inter stack. Add small component classes (`.btn`, `.btn-primary`, `.btn-secondary`, `.card`, `.chip`, `.chip-warning`, `.field`, `.input`, `.select`) via `@layer components` in `src/index.css` using `@apply`, mirroring the prototype's prototype-utils.css (btn min-height 44px, card = surface bg + 1px border + radius-lg + space-4 padding).
    files:
      - apps/web/tailwind.config.ts
      - apps/web/src/index.css
    rationale: |
      UI guidelines require tokens only, `.card` for a summary unit and `.btn-primary` once per view (Log vitals is the single primary action; the dialog's Save is primary only while the dialog is open).
  - description: |
      Domain types and pure selectors (written first, no React). 
      ```ts
      export type VitalKind = "steps" | "heartRate" | "sleep";
      export interface VitalReading { kind: VitalKind; value: number; recordedAt: string } // ISO instant; sleep value in minutes
      export interface Appointment { id: string; startsAt: string; doctorName: string; reason: string }
      export interface CareSummary { doctorName: string | null; lastVisitDate: string | null } // deliberately no diagnosis field
      export function latestReadingToday(readings: VitalReading[], kind: VitalKind, now: Date): VitalReading | undefined
      export function nextAppointment(appointments: Appointment[], now: Date): Appointment | undefined
      export function formatSleep(minutes: number): string // 430 -> "7h 10m"
      export function formatUntil(startsAt: Date, now: Date): string // "In 4 hours 30 minutes", "In 4 days"
      ```
      `latestReadingToday` keeps readings whose `recordedAt` falls on the same local calendar day as `now` and returns the one with the greatest `recordedAt` (not array order). `nextAppointment` returns the earliest appointment with `startsAt > now`.
    files:
      - apps/web/src/dashboard/types.ts
      - apps/web/src/dashboard/selectors.ts
      - apps/web/src/dashboard/selectors.test.ts
    rationale: |
      Keeps ACs 3-7 (latest today, soonest upcoming, following one after time passes) in plain testable functions.
  - description: |
      Data access port. `dashboardClient.ts` exports `interface DashboardData { readings: VitalReading[]; appointments: Appointment[]; care: CareSummary }` and `interface DashboardClient { load(): Promise<DashboardData> }` plus a default `httpDashboardClient` that does `GET /api/dashboard` and parses JSON. `Dashboard` takes `client` as a prop (default `httpDashboardClient`) so tests inject a fake. The loading state (skeleton per prototype) and error state (alert "Today's stats could not be loaded. Check your connection and try again." with a Try again button) are handled in `Dashboard`.
    files:
      - apps/web/src/dashboard/dashboardClient.ts
    rationale: |
      No backend endpoint for this exists in the repo yet; a narrow port lets the UI be built and tested now (see open questions).
  - description: |
      Presentational components, each with a test written first. `StatTile({ label, value, emptyText })` renders a plain `div` (no role=button, no tabindex, no onClick, `cursor-default`) with label in `text-md text-fg-muted` and value in `text-xl font-semibold`, or the muted empty text (e.g. "No steps recorded today"). `StatTiles` renders the three tiles in a `grid grid-cols-3 gap-4` that becomes one column under 720px (`max-[720px]:grid-cols-1`), inside `section aria-label="Today's stats" aria-live="polite"`. `NextAppointmentCard({ appointment, now })` is a `section.card` titled "Next appointment" showing when (`text-xl font-semibold`), "Dr name, reason", and a `.chip.chip-warning` with the time-until text; with none it shows the calendar icon plus "You have no upcoming appointment scheduled." `CareCard({ care })` is a `section.card` titled "Your care" with a `dl` of "Doctor" and "Last visit" only. `VitalsDialog({ open, onClose, onSubmit })` is `role="dialog" aria-modal="true" aria-labelledby` titled "Log a vital" with Vital select (Steps, Resting heart rate (bpm), Sleep (hours)), Value input, error text "Enter a number, for example 8240.", Cancel (`.btn-secondary`) and "Save reading" (`.btn-primary`); it moves focus into the dialog on open, closes on Escape and Cancel, and returns focus to the opener.
    files:
      - apps/web/src/dashboard/StatTile.tsx
      - apps/web/src/dashboard/StatTiles.tsx
      - apps/web/src/dashboard/NextAppointmentCard.tsx
      - apps/web/src/dashboard/CareCard.tsx
      - apps/web/src/dashboard/VitalsDialog.tsx
      - apps/web/src/dashboard/components.test.tsx
    rationale: |
      Covers ACs 1, 2, 8, 9, 10, 11, 12, 13 per the prototype's Dashboard screen.
  - description: |
      Page assembly and time-driven refresh. `Dashboard({ client = httpDashboardClient, now = () => new Date() })` loads data in an effect, derives tiles/appointment with the selectors, and keeps a `now` state. A `setTimeout` is scheduled for the delay until the current next appointment's `startsAt` (cleared on cleanup and rescheduled whenever `now` changes) and on firing updates `now`, so the card re-renders with the following appointment (AC 7) without a reload. Layout per prototype: `main.mx-auto max-w-[960px] p-space-5 flex flex-col gap-space-5`, page head with `h1` "Today", Log vitals `.btn-primary` with plus icon, then `grid grid-cols-2 gap-4 items-start` with the two cards (one column under 720px). The page body contains no link to records. `Dashboard` must NOT render the prototype's demo scenario switcher or reviewer bar; those are review aids only.
    files:
      - apps/web/src/dashboard/Dashboard.tsx
      - apps/web/src/dashboard/Dashboard.test.tsx
    rationale: |
      ACs 1, 3-7, 12-14. The timer is the riskiest piece; it is tested with vitest fake timers.
  - description: |
      Shared header and app wiring. `AppHeader` renders `header` with the "Health" logo and `nav aria-label="Main"` containing links Home (`aria-current="page"` on the Dashboard) and Records (`href="#records"`), min-height 44px, focus-visible outline in primary. `App.tsx` renders `AppHeader` plus `Dashboard`. Existing `App.test.tsx` and `e2e/app.spec.ts` assert the placeholder "Workflow Platform" text and are updated to assert the Dashboard ("Today" heading) instead.
    files:
      - apps/web/src/AppHeader.tsx
      - apps/web/src/App.tsx
      - apps/web/src/App.test.tsx
      - apps/web/e2e/app.spec.ts
    rationale: |
      AC 14 depends on the Records link living in the shared header. The header is owned by a separate story, so this is the minimal shell needed to render the Dashboard; see open questions.
tests:
  - |
    AC 1 (selectors.test.ts and Dashboard.test.tsx): render the Dashboard with a fake client and assert the tiles appear.
    ```ts
    render(<Dashboard client={fakeClient(populated)} now={() => NOW} />);
    const stats = await screen.findByRole("region", { name: "Today's stats" });
    expect(within(stats).getByText("Steps")).toBeInTheDocument();
    expect(within(stats).getByText("Resting heart rate")).toBeInTheDocument();
    expect(within(stats).getByText("Sleep")).toBeInTheDocument();
    ```
  - |
    AC 2 (components.test.tsx): a tile is inert, and clicking it changes nothing.
    ```ts
    const tile = screen.getByText("Steps").parentElement!;
    expect(tile).not.toHaveAttribute("tabindex");
    expect(tile).not.toHaveAttribute("role");
    fireEvent.click(tile);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "Today's stats" })).queryByRole("button")).toBeNull();
    ```
  - |
    AC 3 (selectors.test.ts, then Dashboard.test.tsx): two step readings today, plus yesterday's; the latest by `recordedAt` wins, regardless of array order.
    ```ts
    const r = [
      { kind: "steps", value: 9000, recordedAt: "2026-10-22T20:00:00" },
      { kind: "steps", value: 8240, recordedAt: "2026-10-23T09:30:00" },
      { kind: "steps", value: 3000, recordedAt: "2026-10-23T07:00:00" },
    ] as VitalReading[];
    expect(latestReadingToday(r, "steps", new Date("2026-10-23T10:00:00"))?.value).toBe(8240);
    // page: expect(within(stepsTile).getByText("8,240")).toBeInTheDocument();
    // none today: expect(latestReadingToday(yesterdayOnly, "steps", NOW)).toBeUndefined(); tile shows "No steps recorded today"
    ```
  - |
    AC 4 (selectors.test.ts, Dashboard.test.tsx): heart rate tile shows the latest today with unit.
    ```ts
    expect(latestReadingToday(hrReadings, "heartRate", NOW)?.value).toBe(62);
    expect(within(hrTile).getByText("62 bpm")).toBeInTheDocument();
    // empty: "No heart rate recorded today"
    ```
  - |
    AC 5 (selectors.test.ts, Dashboard.test.tsx): sleep tile shows the latest today, formatted.
    ```ts
    expect(formatSleep(430)).toBe("7h 10m");
    expect(within(sleepTile).getByText("7h 10m")).toBeInTheDocument();
    // empty: "No sleep recorded today"
    ```
  - |
    AC 6 (selectors.test.ts, Dashboard.test.tsx): soonest upcoming appointment, ignoring past ones and array order.
    ```ts
    const appts = [later, past, soonest]; // soonest.startsAt > NOW > past.startsAt
    expect(nextAppointment(appts, NOW)?.id).toBe(soonest.id);
    const card = await screen.findByRole("region", { name: "Next appointment" });
    expect(within(card).getByText("Dr. Patel, General check-up")).toBeInTheDocument();
    expect(within(card).getByText("In 4 hours 30 minutes")).toBeInTheDocument();
    ```
  - |
    AC 7 (Dashboard.test.tsx): with fake timers, advancing past the first appointment shows the second, with no reload and the client called once.
    ```ts
    vi.useFakeTimers(); vi.setSystemTime(new Date("2026-10-23T10:00:00"));
    render(<Dashboard client={client} />);
    await vi.advanceTimersByTimeAsync(0);
    expect(within(card()).getByText(/General check-up/)).toBeInTheDocument();
    await act(() => vi.advanceTimersByTimeAsync(4.5 * 60 * 60 * 1000 + 1000));
    expect(within(card()).getByText(/Follow-up/)).toBeInTheDocument();
    expect(within(card()).queryByText(/General check-up/)).not.toBeInTheDocument();
    expect(client.load).toHaveBeenCalledTimes(1);
    ```
    Also assert the timeout is cleared on unmount (`vi.getTimerCount()` is 0 after `unmount()`).
  - |
    AC 8 (components.test.tsx, Dashboard.test.tsx): no upcoming appointment shows the friendly message.
    ```ts
    render(<Dashboard client={fakeClient({ ...populated, appointments: [] })} now={() => NOW} />);
    expect(await screen.findByText("You have no upcoming appointment scheduled.")).toBeInTheDocument();
    ```
    Same when every appointment is in the past.
  - |
    AC 9 (components.test.tsx): the Your care card shows the doctor name.
    ```ts
    render(<CareCard care={{ doctorName: "Dr. Patel, General Medicine", lastVisitDate: "2026-09-12" }} />);
    expect(screen.getByText("Doctor").nextSibling).toHaveTextContent("Dr. Patel, General Medicine");
    ```
  - |
    AC 10 (components.test.tsx): the card shows the last visit date, formatted "12 Sep 2026".
    ```ts
    expect(screen.getByText("Last visit").nextSibling).toHaveTextContent("12 Sep 2026");
    ```
    Also the no-previous-visit case shows a muted "No previous visit" rather than a blank (assumption below).
  - |
    AC 11 (components.test.tsx, Dashboard.test.tsx): no diagnosis shown, even when the client payload carries one.
    ```ts
    const care = within(await screen.findByRole("region", { name: "Your care" }));
    expect(care.queryByText(/diagnos|condition/i)).toBeNull();
    expect(screen.queryByText("Type 2 diabetes")).not.toBeInTheDocument(); // fake payload includes diagnosis: "Type 2 diabetes"
    expect(care.getAllByRole("term")).toHaveLength(2); // Doctor, Last visit only
    ```
  - |
    AC 12 (Dashboard.test.tsx): selecting Log vitals opens the dialog.
    ```ts
    fireEvent.click(await screen.findByRole("button", { name: "Log vitals" }));
    const dialog = screen.getByRole("dialog", { name: "Log a vital" });
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByLabelText("Vital")).toBeInTheDocument();
    ```
  - |
    AC 13 (Dashboard.test.tsx): Cancel closes the dialog, the Dashboard stays, and focus returns to Log vitals.
    ```ts
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Today" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Log vitals" })).toHaveFocus();
    ```
    Also Escape closes it.
  - |
    AC 14 (App.test.tsx): the only link to records is in the header.
    ```ts
    render(<App />);
    const records = await screen.findAllByRole("link", { name: /records/i });
    expect(records).toHaveLength(1);
    expect(within(screen.getByRole("banner")).getByRole("link", { name: "Records" })).toBe(records[0]);
    expect(within(screen.getByRole("main")).queryByRole("link", { name: /record/i })).toBeNull();
    expect(within(screen.getByRole("main")).queryByRole("button", { name: /record/i })).toBeNull();
    ```
    Dashboard rendered alone has no link whose accessible name or href mentions records.
  - |
    Loading and error states (Dashboard.test.tsx), from the prototype: a pending client promise shows skeleton placeholders with an sr-only "Loading"; a rejected one shows role="alert" with "Today's stats could not be loaded. Check your connection and try again." and a Try again button that calls `client.load` again.
  - |
    Playwright e2e (e2e/app.spec.ts) with `page.route("**/api/dashboard", ...)` fulfilling a fixture: the heading "Today" is visible, the Log vitals button opens the dialog and Cancel closes it, and the page has exactly one "Records" link, inside the header. Run with `cd apps/web && pnpm test && pnpm typecheck && pnpm lint && pnpm test:e2e`.
assumptions_or_open_questions:
  - |
    No backend or data source for readings, appointments or the care summary exists in the repo (`services/workflow-api` is not read here and nothing in `apps/web` calls an API). I assumed a single `GET /api/dashboard` returning `{ readings, appointments, care }`, hidden behind the `DashboardClient` port. Please confirm the real endpoint and shape, or that another story supplies it; if so only `dashboardClient.ts` changes.
  - |
    The shared header and navigation belong to a separate story. I assumed this item may ship a minimal `AppHeader` (logo, Home, Records) so the Dashboard is renderable and AC 14 is testable. If that story has already merged or is in flight, drop `AppHeader.tsx` and reuse theirs. There is no router in the app today, so Records is a `#records` hash link; routing is not added here.
  - |
    The vitals dialog is drawn in the prototype with a Save reading button and validation, but the ACs only cover opening and Cancel. I build the dialog UI and number validation per the prototype and pass the entered `{ kind, value }` to an optional `onSubmit` prop (default: close the dialog). Persisting a reading and refreshing the tiles is not planned; the prototype toast "Reading saved" is likewise omitted. Confirm whether saving belongs to this story or a separate vitals-logging story.
  - |
    UI guideline conflict: the guidelines describe a persistent left sidebar for the workflow console, while the approved prototype uses a top header with Home and Records, noted in the prototype as the patient app. I follow the prototype, as the story requires a header Records link. The guideline's "compact, data-dense" tone also differs from the prototype's 22px stat values; I follow the prototype for this screen.
  - |
    The prototype's scenario switcher and reviewer bar are review aids, not product UI, and are not built. The prototype's example data (Dr. Patel, 8,240 steps) is used only as test fixtures.
  - |
    Time-until text ("In 4 hours 30 minutes", "In 4 days") is the prototype's chip; its rounding rules are my assumption (largest of days, then hours plus minutes). Its text is not an AC, so tests pin only the two prototype examples.
  - |
    "Today" means the patient's browser-local calendar day, and sleep is stored in minutes and shown as "Xh Ym". The "Resting heart rate" tile label follows the prototype, while the AC calls it "heart rate". The no-previous-visit and no-doctor copy ("No previous visit", "No doctor assigned") is not specified in the design; I chose neutral wording.
  - |
    No new npm packages: tests use `fireEvent` and `within` from the already-installed `@testing-library/react` rather than adding `@testing-library/user-event`. Icons are inline SVGs copied from the prototype symbols (calendar, plus, alert), so no icon library is needed.
estimated_points: 5
package_dependencies: []
notes: |
  ### Data & rollout

  None — new UI in a greenfield web app. No database schema, stored data, seed or fixture, env var or config file changes; the only config touched is `tailwind.config.ts` theme values. The `/api/dashboard` contract is an assumption (see open questions) and nothing is provisioned. Rollback is reverting the commit.

  ### Context

  - `apps/web` is currently a scaffold: `src/App.tsx` is a placeholder, with vitest + jsdom + testing-library (`src/test/setup.ts` loads jest-dom) and a Playwright config. No router, no state library, no component library. The stack docs fix React, Tailwind, pnpm, vitest (unit) and Playwright (e2e), which this plan follows. Dashboard code lives in a new `src/dashboard/` folder.
  - Design source of truth: the approved prototype (Dashboard screen). Layout is a header (padding space-3/space-5, bottom border), a page `max-width 960px` with space-5 padding and gap, a head with "Today" `h1`, three equal-width stat tiles (bg `color-bg`, 1px border, radius-lg, space-4 padding, label 14px muted over 22px semibold value), the Log vitals primary button, then two equal cards (`.card`, title `font-size-lg`) in a two-column grid, collapsing to one column under 720px. The modal is 440px wide with a 45% opaque backdrop. All controls are at least 44px tall, and focus-visible is a 2px primary outline with 2px offset.
  - Stat tile values in the prototype: steps with thousands separator, heart rate as "62 bpm", sleep as "7h 10m". Empty text is shown in muted 14px.

  ```mermaid
  flowchart TD
    main[src/main.tsx] --> App[src/App.tsx]
    App --> Header[AppHeader.tsx: Records link, AC 14]
    App --> Dash[dashboard/Dashboard.tsx: page, timer]
    Dash --> Client[dashboard/dashboardClient.ts: data port]
    Dash --> Sel[dashboard/selectors.ts: latest today, next appt]
    Dash --> Tiles[dashboard/StatTiles.tsx + StatTile.tsx]
    Dash --> Appt[dashboard/NextAppointmentCard.tsx]
    Dash --> Care[dashboard/CareCard.tsx]
    Dash --> Dialog[dashboard/VitalsDialog.tsx]
    Tw[tailwind.config.ts + index.css: tokens] -.-> Dash
    classDef touched fill:#f96,color:#000
    class App,Header,Dash,Client,Sel,Tiles,Appt,Care,Dialog,Tw touched
  ```

  Only `main.tsx` is untouched context in the diagram; all other nodes are created or modified by this plan.

  ### Order of work (TDD)

  1. `selectors.test.ts` (red) then `selectors.ts`/`types.ts`.
  2. `components.test.tsx` (red) then the five components.
  3. `Dashboard.test.tsx` (red, including fake-timer AC 7, loading and error) then `Dashboard.tsx` and `dashboardClient.ts`.
  4. `App.test.tsx` and the e2e spec updated (red) then `AppHeader.tsx` and `App.tsx`.
  5. Tokens in `tailwind.config.ts` and `index.css` are added alongside step 2 so that components can use them.
review_focus: |
  IN: the Dashboard screen only (stat tiles, Next appointment card, Your care card, Log vitals button and dialog open/Cancel) plus a minimal header shell so AC 14 is testable. OUT: care plan, full appointments list, diagnosis, records screen, routing, persisting a vital, and the backend endpoint. The riskiest part is the next-appointment timer in `Dashboard.tsx` (rescheduling, clearing on unmount, and no extra fetch) and the "latest reading today" selection, which orders by `recordedAt` rather than array order. Deliberate choices: no diagnosis field exists in the `CareSummary` type, stat tiles are non-interactive divs, and the prototype's top header is followed over the guidelines' sidebar.
