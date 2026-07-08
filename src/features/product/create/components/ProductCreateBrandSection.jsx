// src/features/product/create/components/ProductCreateBrandSection.jsx

const ProductCreateBrandSection = ({
  values = {},
  brands = [],
  errors = {},
  loading = false,
  disabled = false,
  onChange,
  onRefreshBrands,
}) => {
  const handleChange = (event) => {
    onChange?.('brandId', event.target.value);
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">🏷️ แบรนด์สินค้า</h3>
          <p className="text-xs text-slate-500">
            แบรนด์ถูกกรองจาก Mapping ของร้านตามประเภทสินค้าที่เลือก
          </p>
        </div>

        {onRefreshBrands ? (
          <button
            type="button"
            onClick={onRefreshBrands}
            disabled={disabled || loading}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'กำลังโหลด...' : 'รีเฟรช'}
          </button>
        ) : null}
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">
          แบรนด์ <span className="text-red-500">*</span>
        </span>
        <select
          value={values.brandId ?? ''}
          onChange={handleChange}
          disabled={disabled || loading || !values.productTypeId}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
        >
          <option value="">
            {!values.productTypeId
              ? '-- กรุณาเลือกประเภทสินค้าก่อน --'
              : loading
                ? '-- กำลังโหลดแบรนด์ --'
                : '-- เลือกแบรนด์ --'}
          </option>
          {brands.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>

        {errors.brandId ? (
          <p className="mt-1 text-xs text-red-600">{errors.brandId}</p>
        ) : (
          <p className="mt-1 text-xs text-slate-500">
            ถ้าไม่พบแบรนด์ ให้เพิ่ม/ตรวจ Mapping แบรนด์ของร้านก่อนบันทึกสินค้า
          </p>
        )}
      </label>
    </section>
  );
};

export default ProductCreateBrandSection;
