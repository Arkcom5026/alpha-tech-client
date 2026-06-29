import React from "react";

const ProductEditor = ({
  productTypes = [],
  brands = [],
  units = [],
  productForm,
  priceForm,
  isEditingProduct,
  onProductFieldChange,
  onPriceFieldChange,
}) => {
  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        <div className="xl:col-span-2">
          <label className="block text-xs text-green-700 mb-1">ชื่อสินค้า</label>
          <input
            className="w-full border rounded-lg p-2 bg-white disabled:bg-green-50"
            value={productForm.name}
            disabled={!isEditingProduct}
            onChange={(event) => onProductFieldChange("name", event.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs text-green-700 mb-1">ประเภทสินค้า</label>
          <select
            className="w-full border rounded-lg p-2 bg-white disabled:bg-green-50"
            value={productForm.productTypeId}
            disabled={!isEditingProduct}
            onChange={(event) => onProductFieldChange("productTypeId", event.target.value)}
          >
            <option value="">-</option>
            {productTypes.map((type) => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-green-700 mb-1">ยี่ห้อ</label>
          <select
            className="w-full border rounded-lg p-2 bg-white disabled:bg-green-50"
            value={productForm.brandId}
            disabled={!isEditingProduct}
            onChange={(event) => onProductFieldChange("brandId", event.target.value)}
          >
            <option value="">-</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>{brand.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-green-700 mb-1">หน่วย</label>
          <select
            className="w-full border rounded-lg p-2 bg-white disabled:bg-green-50"
            value={productForm.unitId}
            disabled={!isEditingProduct}
            onChange={(event) => onProductFieldChange("unitId", event.target.value)}
          >
            <option value="">-</option>
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>{unit.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4 pt-5">
          <label className="inline-flex items-center gap-2 text-xs text-green-800">
            <input
              type="checkbox"
              checked={productForm.trackSerialNumber}
              disabled={!isEditingProduct}
              onChange={(event) => onProductFieldChange("trackSerialNumber", event.target.checked)}
            />
            Track SN
          </label>

          <label className="inline-flex items-center gap-2 text-xs text-green-800">
            <input
              type="checkbox"
              checked={productForm.active}
              disabled={!isEditingProduct}
              onChange={(event) => onProductFieldChange("active", event.target.checked)}
            />
            Active
          </label>
        </div>
      </div>

      <div className="border-t border-green-200 pt-3">
        <div className="font-semibold text-green-800 mb-2">ราคามาตรฐานของสินค้า</div>
        <div className="grid grid-cols-2 xl:grid-cols-5 gap-2">
          <div>
            <label className="block text-xs text-green-700 mb-1">ราคาทุนอ้างอิง</label>
            <input
              type="number"
              className="w-full border rounded-lg p-2 bg-white"
              value={priceForm.costPrice}
              onChange={(event) => onPriceFieldChange("costPrice", event.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-green-700 mb-1">ราคาขายปลีก *</label>
            <input
              type="number"
              className="w-full border rounded-lg p-2 bg-white"
              value={priceForm.priceRetail}
              onChange={(event) => onPriceFieldChange("priceRetail", event.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-green-700 mb-1">ราคาช่าง</label>
            <input
              type="number"
              className="w-full border rounded-lg p-2 bg-white"
              value={priceForm.priceTechnician}
              onChange={(event) => onPriceFieldChange("priceTechnician", event.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-green-700 mb-1">ราคาออนไลน์</label>
            <input
              type="number"
              className="w-full border rounded-lg p-2 bg-white"
              value={priceForm.priceOnline}
              onChange={(event) => onPriceFieldChange("priceOnline", event.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-green-700 mb-1">ราคาขายส่ง</label>
            <input
              type="number"
              className="w-full border rounded-lg p-2 bg-white"
              value={priceForm.priceWholesale}
              onChange={(event) => onPriceFieldChange("priceWholesale", event.target.value)}
            />
          </div>
        </div>
        <div className="text-xs text-green-700 mt-2">
          * ราคาขายปลีกจำเป็น เพื่อให้สินค้าพร้อมขายหลังรับเข้า
        </div>
      </div>
    </>
  );
};

export default ProductEditor;
