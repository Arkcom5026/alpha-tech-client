import React from "react";

const BarcodeScanner = ({
  selectedProduct,
  barcodeInputRef,
  barcode,
  setBarcode,
  autoFocusSerial,
  setAutoFocusSerial,
  isCommitting,
  onBarcodeSubmit,
}) => {
  return (
    <form onSubmit={onBarcodeSubmit} className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Barcode Scanner</label>
      <input
        ref={barcodeInputRef}
        type="text"
        className="w-full border-2 border-blue-400 rounded-xl p-4 text-2xl text-center font-mono tracking-wider focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:bg-gray-100"
        placeholder={selectedProduct ? "||||| ยิงบาร์โค้ดตรงนี้ |||||" : "เลือกสินค้าก่อน"}
        value={barcode}
        disabled={!selectedProduct || isCommitting}
        onChange={(event) => setBarcode(event.target.value)}
        autoComplete="off"
      />
      <label className="inline-flex items-center gap-2 text-sm text-gray-700 select-none">
        <input
          type="checkbox"
          className="h-4 w-4"
          checked={autoFocusSerial}
          disabled={!selectedProduct || isCommitting}
          onChange={(event) => setAutoFocusSerial(event.target.checked)}
        />
        ยิง Serial Number ต่อทันทีหลังยิง Barcode
      </label>
    </form>
  );
};

export default BarcodeScanner;
