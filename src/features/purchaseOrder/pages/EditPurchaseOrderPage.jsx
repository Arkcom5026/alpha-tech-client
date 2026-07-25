import React from 'react';
import PurchaseOrderForm from '../components/PurchaseOrderForm';

const EditPurchaseOrderPage = () => {
  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">แก้ไขใบสั่งซื้อ</h2>
      <PurchaseOrderForm mode="edit" />
    </div>
  );
};

export default EditPurchaseOrderPage;
