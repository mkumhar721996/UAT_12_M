import { Job, JobQueueClient } from '../jobQueue';
import { WorkflowWorker } from '../worker';

class FakeJobQueueClient implements JobQueueClient {
  completed: Job[] = [];

  constructor(private jobs: Job[]) {}

  async receive(): Promise<Job[]> {
    const jobs = this.jobs;
    this.jobs = [];
    return jobs;
  }

  async complete(job: Job): Promise<void> {
    this.completed.push(job);
  }
}

describe('WorkflowWorker', () => {
  it('processes and completes each received job', async () => {
    const job: Job = { id: '1', type: 'notification', payload: {} };
    const queue = new FakeJobQueueClient([job]);
    const handled: Job[] = [];
    const worker = new WorkflowWorker(queue, { pollIntervalMs: 1000 }, async (j) => {
      handled.push(j);
    });

    const count = await worker.runOnce();

    expect(count).toBe(1);
    expect(handled).toEqual([job]);
    expect(queue.completed).toEqual([job]);
  });

  it('returns 0 when there are no jobs to process', async () => {
    const queue = new FakeJobQueueClient([]);
    const worker = new WorkflowWorker(queue, { pollIntervalMs: 1000 });

    const count = await worker.runOnce();

    expect(count).toBe(0);
  });
});
