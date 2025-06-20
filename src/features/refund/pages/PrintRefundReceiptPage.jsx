// refund/pages/PrintRefundReceiptPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useSaleReturnStore from '@/features/saleReturn/store/saleReturnStore';
import useEmployeeStore from '@/features/employee/store/employeeStore';


const PrintRefundReceiptPage = () => {
  const { saleReturnId } = useParams();
  const { getSaleReturnByIdAction } = useSaleReturnStore();
  const { branch } = useEmployeeStore();
  const [saleReturn, setSaleReturn] = useState(null);

  useEffect(() => {
    const load = async () => {
      const result = await getSaleReturnByIdAction(saleReturnId);
      setSaleReturn(result);
    };
    load();
  }, [saleReturnId, getSaleReturnByIdAction]);

  if (!saleReturn) return <div className="p-4">กำลังโหลด...</div>;

  const { code, createdAt, sale, refundTransaction = [], totalRefund = 0, refundedAmount = 0, deductedAmount = 0 } = saleReturn;
  const customerName = sale?.customer?.name || '-';
  const saleCode = sale?.code || '-';
  const totalAmount = refundTransaction.reduce((sum, r) => sum + (r.amount || 0), 0);
  const remainingAmount = totalRefund - totalAmount - deductedAmount;

  const branchName = branch?.name || '-';
  const branchAddress = branch?.address || '-';
  const branchPhone = branch?.phone || '-';
  const branchTaxId = branch?.taxId || '-';
  const branchEmail = branch?.email || '-';
  const branchContact = branch?.contactName || '-';

  return (
    <div className="w-[794px] h-[1123px] mx-auto p-8 bg-white text-black text-sm print:block" style={{ fontFamily: 'TH Sarabun New' }}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-lg font-bold">{branchName}</h1>
          <p>{branchAddress}</p>
          <p>โทร: {branchPhone}</p>
          <p>เลขผู้เสียภาษี: {branchTaxId}</p>
          <p>อีเมล: {branchEmail}</p>
          <p>ผู้ติดต่อ: {branchContact}</p>
        </div>
        <div className="text-right">
          <button
            onClick={() => window.print()}
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
        <p>ยอดสินค้าที่ต้องคืน: {totalRefund.toFixed(2)} ฿</p>
        <p>ยอดที่คืนไปแล้ว: {totalAmount.toFixed(2)} ฿</p>
        <p>ยอดที่หักไว้: {deductedAmount.toFixed(2)} ฿</p>
        <p>ยอดคงเหลือที่ต้องคืน: {remainingAmount.toFixed(2)} ฿</p>
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
          {refundTransaction.map((r) => (
            <tr key={r.id}>
              <td className="border px-2 py-1">{r.refundedAt ? new Date(r.refundedAt).toLocaleDateString() : '-'}</td>
              <td className="border px-2 py-1 text-right">{r.amount.toFixed(2)} ฿</td>
              <td className="border px-2 py-1">{r.method}</td>
              <td className="border px-2 py-1">{r.note || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="text-right font-semibold text-base mb-8">
        รวมเป็นเงินทั้งสิ้น: {totalAmount.toFixed(2)} ฿
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

export default PrintRefundReceiptPage;
