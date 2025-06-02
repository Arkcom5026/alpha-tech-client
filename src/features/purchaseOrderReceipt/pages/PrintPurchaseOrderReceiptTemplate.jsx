import React from 'react';

const PrintPurchaseOrderReceiptTemplate = ({ receipt, items }) => {
  if (!receipt) return null;

  return (
    <div className="p-8 text-sm font-sans text-black">
      <h1 className="text-xl font-bold mb-4">ใบตรวจรับสินค้า</h1>

      <div className="mb-4">
        <div><strong>รหัสใบรับ:</strong> {receipt.id}</div>
        <div><strong>วันที่รับ:</strong> {new Date(receipt.receivedAt).toLocaleDateString()}</div>
        <div><strong>รหัสใบสั่งซื้อ:</strong> {receipt.purchaseOrderId}</div>
        <div><strong>สถานะ:</strong> {receipt.status}</div>
        {receipt.note && <div><strong>หมายเหตุ:</strong> {receipt.note}</div>}
      </div>

      <table className="w-full border text-sm">
        <thead className="bg-gray-200">
          <tr>
            <th className="border px-2 py-1 text-left">#</th>
            <th className="border px-2 py-1 text-left">ชื่อสินค้า</th>
            <th className="border px-2 py-1 text-right">จำนวน</th>
            <th className="border px-2 py-1 text-right">ราคาต่อหน่วย</th>
            <th className="border px-2 py-1 text-right">รวม</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={item.id}>
              <td className="border px-2 py-1">{idx + 1}</td>
              <td className="border px-2 py-1">{item.productName}</td>
              <td className="border px-2 py-1 text-right">{item.quantity}</td>
              <td className="border px-2 py-1 text-right">{item.costPrice.toFixed(2)}</td>
              <td className="border px-2 py-1 text-right">{(item.quantity * item.costPrice).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 text-right font-semibold">
        รวมทั้งหมด: {items.reduce((sum, item) => sum + item.quantity * item.costPrice, 0).toFixed(2)} บาท
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 text-center text-sm">
        <div>
          ............................................<br />
          ผู้ส่งของ
        </div>
        <div>
          ............................................<br />
          ผู้ตรวจรับ
        </div>
      </div>
    </div>
  );
};

export default PrintPurchaseOrderReceiptTemplate;
// 