// ✅ PendingBarcodeTable.jsx — รับ props.items และ fallback ไปที่ store (แนวทางเดียวกับ InStock)
import React, { useMemo } from 'react';
import useBarcodeStore from '@/features/barcode/store/barcodeStore';

const PendingBarcodeTable = ({ items }) => {
  const { barcodes } = useBarcodeStore();

  // ใช้ props.items ถ้ามี ไม่งั้น fallback ไปที่ store
  const source = Array.isArray(items) ? items : barcodes;

  // ✅ ถือว่ายังไม่ถูกยิง ถ้าไม่มี stockItem อ้างอิง
  const isScanned = (b) => b?.stockItemId != null || b?.stockItem?.id != null;

  const pendingList = useMemo(
    () => (source || []).filter((b) => !isScanned(b)),
    [source]
  );

  return (
    <div className="border rounded-md overflow-hidden">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">#</th>
            <th className="px-4 py-2 text-left">สินค้า</th>
            <th className="px-4 py-2 text-left">บาร์โค้ด</th>
          </tr>
        </thead>
        <tbody>
          {pendingList.length === 0 ? (
            <tr>
              <td colSpan={3} className="text-center p-4 text-green-600">✅ ยิงครบแล้ว</td>
            </tr>
          ) : (
            pendingList.map((item, index) => (
              <tr
                key={item.barcode + (item.serialNumber || item.stockItem?.serialNumber || '')}
                className="border-t hover:bg-blue-50"
              >
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">{item.productName ?? item.stockItem?.productName ?? '-'}</td>
                <td className="px-4 py-2 font-mono text-blue-700">{item.barcode || '-'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PendingBarcodeTable;
