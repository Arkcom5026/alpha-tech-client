import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useOrderOnlinePosStore } from '../store/orderOnlinePosStore';
import OrderOnlinePosStatusBadge from '../components/OrderOnlinePosStatusBadge';

const OrderOnlinePosDetailPage = () => {
  const { id } = useParams();
  const {
    selectedOrder,
    loadOrderOnlinePosByIdAction,
    getOrderOnlineTotalSummary,
    isLoading,
    error,
    approveOrderOnlinePaymentSlipAction,
    rejectOrderOnlineSlipAction, // ✅ เพิ่ม action สำหรับปฏิเสธ
  } = useOrderOnlinePosStore();

  useEffect(() => {
    if (id) {
      loadOrderOnlinePosByIdAction(id);
    }
  }, [id, loadOrderOnlinePosByIdAction]);

  if (isLoading) return <p className="p-4">กำลังโหลดข้อมูล...</p>;
  if (error) return <p className="p-4 text-red-500">เกิดข้อผิดพลาด: {error}</p>;
  if (!selectedOrder) return <p className="p-4 text-gray-500">ไม่พบคำสั่งซื้อ</p>;

  const {
    code,
    customerName,
    customerType,
    customerCompany,
    createdAt,
    status,
    paymentSlipStatus,
    items = [],
    slipImageUrl,
  } = selectedOrder;

  const { subtotal, vat, total } = getOrderOnlineTotalSummary(selectedOrder);
  const displayCustomer = customerType === 'GOVERNMENT' && customerCompany ? `${customerCompany}` : customerName;

  const handleConfirm = async () => {
    if (!id) return;
    try {
      await approveOrderOnlinePaymentSlipAction(id);
    } catch (error) {
      console.error('❌ อนุมัติล้มเหลว:', error);
    }
  };

  const handleReject = async () => {
    if (!id) return;
    try {
      await rejectOrderOnlineSlipAction(id);
    } catch (error) {
      console.error('❌ ปฏิเสธล้มเหลว:', error);
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-lg font-semibold mb-2 text-center">รายละเอียดคำสั่งซื้อ #{code}</h2>
      <div className="mb-4 text-sm text-center">
        <p>ลูกค้า: {displayCustomer}</p>
        <p>วันที่สั่งซื้อ: {createdAt?.slice(0, 10)}</p>
      </div>

      <div className="border rounded-md overflow-hidden mb-4">
        <table className="min-w-full text-sm border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-left border-b border-gray-300">สินค้า</th>
              <th className="px-3 py-2 text-right border-b border-gray-300">จำนวน</th>
              <th className="px-3 py-2 text-right border-b border-gray-300">ราคาต่อหน่วย</th>
              <th className="px-3 py-2 text-right border-b border-gray-300">รวม</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const itemSubtotal = item.unitPrice && item.quantity ? item.unitPrice * item.quantity : 0;
              return (
                <tr key={index} className="border-t border-gray-200">
                  <td className="px-3 py-2 border-b border-gray-200">{item.productName}</td>
                  <td className="px-3 py-2 text-right border-b border-gray-200">{item.quantity}</td>
                  <td className="px-3 py-2 text-right border-b border-gray-200">฿{typeof item.unitPrice === 'number' ? item.unitPrice.toFixed(2) : '-'}</td>
                  <td className="px-3 py-2 text-right border-b border-gray-200">฿{itemSubtotal.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="text-sm flex justify-end">
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

      {slipImageUrl && (
        <div className="mt-6 text-center">
          <h4 className="font-medium mb-2">หลักฐานการชำระเงิน</h4>
          <img src={slipImageUrl} alt="slip" className="mx-auto max-h-96 border border-gray-300 rounded" />
        </div>
      )}

      <div className="mt-6 text-center">
        <p className="mt-2">สถานะ: <OrderOnlinePosStatusBadge status={status} /></p>

        {paymentSlipStatus === 'WAITING_APPROVAL' && (
          <div className="mt-4 flex justify-center gap-4">
            <button
              onClick={handleConfirm}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
            >
              อนุมัติการชำระเงิน
            </button>
            <button
              onClick={handleReject}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
            >
              ปฏิเสธสลิป
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderOnlinePosDetailPage;
