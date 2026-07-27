import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loading } from '@/runtime';
import {
  createPosition,
  getPositionById,
  getPositionDropdowns,
  getPositions,
  toggleActivePosition,
  updatePosition,
} from '../../api/positionApi.js';
import { usePositionStore } from '../positionStore.js';

vi.mock('../../api/positionApi.js', () => ({
  getPositions: vi.fn(),
  getPositionDropdowns: vi.fn(),
  getPositionById: vi.fn(),
  createPosition: vi.fn(),
  updatePosition: vi.fn(),
  toggleActivePosition: vi.fn(),
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

const runtimeError = {
  response: {
    status: 409,
    data: { code: 'POSITION_CONFLICT', message: 'ตำแหน่งนี้มีอยู่แล้ว' },
  },
};

describe('positionStore ADS runtime adoption', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loading.reset();
    usePositionStore.setState({
      list: [],
      dropdowns: [],
      current: null,
      loading: false,
      error: null,
      message: null,
    });
  });

  it.each([
    ['position.fetchList', getPositions, () => usePositionStore.getState().fetchListAction()],
    ['position.fetchDropdowns', getPositionDropdowns, () => usePositionStore.getState().fetchDropdownsAction()],
    ['position.fetchById', getPositionById, () => usePositionStore.getState().fetchByIdAction(1)],
    ['position.create', createPosition, () => usePositionStore.getState().createAction({ name: 'ช่าง' })],
    ['position.update', updatePosition, () => usePositionStore.getState().updateAction(1, { name: 'ช่าง' })],
    ['position.updateRole', updatePosition, () => usePositionStore.getState().updateRoleAction(1, 'employee')],
    ['position.toggleActive', toggleActivePosition, () => usePositionStore.getState().toggleActiveAction(1)],
  ])('tracks %s while the API promise is pending', async (key, apiMock, runAction) => {
    const pending = deferred();
    apiMock.mockReturnValueOnce(pending.promise);

    const actionPromise = runAction();
    expect(loading.isLoading(key)).toBe(true);

    pending.resolve(key === 'position.fetchList' ? [] : null);
    await actionPromise;

    expect(loading.isLoading(key)).toBe(false);
  });

  it('stores the ADS normalized error object without changing the null return contract', async () => {
    createPosition.mockRejectedValueOnce(runtimeError);

    await expect(usePositionStore.getState().createAction({ name: 'ช่าง' })).resolves.toBeNull();

    expect(usePositionStore.getState().error).toMatchObject({
      kind: 'conflict',
      message: 'ตำแหน่งนี้มีอยู่แล้ว',
      status: 409,
      code: 'POSITION_CONFLICT',
      retryable: false,
    });
    expect(usePositionStore.getState().loading).toBe(false);
  });
});
