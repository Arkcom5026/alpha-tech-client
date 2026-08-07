import React from "react";
import QueueEmptyState from "./QueueEmptyState";
import QueueTableBody from "./QueueTableBody";
import QueueTableHeader from "./QueueTableHeader";

const IntakeQueueTable = ({
  barcodeQueue = [],
  serialInputRefs,
  onSerialSubmit,
  onUpdateQueueItemField,
  onRemoveQueueItem,
}) => {
  return (
    <section className="bg-white rounded-2xl shadow-sm border overflow-hidden">
      <div className="bg-gray-100 px-4 py-3 flex justify-between items-center">
        <div>
          <div className="font-semibold text-gray-800">3. Review Queue</div>
          <div className="text-xs text-gray-500">ตรวจ Barcode / Serial ก่อน Commit</div>
        </div>
        <div className="bg-white border rounded-xl px-4 py-2 text-center">
          <div className="text-[10px] text-gray-400">SCANNED</div>
          <div className="text-2xl font-bold text-gray-900">{barcodeQueue.length}</div>
        </div>
      </div>

      {barcodeQueue.length === 0 ? (
        <QueueEmptyState />
      ) : (
        <div className="overflow-auto">
          <table className="min-w-[680px] w-full text-xs">
            <QueueTableHeader />
            <QueueTableBody
              barcodeQueue={barcodeQueue}
              serialInputRefs={serialInputRefs}
              onSerialSubmit={onSerialSubmit}
              onUpdateQueueItemField={onUpdateQueueItemField}
              onRemoveQueueItem={onRemoveQueueItem}
            />
          </table>
        </div>
      )}
    </section>
  );
};

export default IntakeQueueTable;
