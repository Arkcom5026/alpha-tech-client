// src/features/paymentOnline/pages/PaymentOnlinePage.jsx

import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { usePaymentOnlineStore } from '../store/paymentOnlineStore';
import PaymentOnlineForm from '../components/PaymentOnlineForm';

const PaymentOnlinePage = () => {
  const { id } = useParams();
  const {
    order,
    loadOrderAction,
    isLoading,
    uploadSlipAction,
    submitPaymentSlipAction,
  } = usePaymentOnlineStore();

  useEffect(() => {
    if (id) {
      loadOrderAction(id);
    }
  }, [id, loadOrderAction]);

  if (isLoading || !order) {
    return <div className="text-center py-10">กำลังโหลดข้อมูลคำสั่งซื้อ...</div>;
  }

  const { subtotal, vat, total } = order.summary || {};

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <h1 className="text-xl font-semibold mb-4">ชำระเงินสำหรับคำสั่งซื้อ #{order.code}</h1>

      <div className="bg-white border rounded-md p-4 mb-6">
        <p><strong>วันที่สั่งซื้อ:</strong> {order.createdAt ? new Date(order.createdAt).toLocaleString('th-TH') : '-'}</p>
        <p><strong>ชื่อลูกค้า:</strong> {order.customerName || '-'}</p>
        <p><strong>ยอดรวม:</strong> {!isNaN(order.amount) ? `฿${order.amount.toFixed(2)}` : '-'} </p>        
        {order.paymentSlipStatus && (
          <p className="mt-2"><strong>สถานะสลิป:</strong> {translateSlipStatus(order.paymentSlipStatus)}</p>
        )}
        {order.paymentSlipUrl && (
          <div className="mt-2">
            <strong>สลิปที่อัปโหลด:</strong>
            <div className="mt-1 border rounded overflow-hidden w-64">
              <img src={order.paymentSlipUrl} alt="แนบสลิป" className="w-full object-contain" />
            </div>
          </div>
        )}
      </div>

      <div className="border rounded-md overflow-hidden mb-2">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-left">สินค้า</th>
              <th className="px-3 py-2 text-right">จำนวน</th>
              <th className="px-3 py-2 text-right">ราคาต่อหน่วย</th>
              <th className="px-3 py-2 text-right">รวม</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, index) => (
              <tr key={index} className="border-t">
                <td className="px-3 py-2">{item.productName}</td>
                <td className="px-3 py-2 text-right">{item.quantity}</td>
                <td className="px-3 py-2 text-right">฿{item.unitPrice.toFixed(2)}</td>
                <td className="px-3 py-2 text-right">฿{item.totalPrice.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-sm  flex justify-end">
        <div className="w-full sm:w-1/2 border border-gray-200 rounded-md p-2 bg-gray-50">
          <div className="flex justify-between mb-1">
            <span className="font-medium">รวม:</span>
            <span>฿{subtotal?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="font-medium">ภาษี 7%:</span>
            <span>฿{vat?.toFixed(2) || '0.00'}</span>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between text-base font-semibold text-blue-700">
            <span className="font-bold">รวมทั้งสิ้น:</span>
            <span>฿{total?.toFixed(2) || '0.00'}</span>
          </div>
        </div>
      </div>

      <PaymentOnlineForm
        orderId={order.id}
        uploadSlipAction={uploadSlipAction}
        submitPaymentSlipAction={submitPaymentSlipAction}
      />
    </div>
  );
};

const translateSlipStatus = (status) => {
  switch (status) {
    case 'WAITING_APPROVAL':
      return '⏳ รอตรวจสอบสลิป';
    case 'APPROVED':
      return '✅ อนุมัติแล้ว';
    case 'REJECTED':
      return '❌ ถูกปฏิเสธ';
    default:
      return 'ยังไม่มีสลิป';
  }
};

export default PaymentOnlinePage;
