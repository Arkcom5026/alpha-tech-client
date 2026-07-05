// src/features/product/create/components/ProductCreateInventorySection.jsx

const ProductCreateInventorySection = ({
  values = {},
  errors = {},
  disabled = false,
  onChange,
}) => {
  const handleChange = (field) => (event) => {
    const value =
      event?.target?.type === 'checkbox'
        ? event.target.checked
        : event?.target?.value;

    onChange?.(field, value);
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-900">⚙️ Stock Behavior</h3>
        <p className="text-xs text-slate-500">กำหนดพฤติกรรมสต๊อกของสินค้า ไม่ใช่ตัวตนของสินค้า</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">โหมดสต๊อกสินค้า</span>
          <select
            value={values.mode ?? 'STRUCTURED'}
            onChange={handleChange('mode')}
            disabled={disabled}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
          >
            <option value="STRUCTURED">STRUCTURED / แยกรายชิ้น</option>
            <option value="SIMPLE">SIMPLE / นับจำนวนรวม</option>
          </select>
          {errors.mode ? <p className="mt-1 text-xs text-red-600">{errors.mode}</p> : null}
        </label>

        <div className="flex items-end gap-6">
          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={values.active !== false}
              onChange={handleChange('active')}
              disabled={disabled}
              className="h-4 w-4"
            />
            เปิดใช้งานสินค้า
          </label>

          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={values.trackSerialNumber !== false}
              onChange={handleChange('trackSerialNumber')}
              disabled={disabled || values.mode === 'SIMPLE'}
              className="h-4 w-4"
            />
            ติดตาม Serial Number
          </label>
        </div>
      </div>
    </section>
  );
};

export default ProductCreateInventorySection;
