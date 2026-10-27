# QA plan-stage E2E

Runs the plan stage through the real web UI against the QA environment (no local server is started).

    pnpm test:e2e:qa

Environment variables:

- `ARC_QA_PROJECT_NAME` (required) — name of the existing Project the test creates its Story in.
- `ARC_QA_USER` / `ARC_QA_PASSWORD` (required) — QA test account (no MFA). Never commit these.
- `ARC_QA_BASE_URL` (optional) — defaults to `https://qa.bnts-arc.ai`.

The `qa-setup` project signs in, creates a uniquely named Story (`arc-e2e-plan-<timestamp>`), refines it and
asserts it is listed as Refined. It writes `.state.json` and `.auth.json` (both git-ignored) for the spec.
Stories are not deleted afterwards.
