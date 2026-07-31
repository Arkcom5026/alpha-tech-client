import React from "react";

const ProductPriceFields = ({ priceForm, onPriceFieldChange }) => (
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
);

export default ProductPriceFields;
