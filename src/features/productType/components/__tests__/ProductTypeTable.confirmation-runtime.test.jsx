// @vitest-environment jsdom
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { confirmation } from '@/runtime';
import useProductTypeStore from '@/features/productType/store/productTypeStore.js';
import ProductTypeTable from '../ProductTypeTable';

vi.mock('@/features/productType/store/productTypeStore.js', () => ({
  default: vi.fn(),
}));

const archiveProductTypeAction = vi.fn();
const restoreProductTypeAction = vi.fn();

const renderTable = (row) =>
  render(
    <ProductTypeTable
      data={[row]}
      loading={false}
      error={null}
      page={1}
      limit={20}
      canManage
      onEdit={vi.fn()}
    />,
  );

describe('ProductTypeTable ADS confirmation runtime adoption', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    confirmation.reset();
    archiveProductTypeAction.mockResolvedValue(undefined);
    restoreProductTypeAction.mockResolvedValue(undefined);
    useProductTypeStore.mockReturnValue({
      archiveProductTypeAction,
      restoreProductTypeAction,
      isSubmitting: false,
    });
  });

  afterEach(() => {
    cleanup();
    confirmation.reset();
  });

  it('cancels an archive request through the ADS confirmation runtime', async () => {
    renderTable({ id: 1, name: 'Printer', active: true, isSystem: false });

    fireEvent.click(screen.getByRole('button', { name: 'ปิดใช้งาน' }));

    expect(confirmation.hasPending('productType.archive.1')).toBe(true);
    expect(screen.getByText(/ยืนยันการปิดใช้งาน/)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'ยกเลิก' }));

    await waitFor(() => {
      expect(confirmation.hasPending('productType.archive.1')).toBe(false);
    });
    expect(archiveProductTypeAction).not.toHaveBeenCalled();
  });

  it.each([
    {
      actionLabel: 'ปิดใช้งาน',
      key: 'productType.archive.1',
      row: { id: 1, name: 'Printer', active: true, isSystem: false },
      expectedAction: archiveProductTypeAction,
    },
    {
      actionLabel: 'กู้คืน',
      key: 'productType.restore.2',
      row: { id: 2, name: 'Scanner', active: false, isSystem: false },
      expectedAction: restoreProductTypeAction,
    },
  ])('executes $actionLabel only after ADS confirmation acceptance', async ({ actionLabel, key, row, expectedAction }) => {
    renderTable(row);

    fireEvent.click(screen.getByRole('button', { name: actionLabel }));

    expect(confirmation.hasPending(key)).toBe(true);
    expect(expectedAction).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'ยืนยัน' }));

    await waitFor(() => {
      expect(expectedAction).toHaveBeenCalledWith(row.id);
    });
    expect(confirmation.hasPending(key)).toBe(false);
  });
});
