import { describe, expect, it, vi } from 'vitest';

import { createKeyedRequestDeduper } from '../src/features/address/store/keyedRequestDeduper';

describe('createKeyedRequestDeduper', () => {
  it('shares one in-flight promise for concurrent calls with the same key', async () => {
    const deduper = createKeyedRequestDeduper();
    let release;
    const pending = new Promise((resolve) => { release = resolve; });
    const factory = vi.fn(async () => {
      await pending;
      return ['district'];
    });

    const first = deduper.run('60', factory);
    const second = deduper.run('60', factory);

    expect(first).toBe(second);
    expect(factory).toHaveBeenCalledTimes(0);

    await Promise.resolve();
    expect(factory).toHaveBeenCalledTimes(1);

    release();
    await expect(first).resolves.toEqual(['district']);
    expect(deduper.has('60')).toBe(false);
  });

  it('allows different keys to run independently', async () => {
    const deduper = createKeyedRequestDeduper();
    const factoryA = vi.fn(async () => 'A');
    const factoryB = vi.fn(async () => 'B');

    const [a, b] = await Promise.all([
      deduper.run('60', factoryA),
      deduper.run('61', factoryB),
    ]);

    expect(a).toBe('A');
    expect(b).toBe('B');
    expect(factoryA).toHaveBeenCalledTimes(1);
    expect(factoryB).toHaveBeenCalledTimes(1);
    expect(deduper.size()).toBe(0);
  });

  it('clears a failed request so the same key can retry', async () => {
    const deduper = createKeyedRequestDeduper();
    const failure = new Error('network');

    await expect(deduper.run('6005', async () => { throw failure; })).rejects.toBe(failure);
    expect(deduper.has('6005')).toBe(false);

    await expect(deduper.run('6005', async () => 'retry-ok')).resolves.toBe('retry-ok');
  });
});
