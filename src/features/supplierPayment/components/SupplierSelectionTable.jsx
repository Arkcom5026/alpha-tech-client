// SupplierPaymentTable.js
// This code block is for context and does not require changes for this specific issue.
import React, { useState, useEffect } from 'react';
import useSupplierPaymentStore from '@/features/supplierPayment/store/supplierPaymentStore';

const SupplierPaymentTable = ({ supplierId, supplier, payments = [] }) => {
  // This filter is redundant if the backend already filters by supplierId,
  // but it doesn't hurt. The main issue was 'payments' being an empty array.
  const filteredPayments = payments.filter(p => p.supplierId === parseInt(supplierId));

  return (
    <div>
      <h2 className="font-semibold mb-2">รายการชำระเงิน</h2>
      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">รหัส</th>
            <th className="border px-2 py-1">วันที่</th>
            <th className="border px-2 py-1">ประเภท</th>
            <th className="border px-2 py-1">จำนวนเงิน</th>
            <th className="border px-2 py-1">วิธี</th>
            <th className="border px-2 py-1">หมายเหตุ</th>
            <th className="border px-2 py-1">ผู้บันทึก</th>
          </tr>
        </thead>
        <tbody>
          {filteredPayments.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center py-2 text-gray-500">
                ไม่พบรายการชำระเงิน
              </td>
            </tr>
          ) : (
            filteredPayments.map((p, idx) => (
              <tr
                key={String(p.id)}
                className={`text-center ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
              >
                <td className="border px-2 py-1">{p.code || '-'}</td>
                <td className="border px-2 py-1">{p.paidAt?.split('T')[0]}</td>
                <td className="border px-2 py-1">
                  {p.paymentType === 'ADVANCE' ? 'ชำระล่วงหน้า' : 'ตามใบสั่งซื้อ'}
                </td>
                <td className="border px-2 py-1 font-semibold">
                  {p.amount != null ? `${p.amount.toLocaleString()} บาท` : '-'}
                </td>
                <td className="border px-2 py-1">{p.method || '-'}</td>
                <td className="border px-2 py-1">{p.note || '-'}</td>
                <td className="border px-2 py-1">{p.employee?.name || '-'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SupplierPaymentTable;