import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useOrderOnlineStore } from '@/features/orderOnline/store/orderOnlineStore';

const OrderOnlineDetailPage = () => {
  const { id } = useParams();
  const orderId = Number(id);

  const selectedOrderOnline = useOrderOnlineStore((state) => state.selectedOrderOnline);
  const loadOrderOnlineByIdForCustomerAction = useOrderOnlineStore((state) => state.loadOrderOnlineByIdForCustomerAction);

  useEffect(() => {
    loadOrderOnlineByIdForCustomerAction(orderId);
  }, [orderId, loadOrderOnlineByIdForCustomerAction]);

  if (!selectedOrderOnline) return <p className="text-red-500">ไม่พบข้อมูลคำสั่งซื้อนี้</p>;

  const order = selectedOrderOnline;

  return (
    <div className="max-w-screen-lg mx-auto p-4 space-y-4">
      <h1 className="text-xl font-bold">รายละเอียดคำสั่งซื้อ: {order.code}</h1>

      <section className="border p-4 rounded-md">
        <h2 className="font-semibold mb-2">ข้อมูลลูกค้า</h2>
        <p>ชื่อ: {order.customerName}</p>
        <p>เบอร์โทร: {order.customerPhone}</p>
        <p>ที่อยู่: {order.customerAddress}</p>
      </section>

      <section className="border p-4 rounded-md overflow-x-auto">
        <h2 className="font-semibold mb-2">รายการสินค้า</h2>
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">#</th>
              <th className="border p-2 text-left">ชื่อสินค้า</th>
              <th className="border p-2">จำนวน</th>
              <th className="border p-2">ราคา/หน่วย</th>
              <th className="border p-2">รวม</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item, index) => (
              <tr key={index}>
                <td className="border p-2 text-center">{index + 1}</td>
                <td className="border p-2">{item.productName}</td>
                <td className="border p-2 text-center">{item.quantity}</td>
                <td className="border p-2 text-right">{typeof item.unitPrice === 'number' ? item.unitPrice.toFixed(2) : '-'}</td>
                <td className="border p-2 text-right">{typeof item.totalPrice === 'number' ? item.totalPrice.toFixed(2) : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="border p-4 rounded-md text-right">
        <p>รวมทั้งหมด: <strong>{typeof order.totalAmount === 'number' ? order.totalAmount.toFixed(2) : '-'} ฿</strong></p>
        <p>สถานะ: <span className="font-medium">{order.status}</span></p>
      </section>
    </div>
  );
};

export default OrderOnlineDetailPage;
