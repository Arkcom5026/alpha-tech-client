const QuickReceiptHeaderFields = ({
  header,
  suppliers = [],
  disabled = false,
  onHeaderChange,
}) => (
  <>
    <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
      <select
        className="rounded-lg border px-3 py-2 text-sm"
        value={header.supplierId}
        disabled={disabled}
        onChange={(event) => onHeaderChange('supplierId', event.target.value)}
      >
        <option value="">เลือก Supplier</option>
        {suppliers.map((supplier) => (
          <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
        ))}
      </select>
      <input
        className="rounded-lg border px-3 py-2 text-sm"
        placeholder="เลขที่ใบส่งของ"
        value={header.deliveryNoteNumber}
        disabled={disabled}
        onChange={(event) => onHeaderChange('deliveryNoteNumber', event.target.value)}
      />
      <input
        type="date"
        className="rounded-lg border px-3 py-2 text-sm"
        value={header.deliveryNoteDate}
        disabled={disabled}
        onChange={(event) => onHeaderChange('deliveryNoteDate', event.target.value)}
      />
    </div>

    <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
      <select
        className="rounded-lg border px-3 py-2 text-sm"
        value={header.taxDocumentMode}
        disabled={disabled}
        onChange={(event) => onHeaderChange('taxDocumentMode', event.target.value)}
      >
        <option value="NOT_RECEIVED">ยังไม่มีใบกำกับภาษี</option>
        <option value="RECEIVED">ได้รับใบกำกับภาษีพร้อมสินค้า</option>
        <option value="NON_VAT_DOCUMENT">ไม่มี VAT</option>
        <option value="NO_INPUT_TAX_CLAIM">ไม่ใช้สิทธิภาษีซื้อ</option>
      </select>
      {header.taxDocumentMode === 'RECEIVED' && (
        <>
          <input
            className="rounded-lg border px-3 py-2 text-sm"
            placeholder="เลขที่ใบกำกับภาษี"
            value={header.supplierTaxInvoiceNumber}
            disabled={disabled}
            onChange={(event) => onHeaderChange('supplierTaxInvoiceNumber', event.target.value)}
          />
          <input
            type="date"
            className="rounded-lg border px-3 py-2 text-sm"
            value={header.supplierTaxInvoiceDate}
            disabled={disabled}
            onChange={(event) => onHeaderChange('supplierTaxInvoiceDate', event.target.value)}
          />
        </>
      )}
    </div>
  </>
);

export default QuickReceiptHeaderFields;
