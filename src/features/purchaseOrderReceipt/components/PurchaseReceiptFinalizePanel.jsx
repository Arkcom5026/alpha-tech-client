export const PurchaseReceiptFinalizePanel = ({
  receiptId,
  allRowsConfirmed = false,
  allItemsComplete = false,
  canFinalize = false,
  isFinalizing = false,
  finalizeError = null,
  finalizedReceipt = null,
  onFinalize,
} = {}) => (
  <section aria-label="ยืนยันการตรวจรับสินค้า">
    <h2>สรุปการตรวจรับ</h2>
    <p>เลขที่ใบรับ: {receiptId || '-'}</p>
    <p>{allRowsConfirmed ? 'ยืนยันรายการครบแล้ว' : 'ยังมีรายการที่ไม่ได้ยืนยัน'}</p>
    <p>{allItemsComplete ? 'รับสินค้าครบตามใบสั่งซื้อ' : 'เป็นการรับสินค้าบางส่วน'}</p>

    {finalizeError ? <p role="alert">{finalizeError}</p> : null}
    {finalizedReceipt ? <p role="status">ยืนยันใบรับสินค้าเรียบร้อยแล้ว</p> : null}

    <button
      type="button"
      disabled={!canFinalize || isFinalizing || Boolean(finalizedReceipt)}
      onClick={() => onFinalize?.()}
    >
      {isFinalizing ? 'กำลังยืนยัน...' : 'ยืนยันการตรวจรับ'}
    </button>
  </section>
);
