import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import usePurchaseOrderReceiptStore from '../store/purchaseOrderReceiptStore';
import PurchaseOrderReceiptForm from '../components/PurchaseOrderReceiptForm';

const EditPurchaseOrderReceiptPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentReceipt, loadReceiptById, updateReceipt } = usePurchaseOrderReceiptStore();

  useEffect(() => {
    if (id) loadReceiptById(Number(id));
  }, [id, loadReceiptById]);

  const handleSubmit = async (formData) => {
    try {
      await updateReceipt(Number(id), formData);
      navigate(`/pos/purchase/order/receipts/${id}`);
    } catch (error) {
      console.error('❌ [EditPage] แก้ไขใบรับของไม่สำเร็จ:', error);
    }
  };

  if (!currentReceipt) return <p className="p-4">กำลังโหลดข้อมูล...</p>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">แก้ไขใบรับสินค้า</h1>
      <PurchaseOrderReceiptForm onSubmit={handleSubmit} defaultValues={currentReceipt} />
    </div>
  );
};

export default EditPurchaseOrderReceiptPage;
