
// ✅ Component ตารางพร้อมปุ่มตรวจรับ + filter แบบ radio ด้านขวาบน + ค้นหาชื่อ Supplier
import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const getStatusLabel = (status) => {
  const s = (status || '').toString();
  if (s === 'PENDING') return 'รอดำเนินการ';
  if (s === 'PARTIALLY_RECEIVED') return 'รับบางส่วน';
  if (s === 'COMPLETED') return 'จบกระบวนการ';
  if (s === 'CANCELLED') return 'ยกเลิก';
  return s || '-';
};

const getStatusBadgeClass = (status) => {
  const s = (status || '').toString();
  if (s === 'PENDING') return 'bg-yellow-100 text-yellow-900';
  if (s === 'PARTIALLY_RECEIVED') return 'bg-blue-100 text-blue-900';
  if (s === 'COMPLETED') return 'bg-green-100 text-green-900';
  if (s === 'CANCELLED') return 'bg-red-100 text-red-900';
  return 'bg-gray-100 text-gray-900';
};

const PurchaseOrderReceiptTable = ({ purchaseOrders }) => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = useMemo(() => {
    const list = purchaseOrders || [];
    const q = (searchText || '').toString().trim().toLowerCase();

    return list.filter((po) => {
      const supplierName = (po.supplier?.name || '').toString().toLowerCase();
      const poCode = (po.code || '').toString().toLowerCase();

      const matchText = !q || supplierName.includes(q) || poCode.includes(q);
      const matchStatus = statusFilter === 'ALL' || (po.status || '').toString() === statusFilter;

      return matchText && matchStatus;
    });
  }, [purchaseOrders, searchText, statusFilter]);

  return (
    <div className="border rounded-md">
      <div className="flex justify-between items-center p-4 flex-wrap gap-4">
        <input
          type="text"
          placeholder="ค้นหา Supplier / เลขที่ใบสั่งซื้อ"
          className="border px-2 py-1 rounded"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <div className="flex items-center gap-3 text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="poReceiptStatusFilter"
              value="ALL"
              checked={statusFilter === 'ALL'}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
            ทั้งหมด
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="poReceiptStatusFilter"
              value="PENDING"
              checked={statusFilter === 'PENDING'}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
            รอดำเนินการ
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="poReceiptStatusFilter"
              value="PARTIALLY_RECEIVED"
              checked={statusFilter === 'PARTIALLY_RECEIVED'}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
            รับบางส่วน
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="poReceiptStatusFilter"
              value="COMPLETED"
              checked={statusFilter === 'COMPLETED'}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
            จบกระบวนการ
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="poReceiptStatusFilter"
              value="CANCELLED"
              checked={statusFilter === 'CANCELLED'}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
            ยกเลิก
          </label>
        </div>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 text-left">#</th>
            <th className="px-4 py-2 text-left">วันที่</th>
            <th className="px-4 py-2 text-left">เลขที่ใบสั่งซื้อ</th>
            <th className="px-4 py-2 text-left">Supplier</th>
            <th className="px-4 py-2 text-left">สถานะ</th>
            <th className="px-4 py-2 text-left">การจัดการ</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr className="border-t">
              <td className="px-4 py-8 text-center text-gray-500" colSpan={6}>
                ไม่พบรายการใบสั่งซื้อ
              </td>
            </tr>
          ) : (
            filtered.map((po, index) => (
              <tr key={po.id} className="border-t">
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">
                  {po.createdAt ? new Date(po.createdAt).toLocaleDateString() : '-'}
                </td>
                <td className="px-4 py-2">{po.code}</td>
                <td className="px-4 py-2">{po.supplier?.name || '-'}</td>
                <td className="px-4 py-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadgeClass(
                      po.status
                    )}`}
                  >
                    {getStatusLabel(po.status)}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => navigate(`/pos/purchases/receipt/create/${po.id}`)}
                  >
                    ตรวจรับ
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PurchaseOrderReceiptTable;






