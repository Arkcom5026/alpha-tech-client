import React from "react";
import QueueRow from "./QueueRow";

const QueueTableBody = ({
  barcodeQueue = [],
  serialInputRefs,
  barcodeInputRef,
  onUpdateQueueItemField,
  onRemoveQueueItem,
}) => (
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
      />
    ))}
  </tbody>
);

export default QueueTableBody;
