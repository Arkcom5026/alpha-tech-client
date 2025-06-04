// ✅ InStockBarcodeTable.jsx — แสดงรายการสินค้าที่ถูกยิง SN แล้ว (พร้อมขาย)
import React from 'react';
import useBarcodeStore from '@/features/barcode/store/barcodeStore';

const InStockBarcodeTable = () => {
  const { barcodes } = useBarcodeStore();

  // ✅ กรองรายการที่ถูกยิง SN แล้ว โดยมี stockItemId
  const scannedList = barcodes.filter((b) => b.stockItemId != null);

  return (
    <div className="border rounded-md overflow-hidden">
      <table className="min-w-full text-sm">
        <thead className="bg-green-100">
          <tr>
            <th className="px-4 py-2 text-left">#</th>
            <th className="px-4 py-2 text-left">สินค้า</th>
            <th className="px-4 py-2 text-left">บาร์โค้ด</th>
            <th className="px-4 py-2 text-left">สถานะ</th>
          </tr>
        </thead>
        <tbody>
          {scannedList.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center p-4 text-gray-500">ยังไม่มีสินค้าที่ถูกยิง</td>
            </tr>
          ) : (
            scannedList.map((item, index) => (
              <tr key={item.id || item.barcode} className="border-t hover:bg-green-50">
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">{item.product?.title || '-'}</td>
                <td className="px-4 py-2 font-mono text-green-700">{item.barcode}</td>
                <td className="px-4 py-2 text-green-600">✅ พร้อมขาย</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InStockBarcodeTable;
