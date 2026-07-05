// src/features/product/create/components/ProductCreateBasicSection.jsx

const ProductCreateBasicSection = ({
  values = {},
  dropdowns = {},
  errors = {},
  onChange,
  disabled = false,
}) => {
  const productTypes = Array.isArray(dropdowns.productTypes) ? dropdowns.productTypes : [];
  const units = Array.isArray(dropdowns.units) ? dropdowns.units : [];

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
        <h3 className="text-sm font-semibold text-slate-900">📦 ข้อมูลหลักสินค้า</h3>
        <p className="text-xs text-slate-500">โครงสร้างพื้นฐาน: ประเภทสินค้า → แบรนด์ → สินค้า</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            ชื่อสินค้า <span className="text-red-500">*</span>
          </span>
          <input
            type="text"
            value={values.name ?? ''}
            onChange={handleChange('name')}
            disabled={disabled}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
            placeholder="เช่น Canon PIXMA G2010, Kingston NV2 1TB"
          />
          {errors.name ? <p className="mt-1 text-xs text-red-600">{errors.name}</p> : null}
        </label>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              ประเภทสินค้า <span className="text-red-500">*</span>
            </span>
            <select
              value={values.productTypeId ?? ''}
              onChange={handleChange('productTypeId')}
              disabled={disabled}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
            >
              <option value="">-- เลือกประเภทสินค้า --</option>
              {productTypes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            {errors.productTypeId ? <p className="mt-1 text-xs text-red-600">{errors.productTypeId}</p> : null}
          </label>

          <div className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              แบรนด์ <span className="text-red-500">*</span>
            </span>
            <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-500">
              จัดการใน ProductCreateBrandSection
            </p>
          </div>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              หน่วยนับ <span className="text-red-500">*</span>
            </span>
            <select
              value={values.unitId ?? ''}
              onChange={handleChange('unitId')}
              disabled={disabled}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
            >
              <option value="">-- เลือกหน่วยนับ --</option>
              {units.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            {errors.unitId ? <p className="mt-1 text-xs text-red-600">{errors.unitId}</p> : null}
          </label>
        </div>
      </div>
    </section>
  );
};

export default ProductCreateBasicSection;
