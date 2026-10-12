import { loadConfig } from '../config';

describe('loadConfig', () => {
  it('defaults the poll interval when unset', () => {
    expect(loadConfig({})).toEqual({ pollIntervalMs: 5000 });
  });

  it('reads the poll interval from the environment', () => {
    expect(loadConfig({ WORKER_POLL_INTERVAL_MS: '1000' })).toEqual({ pollIntervalMs: 1000 });
  });
});
