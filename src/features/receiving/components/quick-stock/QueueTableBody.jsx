import React from "react";
import QueueRow from "./QueueRow";

const QueueTableBody = ({
  barcodeQueue = [],
  serialInputRefs,
  onSerialSubmit,
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
        onSerialSubmit={onSerialSubmit}
        onUpdateQueueItemField={onUpdateQueueItemField}
        onRemoveQueueItem={onRemoveQueueItem}
      />
    ))}
  </tbody>
);

export default QueueTableBody;
