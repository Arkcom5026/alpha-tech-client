// refund/pages/PrintRefundReceiptPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useSaleReturnStore from '@/features/saleReturn/store/saleReturnStore';

const PrintRefundReceiptPage = () => {
  const { saleReturnId } = useParams();
  const { getSaleReturnByIdAction } = useSaleReturnStore();
  const [saleReturn, setSaleReturn] = useState(null);

  useEffect(() => {
    const load = async () => {
      const result = await getSaleReturnByIdAction(saleReturnId);
      setSaleReturn(result);
    };
    load();
  }, [saleReturnId, getSaleReturnByIdAction]);

  if (!saleReturn) return <div className="p-4">กำลังโหลด...</div>;

  const { code, createdAt, sale, refundTransaction = [] } = saleReturn;
  const customerName = sale?.customer?.name || '-';
  const totalAmount = refundTransaction.reduce((sum, r) => sum + (r.amount || 0), 0);

  return (
    <div className="w-[794px] h-[1123px] mx-auto p-8 bg-white text-black text-sm print:block">
      <div className="text-center mb-6">
        <h1 className="text-lg font-bold">ใบรับเงินคืน</h1>
        <p>เลขที่ใบคืนสินค้า: {code}</p>
        <p>วันที่: {new Date(createdAt).toLocaleDateString()}</p>
      </div>

      <div className="mb-4">
        <p>ชื่อลูกค้า: {customerName}</p>
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
              <td className="border px-2 py-1">{new Date(r.createdAt).toLocaleDateString()}</td>
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
    </div>
  );
};

export default PrintRefundReceiptPage;
