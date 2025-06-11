// refund/components/RefundHistoryTable.jsx
import React from 'react';

const RefundHistoryTable = ({ transactions }) => {
  if (!transactions || transactions.length === 0) {
    return <p className="text-gray-500">ยังไม่มีการคืนเงิน</p>;
  }

  return (
    <div className="mt-6">
      <h2 className="font-semibold mb-2">ประวัติการคืนเงิน</h2>
      <table className="w-full table-auto border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">วันที่</th>
            <th className="border px-2 py-1 text-right">จำนวน</th>
            <th className="border px-2 py-1">ช่องทาง</th>
            <th className="border px-2 py-1">หมายเหตุ</th>
            <th className="border px-2 py-1">โดย</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((rt) => (
            <tr key={rt.id}>
              <td className="border px-2 py-1">{rt.refundedAt ? new Date(rt.refundedAt).toLocaleDateString() : '-'}</td>
              <td className="border px-2 py-1 text-right">{rt.amount.toFixed(2)} ฿</td>
              <td className="border px-2 py-1">{rt.method}</td>
              <td className="border px-2 py-1">{rt.note || '-'}</td>
              <td className="border px-2 py-1">{rt.employee?.name || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RefundHistoryTable;
