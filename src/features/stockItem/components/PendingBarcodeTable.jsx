// ✅ PendingBarcodeTable.jsx — แสดงรายการบาร์โค้ดที่ยังไม่ได้ยิง SN
import React from 'react';
import useBarcodeStore from '@/features/barcode/store/barcodeStore';

const PendingBarcodeTable = ({ loading }) => {
  const { barcodes } = useBarcodeStore();

  // ✅ กรองรายการที่ยังไม่ถูกยิง SN โดยใช้ stockItemId
  const pendingList = barcodes.filter((b) => b.stockItemId == null);
  return (
    <div className="border rounded-md overflow-hidden">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">#</th>
            <th className="px-4 py-2 text-left">สินค้า</th>
            <th className="px-4 py-2 text-left">บาร์โค้ด</th>
            <th className="px-4 py-2 text-left">สถานะ</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="4" className="text-center p-4">กำลังโหลด...</td>
            </tr>
          ) : pendingList.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center p-4 text-green-600">✅ ยิงครบแล้ว</td>
            </tr>
          ) : (
            pendingList.map((item, index) => (
              <tr key={item.id} className="border-t hover:bg-blue-50">
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">{item.product?.title || '-'}</td>
                <td className="px-4 py-2 font-mono text-blue-700">{item.barcode}</td>
                <td className="px-4 py-2 text-yellow-600">🟡 ยังไม่ยิง</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PendingBarcodeTable;
