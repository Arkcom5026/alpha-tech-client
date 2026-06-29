import React from "react";

const QueueRow = ({
  item,
  index,
  serialInputRefs,
  barcodeInputRef,
  onUpdateQueueItemField,
  onRemoveQueueItem,
  toMoneyNumber,
}) => {
  const rowReady =
    String(item.barcode || "").trim() &&
    toMoneyNumber(item.costPrice) > 0;

  return (
    <tr className={rowReady ? "bg-white" : "bg-red-50"}>
      <td className="px-3 py-2 text-gray-400">{index + 1}</td>
      <td className="px-3 py-2">
        <input
          className="w-full border rounded p-2 font-mono"
          value={item.barcode}
          onChange={(event) => onUpdateQueueItemField(item.id, "barcode", event.target.value)}
        />
      </td>
      <td className="px-3 py-2">
        <input
          ref={(el) => {
            if (el) serialInputRefs.current[item.id] = el;
            else delete serialInputRefs.current[item.id];
          }}
          className="w-full border rounded p-2 font-mono"
          value={item.serialNumber}
          onChange={(event) => onUpdateQueueItemField(item.id, "serialNumber", event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              barcodeInputRef.current?.focus();
            }
          }}
          placeholder="Optional"
          autoComplete="off"
        />
      </td>
      <td className="px-3 py-2">
        <input
          type="number"
          className="w-32 border rounded p-2"
          value={item.costPrice}
          onChange={(event) => onUpdateQueueItemField(item.id, "costPrice", event.target.value)}
        />
      </td>
      <td className="px-3 py-2">
        <span className={`px-2 py-1 rounded-full text-[11px] ${
          rowReady
            ? "bg-green-50 text-green-700 border border-green-200"
            : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {rowReady ? "Ready" : "Need Cost"}
        </span>
      </td>
      <td className="px-3 py-2 text-right">
        <button
          type="button"
          className="text-red-500 hover:text-red-700"
          onClick={() => onRemoveQueueItem(item.id)}
        >
          ลบ
        </button>
      </td>
    </tr>
  );
};

export default QueueRow;
