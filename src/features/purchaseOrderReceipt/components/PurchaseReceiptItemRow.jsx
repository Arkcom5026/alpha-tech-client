export const PurchaseReceiptItemRow = ({ row, onChange, onSave } = {}) => {
  if (!row) return null;

  const itemId = row.id;
  const disabled = Boolean(row.isSaving || row.isSaved || row.isClosed);

  return (
    <div data-testid={`purchase-receipt-row-${itemId}`}>
      <div>
        <strong>{row.name || row.productName || `รายการ ${itemId}`}</strong>
        <span> สั่ง {row.ordered ?? 0}</span>
        <span> รับแล้ว {row.receivedBeforeInput ?? 0}</span>
        <span> คงเหลือ {row.remainingBeforeInput ?? 0}</span>
      </div>

      <label>
        จำนวนรับ
        <input
          aria-label={`receipt-quantity-${itemId}`}
          type="number"
          min="0"
          value={row.draftQuantity ?? ''}
          disabled={disabled}
          onChange={(event) => onChange?.(itemId, { quantity: event.target.value })}
        />
      </label>

      <label>
        ราคาทุน
        <input
          aria-label={`receipt-cost-${itemId}`}
          type="number"
          min="0"
          value={row.draftCostPrice ?? ''}
          disabled={disabled}
          onChange={(event) => onChange?.(itemId, { costPrice: event.target.value })}
        />
      </label>

      {row.isOverReceive ? <p role="alert">จำนวนรับเกินจำนวนที่สั่ง</p> : null}
      {row.error ? <p role="alert">{row.error}</p> : null}
      {row.isSaved ? <p>บันทึกรายการแล้ว</p> : null}

      <button
        type="button"
        disabled={disabled || !row.canSave || row.isOverReceive}
        onClick={() => onSave?.(row.sourceItem || row)}
      >
        {row.isSaving ? 'กำลังบันทึก...' : 'บันทึกรายการ'}
      </button>
    </div>
  );
};
