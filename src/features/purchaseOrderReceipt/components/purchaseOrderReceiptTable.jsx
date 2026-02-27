// PurchaseOrderReceiptTable
// ✅ ตารางรายการ PO ที่รอตรวจรับ (Step 2)
// - Search (Supplier/PO Code)
// - Status filter (radio)
// - ปุ่ม "ตรวจรับ" นำทางไปหน้า create receipt
// - รองรับ loading/empty state

import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const formatDateTh = (value) => {
  try {
    if (!value) return '-';
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return '-';
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d);
  } catch {
    return '-';
  }
};

const normalizeStatus = (status) => String(status || '').toUpperCase();

const getStatusLabel = (statusRaw) => {
  const s = normalizeStatus(statusRaw);
  if (s === 'PENDING') return 'รอดำเนินการ';
  if (s === 'PARTIALLY_RECEIVED') return 'รับบางส่วน';
  if (s === 'COMPLETED' || s === 'RECEIVED') return 'จบกระบวนการ';
  if (s === 'CANCELLED' || s === 'CANCELED') return 'ยกเลิก';
  return statusRaw || '-';
};

const getStatusBadgeClass = (statusRaw) => {
  const s = normalizeStatus(statusRaw);
  if (s === 'PENDING') return 'bg-slate-100 text-slate-700';
  if (s === 'PARTIALLY_RECEIVED') return 'bg-amber-100 text-amber-800';
  if (s === 'COMPLETED' || s === 'RECEIVED') return 'bg-emerald-100 text-emerald-800';
  if (s === 'CANCELLED' || s === 'CANCELED') return 'bg-rose-100 text-rose-800';
  return 'bg-gray-100 text-gray-700';
};

const canReceive = (po) => {
  const s = normalizeStatus(po?.status);
  // ✅ ตรวจรับได้เฉพาะ PO ที่ยังไม่จบ/ไม่ยกเลิก
  return s === 'PENDING' || s === 'PARTIALLY_RECEIVED';
};

const PurchaseOrderReceiptTable = ({ purchaseOrders, loading }) => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = useMemo(() => {
    const list = Array.isArray(purchaseOrders) ? purchaseOrders : [];
    const q = String(searchText || '').trim().toLowerCase();

    return list.filter((po) => {
      const supplierName = String(po?.supplier?.name || '').toLowerCase();
      const poCode = String(po?.code || '').toLowerCase();

      const matchText = !q || supplierName.includes(q) || poCode.includes(q);
      const matchStatus =
        statusFilter === 'ALL' || normalizeStatus(po?.status) === normalizeStatus(statusFilter);

      return matchText && matchStatus;
    });
  }, [purchaseOrders, searchText, statusFilter]);

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="flex justify-between items-center p-4 flex-wrap gap-4 bg-white border-b">
        <Input
          placeholder="ค้นหา Supplier / เลขที่ใบสั่งซื้อ"
          className="w-[260px]"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <div className="flex items-center gap-3 text-sm flex-wrap">
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
          <tr className="bg-gray-50">
            <th className="px-4 py-2 text-left">#</th>
            <th className="px-4 py-2 text-left">วันที่</th>
            <th className="px-4 py-2 text-left">เลขที่ใบสั่งซื้อ</th>
            <th className="px-4 py-2 text-left">Supplier</th>
            <th className="px-4 py-2 text-left">สถานะ</th>
            <th className="px-4 py-2 text-left">การจัดการ</th>
          </tr>
        </thead>

        <tbody>
          {loading && (
            <tr>
              <td className="px-4 py-6" colSpan={6}>
                กำลังโหลด...
              </td>
            </tr>
          )}

          {!loading && filtered.length === 0 && (
            <tr className="border-t">
              <td className="px-4 py-8 text-center text-gray-500" colSpan={6}>
                ไม่พบรายการใบสั่งซื้อ
              </td>
            </tr>
          )}

          {!loading &&
            filtered.map((po, index) => {
              const disabled = !canReceive(po);
              return (
                <tr key={po.id} className="border-t">
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">{formatDateTh(po?.createdAt)}</td>
                  <td className="px-4 py-2">{po?.code || '-'}</td>
                  <td className="px-4 py-2">{po?.supplier?.name || '-'}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${getStatusBadgeClass(
                        po?.status
                      )}`}
                    >
                      {getStatusLabel(po?.status)}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <Button
                      variant="default"
                      size="sm"
                      disabled={disabled}
                      onClick={() => {
                        if (disabled) return;
                        navigate(`/pos/purchases/receipt/create/${po.id}`);
                      }}
                    >
                      ตรวจรับ
                    </Button>
                    {disabled && (
                      <span className="ml-2 text-xs text-gray-400">ตรวจรับได้เฉพาะ PO ที่ยังไม่จบ/ไม่ยกเลิก</span>
                    )}
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
};

export default PurchaseOrderReceiptTable;
