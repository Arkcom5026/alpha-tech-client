

// 📁 src/features/supplierPayment/components/SupplierPaymentHistoryTable.jsx
import React from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/th';

dayjs.locale('th');

/**
 * Component: SupplierPaymentHistoryTable
 * วัตถุประสงค์: แสดงตารางประวัติการชำระเงินสำหรับ Supplier ที่เลือก
 * สามารถนำไปใช้ในหน้าต่างๆ ที่ต้องการแสดงประวัติการชำระเงิน
 */
const SupplierPaymentHistoryTable = ({ payments = [] }) => {
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-300 bg-white shadow-sm rounded">
        <thead className="bg-gray-100 text-gray-700 text-sm">
          <tr>
            <th className="border px-4 py-2">รหัส</th>
            <th className="border px-4 py-2">วันที่</th>
            <th className="border px-4 py-2">ประเภท</th>
            <th className="border px-4 py-2 text-right">จำนวนเงิน</th>
            <th className="border px-4 py-2">วิธี</th>
            <th className="border px-4 py-2">หมายเหตุ</th>
            <th className="border px-4 py-2">ผู้บันทึก</th>
          </tr>
        </thead>
        <tbody>
          {payments.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center py-4 text-gray-500">
                ไม่พบประวัติการชำระเงิน
              </td>
            </tr>
          ) : (
            payments.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 text-sm text-center">
                <td className="border px-4 py-2">{p.code || '-'}</td>
                {/* ✅ FIX: Corrected date format from 'DD MMM BB' to 'DD MMM BBBB' for Buddhist year */}
                <td className="border px-4 py-2">{dayjs(p.paidAt).format('DD MMM BBBB')}</td>
                <td className="border px-4 py-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${p.paymentType === 'ADVANCE' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                    {p.paymentType === 'ADVANCE' ? 'ชำระล่วงหน้า' : 'ตามใบสั่งซื้อ'}
                  </span>
                </td>
                <td className="border px-4 py-2 text-right font-semibold">
                  {p.amount != null ? p.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                </td>
                <td className="border px-4 py-2">{p.method || '-'}</td>
                <td className="border px-4 py-2 text-left">{p.note || '-'}</td>
                <td className="border px-4 py-2">{p.employee?.name || '-'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SupplierPaymentHistoryTable;
