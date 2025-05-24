import PurchaseOrderForm from '@/features/pos/components/PurchaseOrderForm';
import React from 'react';

const PurchaseOrder = () => {
  const suppliers = []; // ข้อมูลผู้ขายจาก API
  const products = [];  // ข้อมูลสินค้าจาก API

  const handleSubmit = (data) => {
    // บันทึกข้อมูลใบสั่งซื้อ
    console.log(data);
  };

  return (
    <div>
      <h1>Purchase Order</h1>
      <PurchaseOrderForm
        onSubmit={handleSubmit}
        suppliers={suppliers}
        products={products}
      /> 
    </div>
  );
};

export default PurchaseOrder;
