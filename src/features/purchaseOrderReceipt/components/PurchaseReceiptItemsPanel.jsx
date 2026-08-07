import { PurchaseReceiptItemRow } from './PurchaseReceiptItemRow';

export const PurchaseReceiptItemsPanel = ({ rows = [], onChange, onSave, isBusy = false } = {}) => {
  const list = Array.isArray(rows) ? rows : [];

  return (
    <section aria-label="รายการตรวจรับสินค้า">
      <header>
        <h2>รายการสินค้า</h2>
        <p>ทั้งหมด {list.length} รายการ</p>
      </header>

      {list.length === 0 ? (
        <p>ไม่พบรายการสินค้าสำหรับตรวจรับ</p>
      ) : (
        list.map((row) => (
          <PurchaseReceiptItemRow
            key={row.id}
            row={{ ...row, isClosed: Boolean(row.isClosed || isBusy) }}
            onChange={onChange}
            onSave={onSave}
          />
        ))
      )}
    </section>
  );
};
