import React from "react";
import BarcodeScanner from "./BarcodeScanner";
import IntakePriceFields from "./IntakePriceFields";
import IntakeNoteControls from "./IntakeNoteControls";

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

      <IntakePriceFields
        defaultCost={defaultCost}
        onDefaultCostChange={handleCostChange}
        priceForm={priceForm}
        onPriceFieldChange={updatePrice}
      />

      <IntakeNoteControls
        note={note}
        onNoteChange={setNote}
        barcodeInputRef={barcodeInputRef}
      />
    </section>
  );
};

export default IntakeControlPanel;
