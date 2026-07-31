import React from "react";

const SerialAutoFocusToggle = ({
  selectedProduct,
  autoFocusSerial,
  setAutoFocusSerial,
  isCommitting,
}) => (
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
);

export default SerialAutoFocusToggle;
