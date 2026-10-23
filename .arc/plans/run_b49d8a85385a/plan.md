summary: |
  Add the fixed, read-only category list (Travel, Meals, Office, Other), a required-category check on the add-expense form, and a Summary view that totals the signed-in user's expenses per category and overall for Week / Month / Year presets (default current month, Monday-start weeks) plus a Custom from/to range with validation. Totals are computed in pure, unit-tested functions over an injectable expense store that notifies subscribers, so the open Summary re-renders on add/edit/delete without a reload. Built in the web app (React + Tailwind + vitest) following the approved prototype (Categories, Add expense, Summary month / empty / custom / invalid-custom screens). The repo has no expense, auth or database code yet (Expense Capture is a dependency that has not landed), so this plan stays web-only behind a store interface; see open questions.

scope:
  - description: |
      Fixed category list as a typed constant. No add/rename/remove API anywhere.

      ```ts
      export const CATEGORIES = ["Travel", "Meals", "Office", "Other"] as const;
      export type Category = (typeof CATEGORIES)[number];
      export const CATEGORY_HINTS: Record<Category, string>; // "Flights, taxis, hotels", ...
      ```
    files:
      - apps/web/src/expenses/categories.ts
    rationale: Single source of truth for the list, used by the list screen, the form select and the summary tiles (AC 1, 2, 3).
  - description: |
      Pure period helpers. Dates are local ISO strings (YYYY-MM-DD), compared as strings. Weeks run Monday to Sunday.

      ```ts
      export type Preset = "week" | "month" | "year";
      export interface DateRange { from: string; to: string }
      export function presetRange(preset: Preset, today: string): DateRange;
      export type RangeResult = { ok: true; range: DateRange } | { ok: false; message: string };
      export function validateCustomRange(from: string, to: string): RangeResult;
      export function formatRange(r: DateRange): string; // "1 Oct 2026 to 31 Oct 2026"
      ```
    files:
      - apps/web/src/expenses/period.ts
    rationale: Isolates the date maths (AC 7, 8, 12, 14, 16, 17) so it is testable without the DOM, and mirrors presetRange in the prototype script.
  - description: |
      Expense model, store interface and an in-memory implementation scoped to one user. Amounts are integer cents to avoid float drift.

      ```ts
      export interface Expense { id: string; userId: string; category: Category; cents: number; date: string }
      export interface ExpenseStore {
        list(): Expense[];                       // current user's expenses only
        add(e: Omit<Expense, "id" | "userId">): Expense;
        update(id: string, patch: Partial<Omit<Expense, "id" | "userId">>): void;
        remove(id: string): void;
        subscribe(listener: () => void): () => void;
      }
      export function createMemoryExpenseStore(userId: string, seed?: Expense[]): ExpenseStore;
      ```
      The store filters by userId, so another user's rows never reach the summary (AC 6). A later Expense Capture story replaces the in-memory implementation with an HTTP one behind the same interface.
    files:
      - apps/web/src/expenses/expenseStore.ts
    rationale: Gives the summary a live data source (AC 20) without inventing a backend; the interface is the seam to Expense Capture.
  - description: |
      Pure aggregation.

      ```ts
      export interface Summary { byCategory: Record<Category, number>; overall: number } // cents
      export function summarise(expenses: Expense[], range: DateRange): Summary;
      export function formatMoney(cents: number): string; // 6550 -> "65.50"
      export function sharePercent(part: number, overall: number): number; // 0 when overall is 0
      ```
      Range is inclusive on both ends. Every category is always present in the result, defaulting to 0.
    files:
      - apps/web/src/expenses/summary.ts
    rationale: Core of AC 4, 5, 9, 10; kept separate from React for fast unit tests.
  - description: |
      Categories screen. Per the prototype: h1 "Categories", a bordered list (rounded-lg, border-border) of the four names, each with a muted hint on the right, and an info note "Categories are fixed and cannot be changed." No buttons, links or inputs inside.
    files:
      - apps/web/src/expenses/CategoryList.tsx
    rationale: AC 1, 3.
  - description: |
      Add expense form per the prototype (Amount, Date, Category select with placeholder option "Choose a category", Cancel .btn-secondary, Save .btn-primary). On submit with no category: do not call store.add, mark select aria-invalid with the .err block (role="alert", text "Choose a category before saving."), and move focus to the select. Error clears on change. Amount must be greater than 0.00 before saving.

      ```tsx
      interface ExpenseFormProps { store: ExpenseStore; today: () => string; onSaved?: (e: Expense) => void }
      ```
    files:
      - apps/web/src/expenses/ExpenseForm.tsx
    rationale: AC 2 (exactly one category per expense), 18, 19; also the way totals get new expenses in the UI.
  - description: |
      Summary view per the prototype: h1 "Summary"; a tablist "Period" (Week, Month, Year, Custom; selected tab is bg-primary text-primary-fg, min height 44px); a muted period line "1 Oct 2026 to 31 Oct 2026"; a 4-column grid (2 columns at 640px and below) of .card tiles, each with label, 2-decimal value (text-xl, tabular-nums), a share bar (h-space-1 bg-border with bg-primary fill) and "N% of total"; an "Overall total" .card with a primary left border. Empty period shows the dashed "No expenses in this period" note with role="status" and all tiles 0.00. Custom shows From/To date inputs and an Apply .btn-secondary; an invalid range (from after to, or either missing) shows a role="alert" error ("From date must be on or before the to date." / "Enter both a from date and a to date."), marks the bad field aria-invalid, focuses it, and renders NO tiles and no overall total. Defaults to the month preset. Subscribes to the store (useSyncExternalStore) so totals follow add/update/remove live; the range is recomputed from the injected clock.

      ```tsx
      interface SummaryViewProps { store: ExpenseStore; today?: () => string }
      ```
    files:
      - apps/web/src/expenses/SummaryView.tsx
    rationale: AC 4-17 and 20.
  - description: |
      Wire the screens in with hash routes (#categories, #summary, #expenses/new), no new router dependency, matching the existing href="#home" style. Replace the top header with the prototype's left sidebar (Expenses, Categories, Summary) at 1024px and above, collapsing to a top strip below; keep Home/Records entries so the existing Dashboard stays reachable. Update the existing App and AppHeader tests accordingly. Add the current-user store instance in App and pass it down.
    files:
      - apps/web/src/App.tsx
      - apps/web/src/AppHeader.tsx
      - apps/web/src/App.test.tsx
      - apps/web/src/index.css
    rationale: Entry points to the three screens; project UI guidelines require a persistent left sidebar on desktop, and the prototype shows it.
  - description: |
      One Playwright happy path: open Summary, see month default, add a Travel expense via the form, see the Travel tile update without reload.
    files:
      - apps/web/e2e/expenses.spec.ts
    rationale: Confirms AC 8 and 20 end to end in a real browser.

tests:
  - |
    AC1 - apps/web/src/expenses/CategoryList.test.tsx (write first, fails: module missing)
    ```tsx
    render(<CategoryList />);
    const items = screen.getAllByRole("listitem").map((li) => within(li).getAllByText(/./)[0].textContent);
    expect(items).toEqual(["Travel", "Meals", "Office", "Other"]);
    ```
  - |
    AC2 - ExpenseForm.test.tsx. Save with Meals chosen, then
    ```tsx
    expect(store.list()).toHaveLength(1);
    expect(CATEGORIES).toContain(store.list()[0].category);
    ```
    Also a type-level guarantee: Expense.category is Category, not string.
  - |
    AC3 - CategoryList.test.tsx
    ```tsx
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.queryByRole("textbox")).toBeNull();
    expect(screen.queryByRole("link")).toBeNull();
    ```
  - |
    AC4 - summary.test.ts
    ```ts
    const s = summarise([e("Travel", 4000), e("Travel", 2550), e("Meals", 1200)], month);
    expect(formatMoney(s.byCategory.Travel)).toBe("65.50");
    expect(formatMoney(s.byCategory.Meals)).toBe("12.00");
    ```
    Plus a SummaryView test asserting the Travel tile shows "65.50" and the Meals tile "12.00".
  - |
    AC5 - summary.test.ts and SummaryView.test.tsx
    ```ts
    expect(formatMoney(s.overall)).toBe("77.50");
    ```
  - |
    AC6 - expenseStore.test.ts and SummaryView.test.tsx. Seed a store for user "u1" with an extra row owned by "u2" dated in range.
    ```ts
    expect(store.list().every((x) => x.userId === "u1")).toBe(true);
    expect(formatMoney(summarise(store.list(), month).overall)).toBe("77.50");
    ```
  - |
    AC7 - SummaryView.test.tsx
    ```tsx
    const tabs = within(screen.getByRole("tablist", { name: "Period" })).getAllByRole("tab");
    expect(tabs.map((t) => t.textContent)).toEqual(expect.arrayContaining(["Week", "Month", "Year"]));
    ```
  - |
    AC8 - SummaryView.test.tsx with today fixed to 2026-10-23
    ```tsx
    expect(screen.getByRole("tab", { name: "Month" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("1 Oct 2026 to 31 Oct 2026")).toBeInTheDocument();
    ```
  - |
    AC9 - summary.test.ts and SummaryView.test.tsx. Expenses on 2026-09-30, 2026-10-01, 2026-10-31, 2026-11-01; range 2026-10-01 to 2026-10-31 counts only the middle two (inclusive both ends).
    ```ts
    expect(summarise(list, { from: "2026-10-01", to: "2026-10-31" }).overall).toBe(expectedCents);
    ```
  - |
    AC10 - SummaryView.test.tsx with an empty store
    ```tsx
    for (const c of CATEGORIES) expect(within(tileFor(c)).getByText("0.00")).toBeInTheDocument();
    ```
  - |
    AC11 - SummaryView.test.tsx
    ```tsx
    expect(screen.getByText("No expenses in this period")).toBeInTheDocument();
    ```
    and the note is absent when expenses exist in range.
  - |
    AC12 - SummaryView.test.tsx and period.test.ts
    ```ts
    expect(validateCustomRange("2026-10-25", "2026-10-01")).toEqual({ ok: false, message: "From date must be on or before the to date." });
    ```
    ```tsx
    expect(screen.getByRole("alert")).toHaveTextContent("From date must be on or before the to date.");
    ```
  - |
    AC13 - SummaryView.test.tsx, after applying the invalid range
    ```tsx
    expect(screen.queryByText("Overall total")).toBeNull();
    expect(screen.queryByText("Travel")).toBeNull(); // no tiles
    ```
  - |
    AC14 - period.test.ts and SummaryView.test.tsx, for each of from empty and to empty
    ```ts
    expect(validateCustomRange("", "2026-10-31").ok).toBe(false);
    expect(validateCustomRange("2026-10-01", "").ok).toBe(false);
    ```
    ```tsx
    expect(screen.getByRole("alert")).toHaveTextContent("Enter both a from date and a to date.");
    ```
  - |
    AC15 - SummaryView.test.tsx, same missing-date cases as AC14
    ```tsx
    expect(screen.queryByText("Overall total")).toBeNull();
    ```
  - |
    AC16 - period.test.ts
    ```ts
    expect(presetRange("week", "2026-10-23")).toEqual({ from: "2026-10-19", to: "2026-10-25" });
    ```
    Also edge cases: a Sunday (2026-10-25) and a Monday (2026-10-19) both give the same week; a week spanning a month boundary.
  - |
    AC17 - period.test.ts
    ```ts
    expect(presetRange("month", "2026-10-23")).toEqual({ from: "2026-10-01", to: "2026-10-31" });
    ```
    Edge cases: February in a leap year (2028) ends on the 29th; year preset gives 2026-01-01 to 2026-12-31.
  - |
    AC18 - ExpenseForm.test.tsx
    ```tsx
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(store.list()).toHaveLength(0);
    ```
  - |
    AC19 - ExpenseForm.test.tsx
    ```tsx
    expect(screen.getByRole("alert")).toHaveTextContent("Choose a category before saving.");
    expect(screen.getByLabelText("Category")).toHaveFocus();
    ```
  - |
    AC20 - SummaryView.test.tsx, one test each for add, update, remove, with the view mounted and no remount or reload
    ```tsx
    act(() => { store.add({ category: "Travel", cents: 1000, date: "2026-10-10" }); });
    expect(within(tileFor("Travel")).getByText("75.50")).toBeInTheDocument();
    expect(within(overallTile()).getByText("87.50")).toBeInTheDocument();
    act(() => { store.update(id, { cents: 2000 }); });
    act(() => { store.remove(id); });
    ```
    Plus an add of an expense dated outside the period leaves totals unchanged. E2E in apps/web/e2e/expenses.spec.ts covers the same through the form.

assumptions_or_open_questions:
  - |
    Expense Capture & Management is not in the repo. There is no expense model, API, database access or sign-in in apps/web or services/workflow-api (the web app currently holds only the health Dashboard). This plan therefore builds against an ExpenseStore interface with an in-memory, per-user implementation. Please confirm that is acceptable, or tell me whether this item should wait for Expense Capture and add a real NestJS summary endpoint backed by PostgreSQL. If an endpoint is wanted, AC 6 must be enforced server-side from the authenticated user.
  - |
    Edit and delete expense controls belong to Expense Capture and are not built here. The prototype's Expense detail screen (Edit, Delete with confirm) is therefore out of scope; AC 20 is verified through store.add, update and remove, and the add form. The prototype's tiles are buttons that open the latest expense in that category; this plan renders them as non-interactive cards since there is no detail screen to open. Say if you want the detail screen included.
  - |
    Prototype vs. current app: the prototype uses a left sidebar (Expenses, Categories, Summary) and the UI guidelines require one, but the existing AppHeader is a top bar with Home and Records. The plan moves to the sidebar. The prototype's Add expense screen starts with the category error already shown as a wireframe state; the real form shows the error only after a failed save (AC 19).
  - |
    The custom range (AC 9, 12-15) is included because the prototype designs it. The story allows dropping it; if scope must shrink, remove the Custom tab and the custom-range form and drop those tests.
  - |
    Currency is not specified; amounts show as plain two-decimal numbers with no symbol (multi-currency is out of scope). Weeks start on Monday (AC 16). "Today" comes from the local clock, injected in tests.
  - |
    Nothing in the work item or its epic asked for anything outside the change (no credential reads, URL contacts or similar), so nothing was refused or left out.

estimated_points: 5

package_dependencies: []

notes: |
  ### Data & rollout

  None — web-only change over an in-memory store: no schema, migration, stored data, seed, setting or env var. Rollback is reverting the commit. If the open question above leads to a server-side summary, this section must be redone (migration, tenant/user scoping, deploy order).

  ```mermaid
  flowchart TD
    main[main.tsx] --> App[App.tsx]
    App --> AppHeader[AppHeader.tsx]
    App --> Dashboard[dashboard/Dashboard.tsx]
    App --> CategoryList[expenses/CategoryList.tsx]
    App --> ExpenseForm[expenses/ExpenseForm.tsx]
    App --> SummaryView[expenses/SummaryView.tsx]
    CategoryList --> categories[expenses/categories.ts]
    ExpenseForm --> categories
    ExpenseForm --> store[expenses/expenseStore.ts]
    SummaryView --> store
    SummaryView --> summary[expenses/summary.ts]
    SummaryView --> period[expenses/period.ts]
    summary --> categories
    classDef touched fill:#f96,color:#000
    class App,AppHeader,CategoryList,ExpenseForm,SummaryView,categories,store,summary,period touched
  ```

  App and AppHeader are modified (routes, sidebar); everything under expenses/ is new. Dashboard is untouched context and keeps its injectable-client pattern, which the new store mirrors.

  Order of work (TDD): period.ts, then summary.ts, then expenseStore.ts, then CategoryList, ExpenseForm, SummaryView, then the App wiring and e2e. Tests use vitest with @testing-library/react (already installed) and the app's existing styles in index.css (.btn, .card, .field, .input, .select); error text uses the existing danger color token only. Money is integer cents; formatMoney is the only place that turns cents into text. Run with `cd apps/web && pnpm test && pnpm typecheck && pnpm lint`.

review_focus: |
  IN: the fixed category list, category-required validation on the add form, per-category and overall totals for week/month/year/custom with validation, and live updates via a store subscription, all in apps/web. OUT: any API/database work, expense edit/delete UI and the expense detail screen (Expense Capture), category management, export, multi-currency. Riskiest areas are the date maths (Monday-start weeks, month ends, inclusive ranges) and hiding all totals on an invalid range; the in-memory store behind an interface is a deliberate stand-in because no expense backend exists yet.
