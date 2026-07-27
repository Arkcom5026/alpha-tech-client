import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createUnit, deleteUnit, getAllUnits, getUnitById, updateUnit } from '../../api/unitApi';
import useUnitStore from '../unitStore';
import { loading } from '@/runtime';

vi.mock('../../api/unitApi', () => ({
  getAllUnits: vi.fn(),
  createUnit: vi.fn(),
  updateUnit: vi.fn(),
  deleteUnit: vi.fn(),
  getUnitById: vi.fn(),
}));

const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

const apiError = {
  response: {
    status: 409,
    data: { code: 'UNIT_CONFLICT', message: 'หน่วยนับนี้มีอยู่แล้ว' },
  },
};

describe('unitStore ADS runtime adoption', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loading.reset();
    useUnitStore.setState({ units: [], currentUnit: null, isLoading: false, error: null });
  });

  it.each([
    ['unit.fetchList', getAllUnits, () => useUnitStore.getState().fetchUnits(), []],
    ['unit.fetchById', getUnitById, () => useUnitStore.getState().getUnitById(1), { id: 1 }],
    ['unit.create', createUnit, () => useUnitStore.getState().addUnit({ name: 'ชิ้น' }), { id: 1, name: 'ชิ้น' }],
    ['unit.update', updateUnit, () => useUnitStore.getState().updateUnit(1, { name: 'กล่อง' }), { id: 1, name: 'กล่อง' }],
    ['unit.delete', deleteUnit, () => useUnitStore.getState().deleteUnit(1), undefined],
  ])('tracks %s while its API promise is pending', async (key, apiMock, runAction, result) => {
    const pending = deferred();
    apiMock.mockReturnValueOnce(pending.promise);

    const actionPromise = runAction();
    expect(loading.isLoading(key)).toBe(true);
    expect(useUnitStore.getState().isLoading).toBe(true);

    pending.resolve(result);
    await actionPromise;

    expect(loading.isLoading(key)).toBe(false);
    expect(useUnitStore.getState().isLoading).toBe(false);
  });

  it('normalizes failures and preserves the delete false contract', async () => {
    deleteUnit.mockRejectedValueOnce(apiError);

    await expect(useUnitStore.getState().deleteUnit(1)).resolves.toBe(false);

    expect(useUnitStore.getState().error).toMatchObject({
      kind: 'conflict',
      message: 'หน่วยนับนี้มีอยู่แล้ว',
      status: 409,
      code: 'UNIT_CONFLICT',
      retryable: false,
    });
    expect(loading.isLoading('unit.delete')).toBe(false);
  });
});
