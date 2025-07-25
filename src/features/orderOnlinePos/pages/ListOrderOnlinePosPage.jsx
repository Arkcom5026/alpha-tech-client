import React, { useEffect, useState } from 'react';
import { useOrderOnlinePosStore } from '../store/orderOnlinePosStore';
import OrderOnlinePosStatusBadge from '../components/OrderOnlinePosStatusBadge';

const ListOrderOnlinePosPage = () => {
  const {
    loadOrderOnlinePosListAction,
    orderList,
    isLoading,
    error,
  } = useOrderOnlinePosStore();

  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    loadOrderOnlinePosListAction();
  }, [loadOrderOnlinePosListAction]);

  const filteredOrders = orderList.filter((order) => {
    if (filter === 'ALL') return true;
    if (filter === 'WAITING_APPROVAL') return order.paymentSlipStatus === 'WAITING_APPROVAL';
    if (filter === 'APPROVED') return order.paymentSlipStatus === 'APPROVED';
    if (filter === 'UNPAID') return order.statusPayment === 'NONE';
    return true;
  });

  const handleConvertClick = (orderId) => {
    if (!orderId) return;
    window.location.href = `/pos/sales/order-online/convert/${orderId}`;
  };

  return (
    <div className="px-6 pt-4 pb-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">
          รายการคำสั่งซื้อจาก Online (POS)
        </h1>
        <button
          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded shadow"
          onClick={() => {
            loadOrderOnlinePosListAction();
          }}
        >
          🔄 โหลดใหม่
        </button>
      </div>

      <div className="flex gap-4 mb-3 text-sm text-gray-700 dark:text-gray-300">
        <label>
          <input
            type="radio"
            name="filter"
            value="ALL"
            checked={filter === 'ALL'}
            onChange={(e) => setFilter(e.target.value)}
            className="mr-1"
          />
          ทั้งหมด
        </label>
        <label>
          <input
            type="radio"
            name="filter"
            value="WAITING_APPROVAL"
            checked={filter === 'WAITING_APPROVAL'}
            onChange={(e) => setFilter(e.target.value)}
            className="mr-1"
          />
          รออนุมัติ
        </label>
        <label>
          <input
            type="radio"
            name="filter"
            value="APPROVED"
            checked={filter === 'APPROVED'}
            onChange={(e) => setFilter(e.target.value)}
            className="mr-1"
          />
          อนุมัติแล้ว
        </label>
        <label>
          <input
            type="radio"
            name="filter"
            value="UNPAID"
            checked={filter === 'UNPAID'}
            onChange={(e) => setFilter(e.target.value)}
            className="mr-1"
          />
          รอชำระเงิน
        </label>
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">
        ทั้งหมด <span className="font-medium">{filteredOrders?.length || 0}</span> รายการ
      </div>

      {isLoading && <p className="text-sm text-blue-600">กำลังโหลดข้อมูล...</p>}
      {error && <p className="text-sm text-red-500">เกิดข้อผิดพลาด: {error}</p>}

      {!isLoading && !error && filteredOrders && (
        <div className="bg-white dark:bg-zinc-900 shadow rounded-lg p-3 overflow-x-auto">
          <table className="min-w-full text-sm border border-gray-300 dark:border-zinc-700">
            <thead>
              <tr className="bg-gray-100 dark:bg-zinc-800 text-center">
                <th className="px-3 py-2 border border-gray-300 dark:border-zinc-700">รหัสคำสั่งซื้อ</th>
                <th className="px-3 py-2 border border-gray-300 dark:border-zinc-700">ลูกค้า</th>
                <th className="px-3 py-2 border border-gray-300 dark:border-zinc-700">ประเภท</th>
                <th className="px-3 py-2 border border-gray-300 dark:border-zinc-700">วันที่</th>
                <th className="px-3 py-2 border border-gray-300 dark:border-zinc-700">ยอดรวม</th>
                <th className="px-3 py-2 border border-gray-300 dark:border-zinc-700">สถานะสลิป</th>
                <th className="px-3 py-2 border border-gray-300 dark:border-zinc-700">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-t border-gray-200 dark:border-zinc-700 text-center">
                  <td className="px-3 py-2 border border-gray-200 dark:border-zinc-700">{order.code}</td>
                  <td className="px-3 py-2 border border-gray-200 dark:border-zinc-700">{order.customerName}</td>
                  <td className="px-3 py-2 border border-gray-200 dark:border-zinc-700">
                    {order.customerType === 'GOVERNMENT'
                      ? 'หน่วยงาน'
                      : order.customerType === 'ORGANIZATION'
                      ? 'องค์กร'
                      : 'บุคคลทั่วไป'}
                  </td>
                  <td className="px-3 py-2 border border-gray-200 dark:border-zinc-700">{order.createdAt?.split('T')[0]}</td>
                  <td className="px-3 py-2 border border-gray-200 dark:border-zinc-700 text-right">฿{order.totalAmount?.toFixed(2)}</td>
                  <td className="px-3 py-2 border border-gray-200 dark:border-zinc-700">
                    <OrderOnlinePosStatusBadge status={order.paymentSlipStatus} />
                  </td>
                  <td className="px-3 py-2 border border-gray-200 dark:border-zinc-700">
                    {order.paymentSlipStatus === 'APPROVED' ? (
                      <button
                        onClick={() => handleConvertClick(order.id)}
                        className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200"
                      >
                        สร้างใบจอง
                      </button>
                    ) : (
                      <a
                        href={`/pos/sales/order-online/${order.id}`}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                      >
                        จัดการ
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ListOrderOnlinePosPage;
