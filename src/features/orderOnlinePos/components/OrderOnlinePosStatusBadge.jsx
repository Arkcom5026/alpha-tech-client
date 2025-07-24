// ===== components/OrderOnlinePosStatusBadge.jsx =====

import React from 'react';

const statusColorMap = {
  WAITING_PAYMENT: 'bg-yellow-200 text-yellow-800',
  WAITING_APPROVAL: 'bg-orange-200 text-orange-800',
  PAID: 'bg-blue-200 text-blue-800',
  PREPARING: 'bg-indigo-200 text-indigo-800',
  READY_FOR_PICKUP: 'bg-green-200 text-green-800',
  COMPLETED: 'bg-gray-300 text-gray-800',
  CANCELLED: 'bg-red-200 text-red-800',
};

const statusLabelMap = {
  WAITING_PAYMENT: 'รอชำระเงิน',
  WAITING_APPROVAL: 'รอตรวจสอบ',
  PAID: 'ชำระเงินแล้ว',
  PREPARING: 'กำลังเตรียมสินค้า',
  READY_FOR_PICKUP: 'พร้อมรับสินค้า',
  COMPLETED: 'สำเร็จ',
  CANCELLED: 'ยกเลิก',
};

const OrderOnlinePosStatusBadge = ({ status }) => {
  const badgeClass = statusColorMap[status] || 'bg-gray-100 text-gray-700';
  const label = statusLabelMap[status] || status;

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${badgeClass}`}>
      {label}
    </span>
  );
};

export default OrderOnlinePosStatusBadge;
