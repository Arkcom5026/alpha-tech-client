// refund/pages/ListReturnsPage.jsx
import useSaleReturnStore from '@/features/saleReturn/store/saleReturnStore';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ListReturnsPage = () => {
  const navigate = useNavigate();
  const { saleReturns, fetchSaleReturnsAction, loading } = useSaleReturnStore();

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchSaleReturnsAction();
  }, [fetchSaleReturnsAction]);

  const filteredReturns = saleReturns.filter((sr) => {
    const searchLower = searchText.toLowerCase();
    const matchesSearch =
      sr.code?.toLowerCase().includes(searchLower) ||
      sr.sale?.customer?.name?.toLowerCase().includes(searchLower) ||
      sr.sale?.customer?.phone?.toLowerCase().includes(searchLower);

    const totalRefund = sr.totalRefund || 0;
    const refunded = sr.refundedAmount || 0;
    const deducted = sr.deductedAmount || 0;
    const remain = totalRefund - refunded - deducted;

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'PENDING' && refunded + deducted === 0) ||
      (statusFilter === 'PARTIAL' && refunded + deducted > 0 && remain > 0) ||
      (statusFilter === 'REFUNDED' && remain === 0);

    return matchesSearch && matchesStatus;
  });

  const renderStatusBadge = (status) => {
    const base = 'px-2 py-1 rounded-full text-xs font-semibold';
    if (status === 'PENDING') return <span className={`${base} bg-red-100 text-red-700`}>ยังไม่ได้คืน</span>;
    if (status === 'PARTIAL') return <span className={`${base} bg-yellow-100 text-yellow-700`}>คืนบางส่วน</span>;
    if (status === 'REFUNDED') return <span className={`${base} bg-green-100 text-green-700`}>คืนครบแล้ว</span>;
    return <span className={base}>{status}</span>;
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">รายการใบคืนสินค้า</h1>

      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <input
          type="text"
          placeholder="ค้นหาจากชื่อ, เบอร์โทร, เลขใบคืน..."
          className="border px-3 py-2 rounded w-full md:w-1/2"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <div className="flex gap-4 items-center">
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="status"
              value="ALL"
              checked={statusFilter === 'ALL'}
              onChange={() => setStatusFilter('ALL')}
            />
            ทั้งหมด
          </label>
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="status"
              value="PENDING"
              checked={statusFilter === 'PENDING'}
              onChange={() => setStatusFilter('PENDING')}
            />
            ยังไม่ได้คืน
          </label>
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="status"
              value="PARTIAL"
              checked={statusFilter === 'PARTIAL'}
              onChange={() => setStatusFilter('PARTIAL')}
            />
            คืนบางส่วน
          </label>
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="status"
              value="REFUNDED"
              checked={statusFilter === 'REFUNDED'}
              onChange={() => setStatusFilter('REFUNDED')}
            />
            คืนครบแล้ว
          </label>
        </div>
      </div>

      {loading ? (
        <p>กำลังโหลด...</p>
      ) : (
        <table className="w-full table-auto border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-2 py-1 w-[120px]">วันที่</th>
              <th className="border px-2 py-1 w-[160px]">เลขที่ใบคืนสินค้า</th>
              <th className="border px-2 py-1 w-[180px]">ลูกค้า</th>
              <th className="border px-2 py-1 w-[120px] text-right">ยอดคืนทั้งหมด</th>
              <th className="border px-2 py-1 w-[120px] text-right">ยอดคืนแล้ว</th>
              <th className="border px-2 py-1 w-[120px] text-right">ยอดหักเงิน</th>
              <th className="border px-2 py-1 w-[120px] text-right">ยอดคงเหลือ</th>
              <th className="border px-2 py-1 w-[100px]">ประเภท</th>
              <th className="border px-2 py-1 w-[100px]">สถานะ</th>
              <th className="border px-2 py-1 w-[100px] text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredReturns.map((sr) => {
              const totalRefund = sr.totalRefund || 0;
              const refunded = sr.refundedAmount || 0;
              const deducted = sr.deductedAmount || 0;
              const remain = totalRefund - refunded - deducted;

              let status = 'PENDING';
              if (refunded + deducted > 0 && remain > 0) status = 'PARTIAL';
              if (remain === 0) status = 'REFUNDED';

              return (
                <tr key={sr.id}>
                  <td className="border px-2 py-1">{new Date(sr.createdAt).toLocaleDateString()}</td>
                  <td className="border px-2 py-1">{sr.code}</td>
                  <td className="border px-2 py-1">{sr.sale?.customer?.name || '-'}</td>
                  <td className="border px-2 py-1 text-right">{totalRefund.toFixed(2)} ฿</td>
                  <td className="border px-2 py-1 text-right">{refunded.toFixed(2)} ฿</td>
                  <td className="border px-2 py-1 text-right">{deducted.toFixed(2)} ฿</td>
                  <td className="border px-2 py-1 text-right">{remain.toFixed(2)} ฿</td>
                  <td className="border px-2 py-1">{sr.returnType}</td>
                  <td className="border px-2 py-1">{renderStatusBadge(status)}</td>
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
  