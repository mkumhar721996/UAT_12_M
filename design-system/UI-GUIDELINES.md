# UI Guidelines

Rules for designing and building any screen in this product: an internal console for
employees and administrators to design workflows, action tasks/approvals, monitor execution,
and manage documents.

## Navigation

- Persistent left sidebar with the top-level sections (Workflows, Tasks & Approvals, Reports,
  Documents, Admin) — the product has five durable sections a user jumps between all day, so a
  sidebar beats a top bar for at-a-glance orientation across long sessions.
- No bottom navigation or hamburger collapse on desktop — this is an internal tool used on
  laptops/desktops during work hours, not a mobile-first product.
- Below 1024px the sidebar collapses behind a single menu button in the header (same five
  sections, same order) so the shell still fits a phone or tablet without a second navigation
  pattern.
- Section keys are `workflows`, `tasks`, `reports`, `documents`, `admin`; a screen marks its own
  section as current with `aria-current="page"` so the sidebar always shows where the user is.
- Admin-only sections (user/role management, tenant configuration) appear in the sidebar only
  for users with an admin role, rather than a separate admin app, per the single-Web-App
  decision for this product.

## Layout and density

- Design for a data-dense console, not a spacious consumer app: tasks, approvals, and workflow
  runs are read in lists/tables all day, so favor compact rows and `font-size-sm`/`font-size-md`
  over large type and whitespace.
- Primary breakpoint is desktop (≥1024px); below that, collapse multi-column layouts (e.g.
  list + detail) to a single column rather than redesigning components, since the product is
  used internally on company-issued laptops and tablets are a secondary, occasional case.
- Keep page-level padding and section gaps consistent using `space-5`/`space-6` so dense
  content doesn't feel cramped against the window edges.

## Component usage

- Use `.card` for a single entity's detail or summary (a workflow definition, a document, a
  dashboard tile) — anything a user reads as one unit.
- Use a table (not `.card` repeated per row) for any list the user scans, sorts, or filters —
  task queues, approval queues, workflow run history — because comparing fields across rows is
  the primary job there.
- Use a plain list only for short, unordered content with no comparable columns (e.g. recent
  activity, notifications).
- Use `.chip-success` / `.chip-warning` / `.chip-danger` exclusively for workflow/task/approval
  status (approved, pending, rejected) so status always reads the same way across the product.
- Use `.btn-primary` once per view for the single next action (approve, submit, save); every
  other action is `.btn-secondary`, so users always know the one recommended action on screen.
- Use `.btn-danger` only for the confirming step of a destructive action (delete, revoke, cancel
  run) and `.btn-ghost` for low-emphasis actions in table rows and toolbars, so destructive
  intent is never ambiguous and rows stay quiet.
- Use `.alert-*` for messages tied to the whole view or form, `.toast` for confirmation of a
  completed action, and `.field-error` for a single field, so feedback appears next to what it
  is about and at the right level of interruption.
- Use `.badge` for counts and labels (e.g. open tasks in the sidebar), never for approval status,
  which belongs to the `.chip-*` classes — the two must not be confused.
- Use `color-accent` sparingly for non-status highlights (e.g. automated steps) and the
  `color-neutral-*` scale for everything else that is not an action or status, so blue, green,
  amber and red keep meaning "act" and "state".
- Use `.modal` only for confirmations that block the task, and `.drawer` for viewing or editing a
  record while keeping the list underneath in context.

## Theme

- Light theme only for this release — the product is read during the workday on office/laptop
  displays, where dark mode gives no legibility benefit and would double the design/QA surface
  for v1.

## Voice and tone

- Copy is plain and operational: name the object and the action ("Approve expense report",
  not "Let's take a look at this request"). Internal business users scan for status and act
  quickly; they are not a consumer audience that needs persuading or reassurance.
- Errors and validation messages state what to fix, not just that something is wrong, since the
  user is mid-task and needs to resolve it, not reassess it.
