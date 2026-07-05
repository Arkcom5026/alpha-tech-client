// src/features/product/create/components/ProductCreatePriceSection.jsx

const priceFields = [
  ['costPrice', 'ราคาทุนอ้างอิง'],
  ['priceRetail', 'ราคาขายปลีก'],
  ['priceTechnician', 'ราคาช่าง'],
  ['priceOnline', 'ราคาออนไลน์'],
  ['priceWholesale', 'ราคาขายส่ง'],
];

const ProductCreatePriceSection = ({
  values = {},
  errors = {},
  disabled = false,
  onChange,
}) => {
  const branchPrice = values.branchPrice || {};

  const handlePriceChange = (field) => (event) => {
    onChange?.('branchPrice', {
      ...branchPrice,
      [field]: event.target.value,
    });
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-900">💰 ราคามาตรฐาน</h3>
        <p className="text-xs text-slate-500">
          ใช้เป็นราคาเริ่มต้นของสินค้า ส่วนต้นทุนจริงควรยืนยันตอนรับสินค้าเข้า
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        {priceFields.map(([field, label]) => (
          <label key={field} className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              {label}
              {field === 'priceRetail' ? <span className="text-red-500"> *</span> : null}
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={branchPrice[field] ?? ''}
              onChange={handlePriceChange(field)}
              disabled={disabled}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-right text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
              placeholder="0.00"
            />
            {errors?.branchPrice?.[field] ? (
              <p className="mt-1 text-xs text-red-600">{errors.branchPrice[field]}</p>
            ) : null}
          </label>
        ))}
      </div>
    </section>
  );
};

export default ProductCreatePriceSection;
