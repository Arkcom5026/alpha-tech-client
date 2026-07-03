import React from "react";
import BarcodeScanner from "./BarcodeScanner";

const IntakeControlPanel = ({
  selectedProduct,
  barcodeInputRef,
  barcode,
  setBarcode,
  autoFocusSerial,
  setAutoFocusSerial,
  defaultCost,
  setDefaultCost,
  priceForm = {},
  onPriceFieldChange,
  note,
  setNote,
  isCommitting,
  onBarcodeSubmit,
}) => {
  const updatePrice = (field, value) => {
    if (typeof onPriceFieldChange === "function") {
      onPriceFieldChange(field, value);
    }
  };

  const handleCostChange = (value) => {
    setDefaultCost(value);
    updatePrice("costPrice", value);
  };

  return (
    <section className="bg-white rounded-2xl shadow-sm border p-5 space-y-4">
      <div className="border-b pb-3">
        <h2 className="font-semibold text-gray-800">2. รับสินค้าเข้า</h2>
        <p className="text-xs text-gray-500">
          ราคาด้านล่างคือราคาที่ใช้กับสินค้าในสาขา และเป็นเงื่อนไขก่อนบันทึกรับเข้า
        </p>
      </div>

      <div className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
        <div className="font-semibold">Price lifecycle</div>
        <div className="mt-0.5">สร้างหรือเลือกสินค้าในร้านก่อน จากนั้นตรวจราคาทุนและราคาขายปลีกชุดนี้ก่อนบันทึกรับเข้า</div>
      </div>

      <BarcodeScanner
        selectedProduct={selectedProduct}
        barcodeInputRef={barcodeInputRef}
        barcode={barcode}
        setBarcode={setBarcode}
        autoFocusSerial={autoFocusSerial}
        setAutoFocusSerial={setAutoFocusSerial}
        isCommitting={isCommitting}
        onBarcodeSubmit={onBarcodeSubmit}
      />

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ราคาทุนรับเข้า *</label>
          <input
            type="number"
            className="w-full border rounded-lg p-2"
            value={defaultCost}
            onChange={(event) => handleCostChange(event.target.value)}
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
            onChange={(event) => updatePrice("priceRetail", event.target.value)}
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
            onChange={(event) => updatePrice("priceWholesale", event.target.value)}
            placeholder="Optional"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ราคาช่าง</label>
          <input
            type="number"
            className="w-full border rounded-lg p-2"
            value={priceForm.priceTechnician || ""}
            onChange={(event) => updatePrice("priceTechnician", event.target.value)}
            placeholder="Optional"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ราคาออนไลน์</label>
          <input
            type="number"
            className="w-full border rounded-lg p-2"
            value={priceForm.priceOnline || ""}
            onChange={(event) => updatePrice("priceOnline", event.target.value)}
            placeholder="Optional"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-3">
        <div className="xl:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ</label>
          <input
            className="w-full border rounded-lg p-2"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Optional"
          />
        </div>

        <div className="flex items-end">
          <button
            type="button"
            className="w-full border rounded-lg p-2 hover:bg-gray-50"
            onClick={() => barcodeInputRef.current?.focus()}
          >
            Focus Scanner
          </button>
        </div>
      </div>
    </section>
  );
};

export default IntakeControlPanel;
