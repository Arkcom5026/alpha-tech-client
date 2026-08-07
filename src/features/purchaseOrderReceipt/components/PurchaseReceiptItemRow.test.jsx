import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { PurchaseReceiptItemRow } from './PurchaseReceiptItemRow';

describe('PurchaseReceiptItemRow', () => {
  it('renders receipt quantities and forwards draft changes', () => {
    const onChange = vi.fn();
    render(<PurchaseReceiptItemRow row={{
      id: 12,
      name: 'หมึกพิมพ์',
      ordered: 5,
      receivedBeforeInput: 2,
      remainingBeforeInput: 3,
      draftQuantity: 1,
      draftCostPrice: 490,
      canSave: true,
    }} onChange={onChange} />);

    expect(screen.getByText(/สั่ง 5/)).toBeTruthy();
    expect(screen.getByText(/รับแล้ว 2/)).toBeTruthy();
    fireEvent.change(screen.getByLabelText('receipt-quantity-12'), { target: { value: '2' } });
    expect(onChange).toHaveBeenCalledWith(12, { quantity: '2' });
  });

  it('forwards the source item when saving', () => {
    const onSave = vi.fn();
    const sourceItem = { id: 12, quantity: 5 };
    render(<PurchaseReceiptItemRow row={{
      id: 12,
      sourceItem,
      draftQuantity: 1,
      draftCostPrice: 100,
      canSave: true,
    }} onSave={onSave} />);

    fireEvent.click(screen.getByRole('button', { name: 'บันทึกรายการ' }));
    expect(onSave).toHaveBeenCalledWith(sourceItem);
  });

  it('blocks over-receive and saving states', () => {
    render(<PurchaseReceiptItemRow row={{
      id: 12,
      draftQuantity: 6,
      draftCostPrice: 100,
      canSave: true,
      isOverReceive: true,
    }} />);

    expect(screen.getByRole('alert').textContent).toContain('เกิน');
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
