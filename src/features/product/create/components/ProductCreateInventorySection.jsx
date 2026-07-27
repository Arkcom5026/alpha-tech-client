// src/features/product/create/components/ProductCreateInventorySection.jsx
const ProductCreateInventorySection = ({ values = {}, errors = {}, disabled = false, onChange }) => {
  const isSimple = values.mode === 'SIMPLE';
  const change = (field) => (event) => onChange?.(field, event?.target?.type === 'checkbox' ? event.target.checked : event.target.value);
  const changeMode = (event) => {
    const mode = event.target.value;
    onChange?.('mode', mode);
    onChange?.('noSN', mode === 'SIMPLE');
    onChange?.('trackSerialNumber', mode === 'STRUCTURED');
    if (mode === 'STRUCTURED') {
      onChange?.('inventoryBehavior', 'TRACKED');
      onChange?.('saleBarcode', '');
    }
  };
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-900">⚙️ พฤติกรรมสินค้าและสต๊อก</h3>
        <p className="text-xs text-slate-500">SIMPLE รองรับทั้งสินค้านับจำนวนและรายการที่ไม่ตัดสต๊อก</p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">โหมดสินค้า</span>
          <select value={values.mode ?? 'STRUCTURED'} onChange={changeMode} disabled={disabled} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100">
            <option value="STRUCTURED">STRUCTURED / แยกรายชิ้น</option>
            <option value="SIMPLE">SIMPLE / นับจำนวนหรือค่าบริการ</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">การจัดการสต๊อก</span>
          <select value={isSimple ? (values.inventoryBehavior || 'TRACKED') : 'TRACKED'} onChange={change('inventoryBehavior')} disabled={disabled || !isSimple} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100">
            <option value="TRACKED">TRACKED / ตัดสต๊อก</option>
            <option value="NON_STOCK">NON_STOCK / ไม่ตัดสต๊อก</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">บาร์โค้ดขายซ้ำ</span>
          <input value={values.saleBarcode || ''} onChange={change('saleBarcode')} disabled={disabled || !isSimple} placeholder="เช่น SERVICE-001" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100" />
          {errors.saleBarcode ? <p className="mt-1 text-xs text-red-600">{errors.saleBarcode}</p> : null}
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={values.active !== false} onChange={change('active')} disabled={disabled} className="h-4 w-4" /> เปิดใช้งานสินค้า
        </label>
      </div>
    </section>
  );
};
export default ProductCreateInventorySection;
