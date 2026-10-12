export interface WorkerConfig {
  pollIntervalMs: number;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): WorkerConfig {
  return {
    pollIntervalMs: Number(env.WORKER_POLL_INTERVAL_MS ?? 5000),
  };
}
