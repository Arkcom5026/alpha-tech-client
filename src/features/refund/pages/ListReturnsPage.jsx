// refund/pages/ListReturnsPage.jsx
import useSaleReturnStore from '@/features/saleReturn/store/saleReturnStore';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ListReturnsPage = () => {
  const navigate = useNavigate();
  const { saleReturns, fetchSaleReturnsAction, loading } = useSaleReturnStore();

  useEffect(() => {
    fetchSaleReturnsAction();
  }, [fetchSaleReturnsAction]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">รายการใบคืนสินค้า</h1>

      {loading ? (
        <p>กำลังโหลด...</p>
      ) : (
        <table className="w-full table-auto border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-2 py-1 w-[120px]">วันที่</th>
              <th className="border px-2 py-1 w-[160px]">เลขที่ใบคืนสินค้า</th>
              <th className="border px-2 py-1 w-[180px]">ลูกค้า</th>
              <th className="border px-2 py-1 w-[120px] text-right">ยอดคืนแล้ว</th>
              <th className="border px-2 py-1 w-[120px] text-right">ยอดคงเหลือ</th>
              <th className="border px-2 py-1 w-[120px] text-right">ยอดคืนทั้งหมด</th>
              <th className="border px-2 py-1 w-[100px]">ประเภท</th>
              <th className="border px-2 py-1 w-[100px]">สถานะ</th>
              <th className="border px-2 py-1 w-[100px] text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {saleReturns.map((sr) => {
              const totalRefund = sr.totalRefund || 0;
              const refundedAmount = sr.refundedAmount || 0;
              const remain = totalRefund - refundedAmount;
              return (
                <tr key={sr.id}>
                  <td className="border px-2 py-1">{new Date(sr.createdAt).toLocaleDateString()}</td>
                  <td className="border px-2 py-1">{sr.code}</td>
                  <td className="border px-2 py-1">{sr.sale?.customer?.name || '-'}</td>
                  <td className="border px-2 py-1 text-right">{refundedAmount.toFixed(2)} ฿</td>
                  <td className="border px-2 py-1 text-right">{remain.toFixed(2)} ฿</td>
                  <td className="border px-2 py-1 text-right">{totalRefund.toFixed(2)} ฿</td>
                  <td className="border px-2 py-1">{sr.returnType}</td>
                  <td className="border px-2 py-1">{sr.status}</td>
                  <td className="border px-2 py-1 text-center">
                    <button
                      onClick={() => navigate(`/pos/finance/refunds/create/${sr.id}`)}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      คืนเงิน
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ListReturnsPage;
