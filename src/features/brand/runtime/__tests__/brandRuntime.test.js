import { beforeEach, describe, expect, it, vi } from 'vitest';

const normalizeRuntimeError = vi.fn((error) => ({
  kind: 'runtime',
  message: error?.message || 'REQUEST_FAILED',
  status: error?.status,
  code: error?.code,
  retryable: false,
  cause: error,
}));

const withLoading = vi.fn(async (_operation, task) => task());

vi.mock('@/runtime', () => ({
  normalizeRuntimeError,
  withLoading,
}));

const {
  BRAND_RUNTIME_OPERATION,
  normalizeBrandRuntimeError,
  withBrandRuntime,
} = await import('../brandRuntime');

describe('brandRuntime', () => {
  beforeEach(() => {
    normalizeRuntimeError.mockClear();
    withLoading.mockClear();
  });

  it('defines a unique ADS loading key for every Brand runtime operation', () => {
    const keys = Object.values(BRAND_RUNTIME_OPERATION);

    expect(keys).toHaveLength(10);
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys.every((key) => key.startsWith('brand.'))).toBe(true);
  });

  it('delegates error normalization to the ADS runtime contract', () => {
    const sourceError = Object.assign(new Error('โหลดแบรนด์ไม่สำเร็จ'), {
      status: 503,
      code: 'BRAND_UNAVAILABLE',
    });

    const result = normalizeBrandRuntimeError(sourceError);

    expect(normalizeRuntimeError).toHaveBeenCalledWith(sourceError);
    expect(result).toMatchObject({
      kind: 'runtime',
      message: 'โหลดแบรนด์ไม่สำเร็จ',
      status: 503,
      code: 'BRAND_UNAVAILABLE',
      retryable: false,
      cause: sourceError,
    });
  });

  it('delegates operation lifecycle to ADS withLoading without changing the result', async () => {
    const task = vi.fn().mockResolvedValue({ ok: true, items: [{ id: 1 }] });

    const result = await withBrandRuntime(BRAND_RUNTIME_OPERATION.FETCH_LIST, task);

    expect(withLoading).toHaveBeenCalledWith(BRAND_RUNTIME_OPERATION.FETCH_LIST, task);
    expect(task).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ ok: true, items: [{ id: 1 }] });
  });
});
