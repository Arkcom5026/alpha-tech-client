// src/features/stockItem/components/BarcodePrintTable.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BarcodePrintTable = ({ receipts }) => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredReceipts = receipts.filter((receipt) => {
    const isComplete = receipt.barcodeGenerated >= receipt.totalItems;
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'PENDING') return receipt.barcodeGenerated === 0;
    if (statusFilter === 'PARTIAL') return receipt.barcodeGenerated > 0 && !isComplete;
    if (statusFilter === 'COMPLETE') return isComplete;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label className="font-medium">กรองสถานะบาร์โค้ด:</label>
        <label><input type="radio" name="status" value="ALL" checked={statusFilter === 'ALL'} onChange={(e) => setStatusFilter(e.target.value)} /> ทั้งหมด</label>
        <label><input type="radio" name="status" value="PENDING" checked={statusFilter === 'PENDING'} onChange={(e) => setStatusFilter(e.target.value)} /> ยังไม่ได้พิมพ์</label>
        <label><input type="radio" name="status" value="PARTIAL" checked={statusFilter === 'PARTIAL'} onChange={(e) => setStatusFilter(e.target.value)} /> พิมพ์บางส่วน</label>
        <label><input type="radio" name="status" value="COMPLETE" checked={statusFilter === 'COMPLETE'} onChange={(e) => setStatusFilter(e.target.value)} /> พิมพ์ครบแล้ว</label>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1 text-center">ลำดับ</th>
              <th className="border px-2 py-1">เลขใบสั่งซื้อ</th>
              <th className="border px-2 py-1">Supplier</th>
              <th className="border px-2 py-1">วันที่รับ</th>
              <th className="border px-2 py-1 text-center">จำนวนที่รับ</th>
              <th className="border px-2 py-1 text-center">ยิง SN แล้ว</th>
              <th className="border px-2 py-1 text-center">สถานะ</th>
              <th className="border px-2 py-1 text-center">การพิมพ์</th>
            </tr>
          </thead>
          <tbody>
            {filteredReceipts.map((receipt, index) => {
              const isComplete = receipt.barcodeGenerated >= receipt.totalItems;
              return (
                <tr key={receipt.id} className="hover:bg-gray-50">
                  <td className="border px-2 py-1 text-center">{index + 1}</td>
                  <td className="border px-2 py-1">{receipt.orderCode}</td>
                  <td className="border px-2 py-1">{receipt.supplierName}</td>
                  <td className="border px-2 py-1">
                    {receipt.receivedAt && !isNaN(new Date(receipt.receivedAt))
                      ? new Date(receipt.receivedAt).toLocaleDateString()
                      : '-'}
                  </td>
                  <td className="border px-2 py-1 text-center">{receipt.totalItems}</td>
                  <td className="border px-2 py-1 text-center">{receipt.barcodeGenerated}</td>
                  <td className="border px-2 py-1 text-center">
                    {isComplete ? 'พิมพ์ครบแล้ว' : (receipt.barcodeGenerated > 0 ? 'พิมพ์บางส่วน' : 'ยังไม่ได้พิมพ์')}
                  </td>
                  <td className="border px-2 py-1 text-center">
                    <button
                       onClick={() => navigate(`/pos/purchases/barcodes/items/${receipt.id}`)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      พิมพ์
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BarcodePrintTable;
