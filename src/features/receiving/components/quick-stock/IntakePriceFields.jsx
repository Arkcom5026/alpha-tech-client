import React from "react";

const IntakePriceFields = ({
  defaultCost,
  onDefaultCostChange,
  priceForm = {},
  onPriceFieldChange,
}) => (
  <div className="grid grid-cols-1 xl:grid-cols-5 gap-3">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">ราคาทุนรับเข้า *</label>
      <input
        type="number"
        className="w-full border rounded-lg p-2"
        value={defaultCost}
        onChange={(event) => onDefaultCostChange(event.target.value)}
        placeholder="เช่น 120"
      />
      <p className="mt-1 text-[11px] text-gray-500">ใช้กับรอบรับเข้านี้</p>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">ราคาขายปลีก *</label>
      <input
        type="number"
        className="w-full border rounded-lg p-2"
        value={priceForm.priceRetail || ""}
        onChange={(event) => onPriceFieldChange("priceRetail", event.target.value)}
        placeholder="เช่น 250"
      />
      <p className="mt-1 text-[11px] text-gray-500">ใช้เป็นราคาหลักของสินค้าในสาขา</p>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">ราคาส่ง</label>
      <input
        type="number"
        className="w-full border rounded-lg p-2"
        value={priceForm.priceWholesale || ""}
        onChange={(event) => onPriceFieldChange("priceWholesale", event.target.value)}
        placeholder="Optional"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">ราคาช่าง</label>
      <input
        type="number"
        className="w-full border rounded-lg p-2"
        value={priceForm.priceTechnician || ""}
        onChange={(event) => onPriceFieldChange("priceTechnician", event.target.value)}
        placeholder="Optional"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">ราคาออนไลน์</label>
      <input
        type="number"
        className="w-full border rounded-lg p-2"
        value={priceForm.priceOnline || ""}
        onChange={(event) => onPriceFieldChange("priceOnline", event.target.value)}
        placeholder="Optional"
      />
    </div>
  </div>
);

export default IntakePriceFields;
