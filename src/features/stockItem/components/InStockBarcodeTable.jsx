// ✅ InStockBarcodeTable.jsx — แสดงรายการสินค้าที่ถูกยิง SN แล้ว (พร้อมขาย)
import React from 'react';
import useBarcodeStore from '@/features/barcode/store/barcodeStore';

const InStockBarcodeTable = () => {
  const { barcodes, updateSerialNumberAction, deleteSerialNumberAction, loadBarcodesAction } = useBarcodeStore();

  const scannedList = barcodes.filter((b) => b.stockItemId != null);

  const handleDeleteSN = async (barcode) => {
    if (!window.confirm(`คุณต้องการลบ SN ของบาร์โค้ด ${barcode} ใช่หรือไม่?`)) return;
    await deleteSerialNumberAction(barcode);

    // ✅ รีโหลดรายการ barcodes ทันทีหลังลบ SN
    const item = barcodes.find((b) => b.barcode === barcode);
    const receiptId = item?.receiptItem?.receiptId || item?.stockItem?.purchaseOrderReceiptItem?.receiptId;
    if (receiptId) loadBarcodesAction(receiptId);
  };

  const handleAddSN = async (barcode) => {
    const newSN = prompt(`กรุณากรอก SN สำหรับบาร์โค้ด ${barcode}`);
    if (newSN) {
      await updateSerialNumberAction(barcode, newSN);

      // ✅ รีโหลดรายการ barcodes ทันทีหลังเพิ่ม SN
      const item = barcodes.find((b) => b.barcode === barcode);
      const receiptId = item?.receiptItem?.receiptId || item?.stockItem?.purchaseOrderReceiptItem?.receiptId;
      if (receiptId) loadBarcodesAction(receiptId);
    }
  };

  return (
    <div className="border rounded-md overflow-hidden">
      <table className="min-w-full text-sm">
        <thead className="bg-green-100">
          <tr>
            <th className="px-4 py-2 text-left">#</th>
            <th className="px-4 py-2 text-left">สินค้า</th>
            <th className="px-4 py-2 text-left">บาร์โค้ด</th>
            <th className="px-4 py-2 text-left">SN</th>
            <th className="px-4 py-2 text-left">สถานะ</th>
            <th className="px-4 py-2 text-left">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {scannedList.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center p-4 text-gray-500">ยังไม่มีสินค้าที่ถูกยิง</td>
            </tr>
          ) : (
            scannedList.map((item, index) => (
              <tr key={item.barcode + (item.serialNumber || '')} className="border-t hover:bg-green-50">
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">{item.product?.title || '-'}</td>
                <td className="px-4 py-2 font-mono text-green-700">{item.barcode || item.stockItem?.barcode || '-'}</td>
                <td className="px-4 py-2 font-mono text-gray-700">{item.serialNumber || '-'}</td>
                <td className="px-4 py-2 text-green-600">✅ พร้อมขาย</td>
                <td className="px-4 py-2 space-x-2">
                  <button
                    onClick={() => handleDeleteSN(item.barcode)}
                    className="text-red-600 underline hover:text-red-800"
                  >ลบ SN</button>
                  <button
                    onClick={() => handleAddSN(item.barcode)}
                    className="text-blue-600 underline hover:text-blue-800"
                  >เพิ่ม SN</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InStockBarcodeTable;
