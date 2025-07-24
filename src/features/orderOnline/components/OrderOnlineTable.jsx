
import React from 'react';
import OrderStatusBadge from './OrderStatusBadge';
import { format } from 'date-fns';
import th from 'date-fns/locale/th';

const OrderOnlineTable = ({ orders }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-3 py-2 border">รหัสคำสั่งซื้อ</th>
            <th className="px-3 py-2 border">วันที่</th>
            <th className="px-3 py-2 border">ลูกค้า</th>
            <th className="px-3 py-2 border">ยอดรวม</th>
            <th className="px-3 py-2 border">สถานะชำระเงิน</th>
            <th className="px-3 py-2 border">สถานะ</th>
            <th className="px-3 py-2 border">ดูรายละเอียด</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center py-4 text-gray-500">
                ไม่พบรายการคำสั่งซื้อ
              </td>
            </tr>
          ) : (
            orders.map((order) => {
              const amount = Number(order.totalAmount);
              const customerName = order.customerName || order.customer?.companyName || order.customer?.name || order.customer?.fullName || '-';
              return (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 border text-center">{order.code}</td>
                  <td className="px-3 py-2 border text-center">
                    {format(new Date(order.createdAt), 'dd MMM yyyy HH:mm', { locale: th })}
                  </td>
                  <td className="px-3 py-2 border">{customerName}</td>
                  <td className="px-3 py-2 border text-right">
                    {!isNaN(amount) ? `฿${amount.toFixed(2)}` : '-'}
                  </td>

                  <td className="px-3 py-2 border text-center">
                    {order.paymentSlipStatus === 'WAITING_APPROVAL' ? (
                      <span className="text-yellow-600">รอตรวจสอบสลิป</span>
                    ) : order.paymentStatusLabel === 'ยังไม่ชำระ' ? (
                      <a
                        href={`/customers/payment/${order.id}`}
                        className="text-green-600 hover:underline"
                      >
                        ไปชำระเงิน
                      </a>
                    ) : (
                      <span className="text-gray-800">{order.paymentStatusLabel}</span>
                    )}
                  </td>
                  <td className="px-3 py-2 border text-center">
                    <OrderStatusBadge status={order.status} />  
                  </td>
                  <td className="px-3 py-2 border text-center">
                    <a
                      href={`/customers/orders/${order.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      ดูรายละเอียด
                    </a>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default OrderOnlineTable;
