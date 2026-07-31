import React from "react";

const ProductIdentityFields = ({
  productTypes = [],
  brands = [],
  units = [],
  productForm,
  isEditingProduct,
  onProductFieldChange,
}) => (
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
);

export default ProductIdentityFields;
