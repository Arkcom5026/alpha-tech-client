import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { PurchaseReceiptFinalizePanel } from './PurchaseReceiptFinalizePanel';

describe('PurchaseReceiptFinalizePanel', () => {
  it('shows partial receipt state and blocks finalization when not eligible', () => {
    render(<PurchaseReceiptFinalizePanel receiptId={91} />);

    expect(screen.getByText('เลขที่ใบรับ: 91')).toBeTruthy();
    expect(screen.getByText('เป็นการรับสินค้าบางส่วน')).toBeTruthy();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('calls finalize when eligible', () => {
    const onFinalize = vi.fn();
    render(<PurchaseReceiptFinalizePanel
      receiptId={91}
      allRowsConfirmed
      allItemsComplete
      canFinalize
      onFinalize={onFinalize}
    />);

    fireEvent.click(screen.getByRole('button', { name: 'ยืนยันการตรวจรับ' }));
    expect(onFinalize).toHaveBeenCalledOnce();
  });

  it('shows finalization errors and completed state', () => {
    const { rerender } = render(<PurchaseReceiptFinalizePanel
      canFinalize
      finalizeError="ยืนยันไม่สำเร็จ"
    />);
    expect(screen.getByRole('alert').textContent).toBe('ยืนยันไม่สำเร็จ');

    rerender(<PurchaseReceiptFinalizePanel finalizedReceipt={{ id: 91 }} />);
    expect(screen.getByRole('status').textContent).toContain('เรียบร้อย');
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
