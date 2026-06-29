import React from "react";
import QueueRow from "./QueueRow";

const IntakeQueueTable = ({
  barcodeQueue = [],
  serialInputRefs,
  barcodeInputRef,
  onUpdateQueueItemField,
  onRemoveQueueItem,
  toMoneyNumber,
}) => {
  return (
    <section className="bg-white rounded-2xl shadow-sm border overflow-hidden">
      <div className="bg-gray-100 px-4 py-3 flex justify-between items-center">
        <div>
          <div className="font-semibold text-gray-800">3. Review Queue</div>
          <div className="text-xs text-gray-500">Barcode และราคาทุนต้องครบทุกแถวก่อน Commit</div>
        </div>
        <div className="bg-white border rounded-xl px-4 py-2 text-center">
          <div className="text-[10px] text-gray-400">SCANNED</div>
          <div className="text-2xl font-bold text-gray-900">{barcodeQueue.length}</div>
        </div>
      </div>

      {barcodeQueue.length === 0 ? (
        <div className="p-8 text-center text-gray-400 text-sm">ยังไม่มีบาร์โค้ดใน Queue</div>
      ) : (
        <div className="overflow-auto">
          <table className="min-w-[760px] w-full text-xs">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-3 py-2 text-left w-10">#</th>
                <th className="px-3 py-2 text-left">Barcode *</th>
                <th className="px-3 py-2 text-left">Serial Number</th>
                <th className="px-3 py-2 text-left">ราคาทุน *</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {barcodeQueue.map((item, index) => (
                <QueueRow
                  key={item.id}
                  item={item}
                  index={index}
                  serialInputRefs={serialInputRefs}
                  barcodeInputRef={barcodeInputRef}
                  onUpdateQueueItemField={onUpdateQueueItemField}
                  onRemoveQueueItem={onRemoveQueueItem}
                  toMoneyNumber={toMoneyNumber}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default IntakeQueueTable;
