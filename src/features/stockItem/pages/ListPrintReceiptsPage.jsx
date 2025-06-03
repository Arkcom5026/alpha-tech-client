// ✅ ListPrintReceiptsPage.jsx — แสดงข้อมูลใบรับสินค้าแบบ Card + สินค้าแสดงแบบคอลัมน์ (กรองจำนวน 0 ออก)

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import usePurchaseOrderReceiptStore from '@/features/purchaseOrderReceipt/store/purchaseOrderReceiptStore';

import { Button } from '@/components/ui/button';
import { assignSNToReceiptItems } from '@/utils/generateSN';

const ListPrintReceiptsPage = () => {
  const navigate = useNavigate();
  const { receiptId } = useParams();
  const { loadReceiptById } = usePurchaseOrderReceiptStore();
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentReceipt, setCurrentReceipt] = useState(null);
  const hasLoaded = useRef(false); // ✅ กันการโหลดซ้ำจาก StrictMode

  useEffect(() => {
    console.log('ListPrintReceiptsPage mounted with receiptId:  >> >> >> >>', receiptId);
    if (receiptId && !hasLoaded.current) {
      console.log('📥 Loading receipt with ID:', receiptId);
      const fetchData = async () => {
        const receipt = await loadReceiptById(receiptId);
        console.log('📦 Loaded receipt data:', receipt);
        const filtered = assignSNToReceiptItems(receipt.items || []);
        console.log('🧾 SN items after assignment:', filtered);
        setCurrentReceipt(receipt);
      };
      fetchData();
      hasLoaded.current = true;
    }
  }, [receiptId, loadReceiptById]);

  const handleToggleSelect = (receiptId) => {
    setSelectedIds((prev) =>
      prev.includes(receiptId) ? prev.filter((i) => i !== receiptId) : [...prev, receiptId]
    );
  };

  const handlePrintAll = (receipt) => {
    navigate(`/pos/purchases/barcodes/preview-barcode/${receipt.id}`);
  };

  const handlePrintSelected = () => {
    // ✅ เปลี่ยนจากส่ง state → เป็นการ navigate ด้วย receiptId
    if (selectedIds.length === 1) {
      navigate(`/pos/purchases/barcodes/preview-barcode/${selectedIds[0]}`);
    } else {
      alert('กรุณาเลือกเพียง 1 รายการเพื่อพิมพ์แบบเดี่ยว');
    }
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold">รายการใบรับสินค้าที่รอพิมพ์บาร์โค้ด</h1>

      {currentReceipt && (
        <div key={currentReceipt.id} className="border rounded shadow p-4 bg-white space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex gap-2 items-start">
              <input
                type="checkbox"
                className="mt-1"
                checked={selectedIds.includes(currentReceipt.id)}
                onChange={() => handleToggleSelect(currentReceipt.id)}
              />
              <div className="space-y-1">
                <div className="font-semibold text-blue-700">
                  ใบสั่งซื้อ: {currentReceipt.purchaseOrder?.code}
                </div>
                <div className="text-sm text-gray-700">
                  Supplier: {currentReceipt.purchaseOrder?.supplier?.name || '-'}<br />
                  วันที่รับ: {currentReceipt.receivedAt || '-'}<br />
                  จำนวนที่รับ: {currentReceipt.items?.reduce((sum, i) => sum + i.quantity, 0) || 0} ชิ้น
                </div>
              </div>
            </div>
            <Button size="sm" onClick={() => handlePrintAll(currentReceipt)}>
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
              {assignSNToReceiptItems(currentReceipt.items || [])
                .filter((item) => item.quantity > 0)
                .map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-2 py-1 text-gray-800">
                      {item.purchaseOrderItem?.product?.title || 'ไม่พบข้อมูลสินค้า'}
                    </td>
                    <td className="px-2 py-1 text-center">{item.quantity}</td>
                    <td className="px-2 py-1 text-center font-mono">{item.generatedSNs?.[0] || '-'}</td>
                    <td className="px-2 py-1 text-center font-mono">{item.generatedSNs?.[item.generatedSNs.length - 1] || '-'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedIds.length > 0 && (
        <div className="pt-4">
          <Button onClick={handlePrintSelected} className="bg-green-700 hover:bg-green-800">
            พิมพ์รายการที่เลือก ({selectedIds.length})
          </Button>
        </div>
      )}
    </div>
  );
};

export default ListPrintReceiptsPage;
