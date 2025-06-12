import React, { useState, useEffect } from 'react';
import useSupplierPaymentStore from '@/features/supplierPayment/store/supplierPaymentStore';
import usePurchaseOrderStore from '@/features/purchaseOrder/store/purchaseOrderStore';

const SupplierPaymentTabs = ({ supplierId, supplier }) => {
  const [activeTab, setActiveTab] = useState('payments');

  const { supplierPayments, fetchAllSupplierPaymentsAction } = useSupplierPaymentStore();
  const { purchaseOrders, fetchPurchaseOrdersBySupplierAction } = usePurchaseOrderStore();

  useEffect(() => {
 
    if (supplierId) {

      fetchAllSupplierPaymentsAction();
    
      fetchPurchaseOrdersBySupplierAction(supplierId);
    }
  }, [supplierId]);

  const filteredPayments = supplierPayments.filter(p => p.supplierId === parseInt(supplierId));
  const filteredOrders = purchaseOrders.filter(po => po.supplierId === parseInt(supplierId));

  const advanceTotal = filteredPayments
    .filter(p => p.paymentType === 'ADVANCE')
    .reduce((sum, p) => sum + p.amount, 0);

  const creditUsed = filteredPayments
    .filter(p => p.paymentType === 'PO_BASED')
    .reduce((sum, p) => sum + p.amount, 0);

  const creditRemaining = (supplier?.creditLimit ?? 0) - (creditUsed ?? 0);

 

  return (
    <div>
      <div className="flex space-x-4 border-b mb-4">
        <button onClick={() => setActiveTab('orders')} className={`pb-2 ${activeTab === 'orders' ? 'border-b-2 font-semibold' : ''}`}>ประวัติการสั่งซื้อ</button>
        <button onClick={() => setActiveTab('payments')} className={`pb-2 ${activeTab === 'payments' ? 'border-b-2 font-semibold' : ''}`}>ประวัติการชำระเงิน</button>
        <button onClick={() => setActiveTab('credit')} className={`pb-2 ${activeTab === 'credit' ? 'border-b-2 font-semibold' : ''}`}>สรุปเครดิต</button>
      </div>

      {activeTab === 'orders' && (
        <div>
          <h2 className="font-semibold mb-2">ใบสั่งซื้อทั้งหมด</h2>
          <table className="w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1">รหัส PO</th>
                <th className="border px-2 py-1">วันที่</th>
                <th className="border px-2 py-1">ยอดรวม</th>
                <th className="border px-2 py-1">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((po) => (
                <tr key={String(po.id)} className="text-center">
                  <td className="border px-2 py-1">{po.code}</td>
                  <td className="border px-2 py-1">{po.createdAt?.split('T')[0]}</td>
                  <td className="border px-2 py-1">{po.totalAmount?.toLocaleString()}</td>
                  <td className="border px-2 py-1">{po.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'payments' && (
        <div>
          <h2 className="font-semibold mb-2">รายการชำระเงิน</h2>
          <table className="w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1">วันที่</th>
                <th className="border px-2 py-1">จำนวนเงิน</th>
                <th className="border px-2 py-1">วิธี</th>
                <th className="border px-2 py-1">ผู้บันทึก</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((p) => (
                <tr key={String(p.id)} className="text-center">
                  <td className="border px-2 py-1">{p.paidAt?.split('T')[0]}</td>
                  <td className="border px-2 py-1">
                    {(p.amount || p.creditAmount || p.debitAmount)?.toLocaleString() || '-'}
                  </td>
                  <td className="border px-2 py-1">{p.method}</td>
                  <td className="border px-2 py-1">{p.employee?.name || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'credit' && (
        <div>
          <h2 className="font-semibold mb-2">สรุปเครดิต</h2>
          <ul className="list-disc ml-6">
            <li>วงเงินเครดิตที่ได้รับ: {supplier?.creditLimit?.toLocaleString() || '0'} บาท</li>
            <li>ยอดใช้เครดิต (ตามใบสั่งซื้อ): {creditUsed.toLocaleString()} บาท</li>
            <li>ยอดชำระล่วงหน้าสะสม: {advanceTotal.toLocaleString()} บาท</li>
            <li>คงเหลือเครดิต: {creditRemaining.toLocaleString()} บาท</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default SupplierPaymentTabs;


