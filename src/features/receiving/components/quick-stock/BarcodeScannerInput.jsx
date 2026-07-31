import React from "react";

const BarcodeScannerInput = ({
  selectedProduct,
  barcodeInputRef,
  barcode,
  setBarcode,
  isCommitting,
}) => (
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
);

export default BarcodeScannerInput;
