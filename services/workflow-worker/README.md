# workflow-worker

Executes background and asynchronous work: notifications/alerts and longer-running
or scheduled workflow/process steps. Consumes jobs from the job queue and updates
process/task state in the relational database (see ADR-0003, ADR-0006, ADR-0004).

## Development

```sh
pnpm install
pnpm run dev
```

## Build

```sh
pnpm run build
```

## Test

```sh
pnpm test
```
