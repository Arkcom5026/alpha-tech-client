import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PurchaseReceiptItemsPanel } from './PurchaseReceiptItemsPanel';

describe('PurchaseReceiptItemsPanel', () => {
  it('renders an empty state', () => {
    render(<PurchaseReceiptItemsPanel rows={[]} />);
    expect(screen.getByText('ไม่พบรายการสินค้าสำหรับตรวจรับ')).toBeTruthy();
  });

  it('renders every row and item count', () => {
    render(<PurchaseReceiptItemsPanel rows={[
      { id: 1, name: 'สินค้า A', canSave: false },
      { id: 2, name: 'สินค้า B', canSave: false },
    ]} />);

    expect(screen.getByText('ทั้งหมด 2 รายการ')).toBeTruthy();
    expect(screen.getByText('สินค้า A')).toBeTruthy();
    expect(screen.getByText('สินค้า B')).toBeTruthy();
  });

  it('disables row inputs while the page is busy', () => {
    render(<PurchaseReceiptItemsPanel
      isBusy
      rows={[{ id: 1, draftQuantity: 1, draftCostPrice: 10, canSave: true }]}
    />);

    expect(screen.getByLabelText('receipt-quantity-1')).toBeDisabled();
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
