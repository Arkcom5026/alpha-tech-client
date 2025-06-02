import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import usePurchaseOrderReceiptStore from '../store/purchaseOrderReceiptStore';
import { Button } from '@/components/ui/button';

const ViewPurchaseOrderReceiptPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentReceipt, loadReceiptById } = usePurchaseOrderReceiptStore();

  useEffect(() => {
    if (id) loadReceiptById(Number(id));
  }, [id, loadReceiptById]);

  if (!currentReceipt) return <p className="p-4">กำลังโหลดข้อมูล...</p>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">รายละเอียดใบรับสินค้า</h1>
        <Button onClick={() => navigate(`${id}/edit`)}>
          แก้ไขใบรับสินค้า
        </Button>
      </div>

      <div className="space-y-2">
        <div>
          <strong>รหัสใบรับ:</strong> {currentReceipt.id}
        </div>
        <div>
          <strong>วันที่รับ:</strong> {new Date(currentReceipt.receivedAt).toLocaleDateString()}
        </div>
        <div>
          <strong>รหัสใบสั่งซื้อ:</strong> {currentReceipt.purchaseOrderId}
        </div>
        <div>
          <strong>สถานะ:</strong> {currentReceipt.status}
        </div>
        {currentReceipt.note && (
          <div>
            <strong>หมายเหตุ:</strong> {currentReceipt.note}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewPurchaseOrderReceiptPage;
