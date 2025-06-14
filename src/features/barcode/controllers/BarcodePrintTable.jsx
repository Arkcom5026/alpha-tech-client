// src/features/stockItem/components/BarcodePrintTable.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useBarcodeStore from '@/features/barcode/store/barcodeStore';

const BarcodePrintTable = ({ receipts }) => {
  const navigate = useNavigate();
  const { generateBarcodesAction } = useBarcodeStore();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedIds, setSelectedIds] = useState([]);

  const filteredReceipts = receipts.filter((receipt) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'PENDING') return receipt.printed === false;
    if (statusFilter === 'COMPLETE') return receipt.printed === true;
    return true;
  });

  const isAllSelected = filteredReceipts.length > 0 && filteredReceipts.every(r => selectedIds.includes(r.id));

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredReceipts.map((r) => r.id));
    }
  };

  const handlePrintClick = async (receiptId) => {
    await generateBarcodesAction(receiptId);
    navigate(`/pos/purchases/barcodes/preview/${receiptId}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label className="font-medium">กรองสถานะบาร์โค้ด:</label>
        <label><input type="radio" name="status" value="ALL" checked={statusFilter === 'ALL'} onChange={(e) => setStatusFilter(e.target.value)} /> ทั้งหมด</label>
        <label><input type="radio" name="status" value="PENDING" checked={statusFilter === 'PENDING'} onChange={(e) => setStatusFilter(e.target.value)} /> ยังไม่ได้พิมพ์</label>
        <label><input type="radio" name="status" value="COMPLETED" checked={statusFilter === 'COMPLETED'} onChange={(e) => setStatusFilter(e.target.value)} /> พิมพ์แล้ว</label>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1 text-center">
                <input type="checkbox" onChange={toggleSelectAll} checked={isAllSelected} />
              </th>
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
            {filteredReceipts.map((receipt, index) => (
              <tr key={receipt.id} className="hover:bg-gray-50">
                <td className="border px-2 py-1 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(receipt.id)}
                    onChange={() => toggleSelect(receipt.id)}
                  />
                </td>
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
                  {receipt.status === 'COMPLETED' ? 'พิมพ์แล้ว' : 'ยังไม่ได้พิมพ์'}


                </td>
                <td className="border px-2 py-1 text-center">
                  <button
                    onClick={() => handlePrintClick(receipt.id)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    พิมพ์
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedIds.length > 0 && (
        <div className="mt-4">
          <button
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            onClick={() => navigate(`/pos/purchases/barcodes/print?ids=${selectedIds.join(',')}`)}
          >
            พิมพ์รายการที่เลือก ({selectedIds.length})
          </button>
        </div>
      )}
    </div>
  );
};

export default BarcodePrintTable;
