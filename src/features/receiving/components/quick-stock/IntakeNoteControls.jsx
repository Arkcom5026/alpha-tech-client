import React from "react";

const IntakeNoteControls = ({
  note,
  onNoteChange,
  barcodeInputRef,
}) => (
  <div className="grid grid-cols-1 xl:grid-cols-4 gap-3">
    <div className="xl:col-span-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ</label>
      <input
        className="w-full border rounded-lg p-2"
        value={note}
        onChange={(event) => onNoteChange(event.target.value)}
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
);

export default IntakeNoteControls;
