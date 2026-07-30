// ReceivedSNTable.jsx — ตารางรายการที่รับแล้วจากข้อมูล API ที่ส่งผ่าน props
// Runtime authority: props.items เท่านั้น ไม่มี fallback ไปยัง StockItem compatibility store

import React, { useMemo } from 'react';

const ReceivedSNTable = ({ items = [] }) => {
  const rows = useMemo(() => (Array.isArray(items) ? items : []), [items]);

  if (!rows.length) {
    return <p className="text-sm text-gray-500">ยังไม่มีรายการรับเข้า</p>;
  }

  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-center">#</th>
            <th className="px-4 py-2 text-left">สินค้า</th>
            <th className="px-4 py-2 text-left">บาร์โค้ด</th>
            <th className="px-4 py-2 text-left">SN</th>
            <th className="px-4 py-2 text-center">สถานะ</th>
            <th className="px-4 py-2 text-center">การจัดการ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {rows.map((row, idx) => (
            <tr key={row.id ?? `${row.barcode}-${idx}`}>
              <td className="px-4 py-2 text-center">{idx + 1}</td>
              <td className="px-4 py-2">{row.productName ?? '-'}</td>
              <td className="px-4 py-2">{row.barcode}</td>
              <td className="px-4 py-2">{row.serialNumber ?? '-'}</td>
              <td className="px-4 py-2 text-center">{row.stockItemId ? 'พร้อมขาย' : '-'}</td>
              <td className="px-4 py-2 text-center">
                <span className="text-gray-400">—</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReceivedSNTable;
