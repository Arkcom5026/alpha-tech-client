import React from 'react';
import { useParams } from 'react-router-dom';

const CustomerDetailPage = () => {
  const { customerId } = useParams();

  return (
    <div className="p-4">
      <div className="text-lg font-bold">รายละเอียดลูกค้า</div>
      <div className="text-sm text-gray-600 mt-1">Customer ID: {customerId}</div>

      <div className="mt-4 text-sm">
        แท็บ “เครดิต/ลูกหนี้” จะถูกวางในหน้านี้
      </div>
    </div>
  );
};

export default CustomerDetailPage;