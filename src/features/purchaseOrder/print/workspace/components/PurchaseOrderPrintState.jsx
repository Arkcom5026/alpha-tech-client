import React from 'react';

const PurchaseOrderPrintState = ({ status = 'loading' }) => {
  if (status === 'missing') {
    return <p className="p-4 text-red-500">ไม่พบใบสั่งซื้อ</p>;
  }

  return <p className="p-4">กำลังโหลด...</p>;
};

export default PurchaseOrderPrintState;
