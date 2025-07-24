
// ===== components/OrderOnlinePosTable.jsx =====

import React from 'react';
import { useNavigate } from 'react-router-dom';
import OrderOnlinePosStatusBadge from './OrderOnlinePosStatusBadge';
import { useOrderOnlinePosStore } from '../store/orderOnlinePosStore';

const OrderOnlinePosTable = ({ orders }) => {
  const navigate = useNavigate();
  const {
    approveOrderOnlineSlipAction,
    rejectOrderOnlineSlipAction,
    deleteOrderOnlineAction,
  } = useOrderOnlinePosStore();

  const handleApprove = async (id) => {
    if (confirm('ยืนยันการอนุมัติสลิปคำสั่งซื้อนี้?')) {
      await approveOrderOnlineSlipAction(id);
    }
  };

  const handleReject = async (id) => {
    if (confirm('ยืนยันการปฏิเสธสลิปคำสั่งซื้อนี้?')) {
      await rejectOrderOnlineSlipAction(id);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('คุณต้องการลบคำสั่งซื้อนี้หรือไม่?')) {
      await deleteOrderOnlineAction(id);
    }
  };

  const formatMoney = (amount) => {
    return typeof amount === 'number' ? amount.toFixed(2) : '-';
  };

  return (
    <table className="w-full border text-sm">
      <thead className="bg-gray-100">
        <tr>
          <th className="border p-2">รหัสคำสั่งซื้อ</th>
          <th className="border p-2">ลูกค้า</th>
          <th className="border p-2">วันที่</th>
          <th className="border p-2">ยอดรวม</th>
          <th className="border p-2">สถานะ</th>
          <th className="border p-2">จัดการ</th>
        </tr>
      </thead>
      <tbody>
        {orders.length === 0 ? (
          <tr>
            <td colSpan="6" className="text-center p-4 text-gray-500">
              ไม่พบคำสั่งซื้อ
            </td>
          </tr>
        ) : (
          orders.map((order) => {
            const customerName = order.customer?.customerType === 'GOVERNMENT'
              ? order.customer?.companyName || '-'
              : order.customer?.name || '-';

            return (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="border p-2">{order.code}</td>
                <td className="border p-2">{customerName}</td>
                <td className="border p-2">{order.createdAt?.slice(0, 10)}</td>
                <td className="border p-2 text-right">฿{formatMoney(order.totalAmount)}</td>
                <td className="border p-2">
                  <OrderOnlinePosStatusBadge status={order.status} />
                </td>
                <td className="border p-2 text-center space-y-1">
                  <button
                    className="text-blue-600 hover:underline block w-full"
                    onClick={() => navigate(`/pos/sales/order-online/${order.id}`)}
                  >
                    ดูรายละเอียด
                  </button>
                  {order.status === 'WAITING_APPROVAL' && (
                    <>
                      <button
                        className="text-green-600 hover:underline block w-full"
                        onClick={() => handleApprove(order.id)}
                      >
                        อนุมัติสลิป
                      </button>
                      <button
                        className="text-red-600 hover:underline block w-full"
                        onClick={() => handleReject(order.id)}
                      >
                        ปฏิเสธสลิป
                      </button>
                    </>
                  )}
                  <button
                    className="text-gray-500 hover:underline block w-full"
                    onClick={() => handleDelete(order.id)}
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );
};

export default OrderOnlinePosTable;
