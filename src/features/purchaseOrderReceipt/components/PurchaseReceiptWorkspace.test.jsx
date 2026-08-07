import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  usePurchaseReceiptPage: vi.fn(),
  updateRow: vi.fn(),
  saveRow: vi.fn(),
  finalize: vi.fn(),
}));

vi.mock('../hooks/usePurchaseReceiptPage', () => ({
  usePurchaseReceiptPage: mocks.usePurchaseReceiptPage,
}));

import { PurchaseReceiptWorkspace } from './PurchaseReceiptWorkspace';

const createWorkflow = (overrides = {}) => ({
  viewModel: {
    receiptId: 91,
    rows: [{
      id: 11,
      name: 'หมึกพิมพ์',
      ordered: 2,
      receivedBeforeInput: 0,
      remainingBeforeInput: 2,
      draftQuantity: 2,
      draftCostPrice: 25,
      canSave: true,
      isOverReceive: false,
      isSaving: false,
      isSaved: false,
      error: null,
      sourceItem: { id: 11 },
    }],
    isBusy: false,
    resumeError: null,
    finalizeError: null,
    canFinalize: true,
    allRowsConfirmed: true,
    allItemsComplete: true,
    ...overrides.viewModel,
  },
  actions: {
    updateRow: mocks.updateRow,
    saveRow: mocks.saveRow,
    finalize: mocks.finalize,
  },
  finalize: {
    isFinalizing: false,
    finalizedReceipt: null,
    ...overrides.finalize,
  },
});

describe('PurchaseReceiptWorkspace', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.usePurchaseReceiptPage.mockReturnValue(createWorkflow());
  });

  it('renders the composed receipt workspace and forwards row/finalize actions', () => {
    const purchaseOrder = { id: 644, documentNumber: 'PO-644' };
    render(<PurchaseReceiptWorkspace purchaseOrder={purchaseOrder} api={{}} />);

    expect(screen.getByRole('heading', { name: 'ตรวจรับสินค้าตามใบสั่งซื้อ' })).toBeInTheDocument();
    expect(screen.getByText('ใบสั่งซื้อ: PO-644')).toBeInTheDocument();
    expect(screen.getByText('กำลังดำเนินการใบรับเลขที่ 91')).toBeInTheDocument();
    expect(screen.getByText('หมึกพิมพ์')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('receipt-quantity-11'), { target: { value: '1' } });
    expect(mocks.updateRow).toHaveBeenCalledWith(11, { quantity: '1' });

    fireEvent.click(screen.getByRole('button', { name: 'บันทึกรายการ' }));
    expect(mocks.saveRow).toHaveBeenCalledWith({ id: 11 });

    fireEvent.click(screen.getByRole('button', { name: 'ยืนยันการตรวจรับ' }));
    expect(mocks.finalize).toHaveBeenCalledOnce();
  });

  it('renders missing-PO and workflow error states without inventing recovery behavior', () => {
    const { rerender } = render(<PurchaseReceiptWorkspace purchaseOrder={null} api={{}} />);
    expect(screen.getByRole('alert')).toHaveTextContent('ไม่พบข้อมูลใบสั่งซื้อสำหรับตรวจรับ');

    mocks.usePurchaseReceiptPage.mockReturnValue(createWorkflow({
      viewModel: {
        resumeError: 'ไม่สามารถโหลดใบรับเดิมได้',
        finalizeError: 'ไม่สามารถยืนยันใบรับได้',
        canFinalize: false,
      },
    }));

    rerender(<PurchaseReceiptWorkspace purchaseOrder={{ id: 644 }} api={{}} />);
    expect(screen.getByText('ไม่สามารถโหลดใบรับเดิมได้')).toBeInTheDocument();
    expect(screen.getByText('ไม่สามารถยืนยันใบรับได้')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ยืนยันการตรวจรับ' })).toBeDisabled();
  });

  it('locks row editing while the composed workflow is busy', () => {
    mocks.usePurchaseReceiptPage.mockReturnValue(createWorkflow({
      viewModel: { isBusy: true },
      finalize: { isFinalizing: true },
    }));

    render(<PurchaseReceiptWorkspace purchaseOrder={{ id: 644 }} api={{}} />);

    expect(screen.getByLabelText('receipt-quantity-11')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'กำลังยืนยัน...' })).toBeDisabled();
  });
});
