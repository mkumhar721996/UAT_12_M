import { WorkerConfig } from './config';
import { Job, JobQueueClient } from './jobQueue';

export type JobHandler = (job: Job) => Promise<void>;

export class WorkflowWorker {
  private running = false;

  constructor(
    private readonly queue: JobQueueClient,
    private readonly config: WorkerConfig,
    private readonly handleJob: JobHandler = defaultJobHandler
  ) {}

  async runOnce(): Promise<number> {
    const jobs = await this.queue.receive();
    for (const job of jobs) {
      await this.handleJob(job);
      await this.queue.complete(job);
    }
    return jobs.length;
  }

  async start(): Promise<void> {
    this.running = true;
    while (this.running) {
      await this.runOnce();
      await sleep(this.config.pollIntervalMs);
    }
  }

  stop(): void {
    this.running = false;
  }
}

async function defaultJobHandler(job: Job): Promise<void> {
  console.log(`[workflow-worker] received job ${job.id} (${job.type})`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
