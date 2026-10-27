# QA e2e suite

Happy-path Playwright tests that run against the deployed QA environment (no mocking, no local server).

```
QA_BASE_URL=https://<qa-host> pnpm test:e2e:qa
```

| Variable | Required | Purpose |
|----------|----------|---------|
| `QA_BASE_URL` | yes | QA web app URL; the run fails fast when unset |
| `QA_DESIGN_TIMEOUT_MS` | no | Per-test timeout, default 600000 (design generation) |
| `QA_STORAGE_STATE` | if sign-in is required | Path to a Playwright storageState file for a pre-provisioned QA user |

Credentials come from the environment or a local storageState file; never commit them.

The selectors (button names, `story-status`, `ux-design-stage-status`, `design-screen`) are
placeholders to be confirmed against the QA UI. `pnpm test:e2e` ignores this folder.
