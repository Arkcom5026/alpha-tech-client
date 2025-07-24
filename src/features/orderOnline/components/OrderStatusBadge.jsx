import React from 'react';

const statusStyles = {
  PENDING: 'bg-gray-300 text-gray-800',
  CONFIRMED: 'bg-green-500 text-white',
  CANCELED: 'bg-red-500 text-white',
};

const statusLabels = {
  PENDING: 'รอดำเนินการ',
  CONFIRMED: 'ยืนยันแล้ว',
  CANCELED: 'ยกเลิกแล้ว',
};

const OrderStatusBadge = ({ status }) => {
  const style = statusStyles[status] || 'bg-gray-200 text-gray-800';
  const label = statusLabels[status] || 'ไม่ทราบสถานะ';

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded ${style}`}>
      {label}
    </span>
  );
};

export default OrderStatusBadge;
