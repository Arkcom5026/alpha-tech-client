import React from "react";

const QueueTableHeader = () => (
  <thead className="bg-gray-50 text-gray-600">
    <tr>
      <th className="px-3 py-2 text-left w-10">#</th>
      <th className="px-3 py-2 text-left">Barcode *</th>
      <th className="px-3 py-2 text-left">Serial Number</th>
      <th className="px-3 py-2 text-left">Status</th>
      <th className="px-3 py-2 text-right">Action</th>
    </tr>
  </thead>
);

export default QueueTableHeader;
