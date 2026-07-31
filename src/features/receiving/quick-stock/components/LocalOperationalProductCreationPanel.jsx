const LocalOperationalProductCreationPanel = ({
  isVisible,
  isOpen,
  isBusy,
  productTypes,
  brands,
  units,
  productForm,
  priceForm,
  onOpen,
  onProductFieldChange,
  onPriceFieldChange,
  onCreate,
}) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-900">สร้างสินค้า Local ของร้าน</p>
          <p className="text-sm text-slate-600">
            ใช้เมื่อไม่มี Template หรือสินค้าในร้านที่เหมาะสม ระบบจะสร้าง Operational Product ก่อนรับเข้า
          </p>
        </div>

        {!isOpen && (
          <button type="button" className="rounded-lg border px-3 py-1.5 text-sm" onClick={onOpen}>
            เปิดฟอร์ม
          </button>
        )}
      </div>

      {isOpen && (
        <div className="space-y-3">
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="ชื่อสินค้า"
            value={productForm.name}
            onChange={(event) => onProductFieldChange("name", event.target.value)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <select
              className="rounded-lg border px-3 py-2 text-sm"
              value={productForm.productTypeId}
              onChange={(event) => onProductFieldChange("productTypeId", event.target.value)}
            >
              <option value="">เลือกประเภทสินค้า</option>
              {productTypes.map((type) => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>

            <select
              className="rounded-lg border px-3 py-2 text-sm"
              value={productForm.brandId}
              onChange={(event) => onProductFieldChange("brandId", event.target.value)}
            >
              <option value="">เลือกแบรนด์</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </select>

            <select
              className="rounded-lg border px-3 py-2 text-sm"
              value={productForm.unitId}
              onChange={(event) => onProductFieldChange("unitId", event.target.value)}
            >
              <option value="">เลือกหน่วย</option>
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>{unit.name}</option>
              ))}
            </select>

            <label className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
              <input
                type="checkbox"
                checked={productForm.trackSerialNumber}
                onChange={(event) => onProductFieldChange("trackSerialNumber", event.target.checked)}
              />
              ติดตาม Serial Number
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <input className="rounded-lg border px-3 py-2 text-sm" placeholder="ราคาทุน" value={priceForm.costPrice} onChange={(event) => onPriceFieldChange("costPrice", event.target.value)} />
            <input className="rounded-lg border px-3 py-2 text-sm" placeholder="ราคาขายปลีก" value={priceForm.priceRetail} onChange={(event) => onPriceFieldChange("priceRetail", event.target.value)} />
            <input className="rounded-lg border px-3 py-2 text-sm" placeholder="ราคาส่ง" value={priceForm.priceWholesale} onChange={(event) => onPriceFieldChange("priceWholesale", event.target.value)} />
            <input className="rounded-lg border px-3 py-2 text-sm" placeholder="ราคาช่าง" value={priceForm.priceTechnician} onChange={(event) => onPriceFieldChange("priceTechnician", event.target.value)} />
          </div>

          <button
            type="button"
            className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isBusy}
            onClick={onCreate}
          >
            {isBusy ? "กำลังสร้างสินค้า Local..." : "สร้างสินค้า Local และ Adopt เข้า QuickStock"}
          </button>
        </div>
      )}
    </div>
  );
};

export default LocalOperationalProductCreationPanel;
