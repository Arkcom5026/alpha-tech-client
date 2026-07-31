import React from "react";
import BarcodeScannerInput from "./BarcodeScannerInput";
import SerialAutoFocusToggle from "./SerialAutoFocusToggle";

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
      <BarcodeScannerInput
        selectedProduct={selectedProduct}
        barcodeInputRef={barcodeInputRef}
        barcode={barcode}
        setBarcode={setBarcode}
        isCommitting={isCommitting}
      />
      <SerialAutoFocusToggle
        selectedProduct={selectedProduct}
        autoFocusSerial={autoFocusSerial}
        setAutoFocusSerial={setAutoFocusSerial}
        isCommitting={isCommitting}
      />
    </form>
  );
};

export default BarcodeScanner;
