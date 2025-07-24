import React, { useEffect } from 'react';
import { useOrderOnlineStore } from '../store/orderOnlineStore';
import OrderOnlineTable from '../components/OrderOnlineTable';

const ListOrderOnlinePage = () => {
  const {
    orders,
    getAllOrderOnlineByIdAction,
    isLoading,
    filterStatus,
    setFilterStatus
  } = useOrderOnlineStore();

  useEffect(() => {
    getAllOrderOnlineByIdAction();
  }, [filterStatus]);

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6">
      <h1 className="text-xl font-semibold mb-4">คำสั่งซื้อของฉัน</h1>

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          className={`px-3 py-1 rounded ${filterStatus === 'ALL' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setFilterStatus('ALL')}
        >ทั้งหมด</button>
        <button
          className={`px-3 py-1 rounded ${filterStatus === 'PENDING' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setFilterStatus('PENDING')}
        >รอดำเนินการ</button>
        <button
          className={`px-3 py-1 rounded ${filterStatus === 'CONFIRMED' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setFilterStatus('CONFIRMED')}
        >ยืนยันแล้ว</button>
        <button
          className={`px-3 py-1 rounded ${filterStatus === 'CANCELLED' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setFilterStatus('CANCELLED')}
        >ยกเลิกแล้ว</button>
      </div>

      {isLoading ? (
        <p>กำลังโหลดข้อมูล...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500">ไม่พบรายการคำสั่งซื้อ</p>
      ) : (
        <OrderOnlineTable orders={orders} />
      )}
    </div>
  );
};

export default ListOrderOnlinePage;
