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
  movementType,
  setMovementType,
  note,
  setNote,
  isCommitting,
  onBarcodeSubmit,
  onApplyDefaultCostToQueue,
}) => {
  return (
    <section className="bg-white rounded-2xl shadow-sm border p-5 space-y-4">
      <div className="border-b pb-3">
        <h2 className="font-semibold text-gray-800">2. รับสินค้าเข้า</h2>
        <p className="text-xs text-gray-500">
          ยิง Barcode / Serial และกำหนดราคาทุนจริงของสินค้าชิ้นนั้น
        </p>
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

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ราคาทุนรับเข้า *</label>
          <input
            type="number"
            className="w-full border rounded-lg p-2"
            value={defaultCost}
            onChange={(event) => setDefaultCost(event.target.value)}
            placeholder="เช่น 120"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ประเภทการรับเข้า</label>
          <select
            className="w-full border rounded-lg p-2 bg-white"
            value={movementType}
            onChange={(event) => setMovementType(event.target.value)}
          >
            <option value="RECOVERY_RECEIVE">RECOVERY_RECEIVE</option>
            <option value="QUICK_RECEIVE">QUICK_RECEIVE</option>
            <option value="RECEIVE">RECEIVE</option>
            <option value="MANUFACTURE">MANUFACTURE</option>
          </select>
        </div>

        <div className="xl:col-span-2 flex items-end gap-2">
          <button
            type="button"
            className="flex-1 border rounded-lg p-2 hover:bg-gray-50"
            onClick={() => barcodeInputRef.current?.focus()}
          >
            Focus Scanner
          </button>
          <button
            type="button"
            className="flex-1 border rounded-lg p-2 hover:bg-gray-50"
            onClick={onApplyDefaultCostToQueue}
          >
            ใช้ทุนนี้กับ Queue
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ</label>
        <input
          className="w-full border rounded-lg p-2"
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </div>


    </section>
  );
};

export default IntakeControlPanel;
