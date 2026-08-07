import { PurchaseReceiptFinalizePanel } from './PurchaseReceiptFinalizePanel';
import { PurchaseReceiptItemsPanel } from './PurchaseReceiptItemsPanel';
import { usePurchaseReceiptPage } from '../hooks/usePurchaseReceiptPage';

export const PurchaseReceiptWorkspace = ({
  purchaseOrder,
  receiptHeader,
  api,
  title = 'ตรวจรับสินค้าตามใบสั่งซื้อ',
} = {}) => {
  const workflow = usePurchaseReceiptPage({ purchaseOrder, receiptHeader, api });
  const { viewModel, actions, finalize } = workflow;

  if (!purchaseOrder) {
    return <p role="alert">ไม่พบข้อมูลใบสั่งซื้อสำหรับตรวจรับ</p>;
  }

  return (
    <main aria-label="พื้นที่ตรวจรับสินค้าตามใบสั่งซื้อ">
      <header>
        <h1>{title}</h1>
        <p>ใบสั่งซื้อ: {purchaseOrder.documentNumber || purchaseOrder.poNumber || purchaseOrder.id}</p>
        {viewModel.receiptId ? <p>กำลังดำเนินการใบรับเลขที่ {viewModel.receiptId}</p> : null}
      </header>

      {viewModel.resumeError ? <p role="alert">{viewModel.resumeError}</p> : null}

      <PurchaseReceiptItemsPanel
        rows={viewModel.rows}
        isBusy={viewModel.isBusy}
        onChange={actions.updateRow}
        onSave={actions.saveRow}
      />

      <PurchaseReceiptFinalizePanel
        receiptId={viewModel.receiptId}
        allRowsConfirmed={viewModel.allRowsConfirmed}
        allItemsComplete={viewModel.allItemsComplete}
        canFinalize={viewModel.canFinalize}
        isFinalizing={finalize.isFinalizing}
        finalizeError={viewModel.finalizeError}
        finalizedReceipt={finalize.finalizedReceipt}
        onFinalize={actions.finalize}
      />
    </main>
  );
};
