export interface Job {
  id: string;
  type: string;
  payload: unknown;
}

export interface JobQueueClient {
  receive(): Promise<Job[]>;
  complete(job: Job): Promise<void>;
}

export class NoopJobQueueClient implements JobQueueClient {
  async receive(): Promise<Job[]> {
    return [];
  }

  async complete(): Promise<void> {
    // no-op until a job queue provider is selected
  }
}
