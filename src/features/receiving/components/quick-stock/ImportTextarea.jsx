import React from "react";

const ImportTextarea = ({
  selectedProduct,
  importTextRef,
  onImportText,
}) => {
  return (
    <div className="border rounded-xl p-3 bg-gray-50">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="font-semibold text-gray-800">Import Barcode หลายรายการ</div>
          <div className="text-xs text-gray-500">รูปแบบ: barcode หรือ barcode,serialNumber,cost</div>
        </div>
        <button
          type="button"
          className="px-3 py-2 rounded-lg bg-gray-900 text-white text-sm disabled:opacity-50"
          disabled={!selectedProduct}
          onClick={onImportText}
        >
          Import
        </button>
      </div>
      <textarea
        ref={importTextRef}
        className="w-full border rounded-lg p-2 font-mono text-sm"
        rows={4}
        placeholder={"885xxxx001\n885xxxx002,SN123456,120\n885xxxx003"}
        disabled={!selectedProduct}
      />
    </div>
  );
};

export default ImportTextarea;
