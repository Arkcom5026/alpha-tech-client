// ✅ ListPrintReceiptsPage.jsx — แสดงข้อมูลใบรับสินค้าแบบ Card + สินค้าแสดงแบบคอลัมน์ (กรองจำนวน 0 ออก)

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import usePurchaseOrderReceiptStore from '@/features/purchaseOrderReceipt/store/purchaseOrderReceiptStore';

import { Button } from '@/components/ui/button';
import { assignSNToReceiptItems } from '@/utils/generateSN';


const ListPrintReceiptsPage = () => {
  const navigate = useNavigate();
  const { receipts, loadReceipts } = usePurchaseOrderReceiptStore();

  useEffect(() => {
    loadReceipts();
  }, [loadReceipts]);

  const handlePrintAll = (receipt) => {
    const snItems = assignSNToReceiptItems(receipt.items || []);
    const snList = snItems.flatMap((item) =>
      item.generatedSNs.map((sn, i) => ({ id: `${item.id}-${i}`, sn }))
    );

    navigate('/pos/purchases/barcodes/preview-barcode', {
      state: { snList },
    });
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold">รายการใบรับสินค้าที่รอพิมพ์บาร์โค้ด</h1>

      {receipts.map((r, index) => (
        <div key={r.id} className="border rounded shadow p-4 bg-white space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="font-semibold text-blue-700">ใบสั่งซื้อ: {r.purchaseOrder?.code}</div>
              <div className="text-sm text-gray-700">
                Supplier: {r.purchaseOrder?.supplier?.name || '-'}<br />
                วันที่รับ: {r.receivedAt || '-'}<br />
                จำนวนที่รับ: {r.items?.reduce((sum, i) => sum + i.quantity, 0) || 0} ชิ้น
              </div>
            </div>
            <Button size="sm" onClick={() => handlePrintAll(r)}>
              พิมพ์
            </Button>
          </div>

          <table className="w-full text-sm border-t mt-3">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-2 py-1">สินค้า</th>
                <th className="text-center px-2 py-1">จำนวน</th>
                <th className="text-center px-2 py-1">SN เริ่มต้น</th>
                <th className="text-center px-2 py-1">SN สุดท้าย</th>
              </tr>
            </thead>
            <tbody>
              {assignSNToReceiptItems(r.items || [])
                .filter((item) => item.quantity > 0)
                .map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-2 py-1 text-gray-800">{item.purchaseOrderItem?.product?.title || 'ไม่พบข้อมูลสินค้า'}</td>
                    <td className="px-2 py-1 text-center">{item.quantity}</td>
                    <td className="px-2 py-1 text-center font-mono">{item.generatedSNs?.[0] || '-'}</td>
                    <td className="px-2 py-1 text-center font-mono">{item.generatedSNs?.[item.generatedSNs.length - 1] || '-'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default ListPrintReceiptsPage;
