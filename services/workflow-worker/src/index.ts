import 'dotenv/config';
import { loadConfig } from './config';
import { NoopJobQueueClient } from './jobQueue';
import { WorkflowWorker } from './worker';

async function main(): Promise<void> {
  const config = loadConfig();
  const worker = new WorkflowWorker(new NoopJobQueueClient(), config);

  process.on('SIGTERM', () => worker.stop());
  process.on('SIGINT', () => worker.stop());

  console.log('[workflow-worker] starting');
  await worker.start();
  console.log('[workflow-worker] stopped');
}

if (require.main === module) {
  main().catch((err) => {
    console.error('[workflow-worker] fatal error', err);
    process.exit(1);
  });
}
