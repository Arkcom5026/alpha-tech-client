import React from 'react';
import { formatRefundReceiptMoney } from '../policies/refundReceiptPrintPolicy';

const RefundReceiptPrintShell = ({ projection, onPrint }) => {
  const {
    code,
    createdAt,
    customerName,
    saleCode,
    refundTransactions,
    totalRefund,
    deductedAmount,
    totalAmount,
    remainingAmount,
    branch,
  } = projection;

  return (
    <div className="w-[794px] h-[1123px] mx-auto p-8 bg-white text-black text-sm print:block" style={{ fontFamily: 'TH Sarabun New' }}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-lg font-bold">{branch.name}</h1>
          <p>{branch.address}</p>
          <p>โทร: {branch.phone}</p>
          <p>เลขผู้เสียภาษี: {branch.taxId}</p>
          <p>อีเมล: {branch.email}</p>
          <p>ผู้ติดต่อ: {branch.contactName}</p>
        </div>
        <div className="text-right">
          <button
            type="button"
            onClick={onPrint}
            className="bg-blue-600 text-white px-4 py-1 rounded print:hidden"
          >
            พิมพ์
          </button>
        </div>
      </div>

      <div className="text-center mb-6">
        <h1 className="text-xl font-bold">ใบรับเงินคืน</h1>
        <p>เลขที่ใบคืนสินค้า: {code}</p>
        <p>เลขที่การขาย: {saleCode}</p>
        <p>วันที่: {new Date(createdAt).toLocaleDateString()}</p>
      </div>

      <div className="mb-2">
        <p>ชื่อลูกค้า: {customerName}</p>
      </div>

      <div className="mb-4">
        <p>ยอดสินค้าที่ต้องคืน: {formatRefundReceiptMoney(totalRefund)} ฿</p>
        <p>ยอดที่คืนไปแล้ว: {formatRefundReceiptMoney(totalAmount)} ฿</p>
        <p>ยอดที่หักไว้: {formatRefundReceiptMoney(deductedAmount)} ฿</p>
        <p>ยอดคงเหลือที่ต้องคืน: {formatRefundReceiptMoney(remainingAmount)} ฿</p>
      </div>

      <table className="w-full table-auto border mb-6">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">วันที่</th>
            <th className="border px-2 py-1 text-right">จำนวนเงิน</th>
            <th className="border px-2 py-1">ช่องทาง</th>
            <th className="border px-2 py-1">หมายเหตุ</th>
          </tr>
        </thead>
        <tbody>
          {refundTransactions.map((transaction) => (
            <tr key={transaction.id}>
              <td className="border px-2 py-1">{transaction.refundedAt ? new Date(transaction.refundedAt).toLocaleDateString() : '-'}</td>
              <td className="border px-2 py-1 text-right">{formatRefundReceiptMoney(transaction.amount)} ฿</td>
              <td className="border px-2 py-1">{transaction.method}</td>
              <td className="border px-2 py-1">{transaction.note || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="text-right font-semibold text-base mb-8">
        รวมเป็นเงินทั้งสิ้น: {formatRefundReceiptMoney(totalAmount)} ฿
      </div>

      <div className="flex justify-between mt-12">
        <div className="text-center">
          <p>..............................................</p>
          <p>ผู้รับเงิน</p>
        </div>
        <div className="text-center">
          <p>..............................................</p>
          <p>พนักงาน</p>
        </div>
      </div>

      <p className="mt-10 text-xs text-center">โปรดเก็บเอกสารนี้ไว้เป็นหลักฐานการคืนเงิน</p>
    </div>
  );
};

export default RefundReceiptPrintShell;
