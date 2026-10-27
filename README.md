# UAT_12_M
## QA intake-to-draft check

Playwright check that submits a new request in the existing project on QA, completes intake and expects a drafted story. It fails if no drafted story appears.

Required env vars (no defaults, never committed): `QA_BASE_URL`, `QA_USER_EMAIL`, `QA_USER_PASSWORD`, `QA_PROJECT_NAME`.

```sh
cd apps/web && pnpm run test:e2e:qa
```

The default `pnpm run test:e2e` ignores `e2e/qa/`.
