import { beforeEach, describe, expect, it } from 'vitest';
import { loading } from '../loadingController';
import { withLoading } from '../withLoading';

describe('loading runtime', () => {
  beforeEach(() => {
    loading.reset();
  });

  it('starts operation', () => {
    loading.start('save');

    expect(loading.isLoading('save')).toBe(true);
  });

  it('stops operation', () => {
    loading.start('save');
    loading.stop('save');

    expect(loading.isLoading('save')).toBe(false);
  });

  it('isolates multiple operations', () => {
    loading.start('save');
    loading.start('load');

    loading.stop('save');

    expect(loading.isLoading('save')).toBe(false);
    expect(loading.isLoading('load')).toBe(true);
  });

  it('cleans after successful task', async () => {
    await withLoading('save', async () => {
      expect(loading.isLoading('save')).toBe(true);
    });

    expect(loading.isLoading('save')).toBe(false);
  });

  it('cleans after failed task', async () => {
    await expect(
      withLoading('save', async () => {
        throw new Error('failed');
      }),
    ).rejects.toThrow('failed');

    expect(loading.isLoading('save')).toBe(false);
  });
});
