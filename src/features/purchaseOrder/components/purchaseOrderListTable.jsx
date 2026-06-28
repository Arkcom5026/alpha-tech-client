// src/features/purchaseOrder/components/purchaseOrderListTable.jsx

import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; 
import StandardActionButtons from '@/components/shared/buttons/StandardActionButtons';
import { usePurchaseOrderStore } from '../store/purchaseOrderStore';

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

const getStatusMeta = (statusRaw) => {
  const status = String(statusRaw || '').toUpperCase();

  if (status === 'PENDING') return { label: 'รอดำเนินการ', className: 'bg-slate-100 text-slate-700 border-slate-200' };
  if (status === 'PARTIALLY_RECEIVED') return { label: 'รับแล้วบางส่วน', className: 'bg-amber-50 text-amber-700 border-amber-200/50' };
  if (status === 'COMPLETED' || status === 'RECEIVED') return { label: 'เสร็จสมบูรณ์', className: 'bg-emerald-50 text-emerald-700 border-emerald-200/50' };
  if (status === 'CANCELLED' || status === 'CANCELED') return { label: 'ยกเลิกเอกสาร', className: 'bg-rose-50 text-rose-700 border-rose-200/50' };

  return { label: statusRaw || '-', className: 'bg-gray-100 text-gray-700' };
};

const PurchaseOrderListTable = ({ purchaseOrders, loading }) => {
  const navigate = useNavigate();
  const { shopSlug } = useParams();
  const targetSlug = shopSlug || 'advancetech';

  const { removePurchaseOrderAction } = usePurchaseOrderStore();

  const [uiError, setUiError] = useState(null);
  const [uiInfo, setUiInfo] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const rows = useMemo(() => (Array.isArray(purchaseOrders) ? purchaseOrders : []), [purchaseOrders]);

  const handleEdit = (id) => {
    setUiError(null);
    setUiInfo(null);
    navigate(`/${targetSlug}/pos/purchases/orders/edit/${id}`);
  };

  const handleDelete = async (po) => {
    setUiError(null);
    setUiInfo(null);

    if (!po?.id) return;
    const currentStatus = String(po?.status || '').toUpperCase();
    
    if (currentStatus !== 'PENDING') {
      setUiError('ความปลอดภัยระบบ: ปฏิเสธการลบเนื่องจากเอกสาร PO นี้เริ่มกระบวนการตรวจรับแล้ว');
      return;
    }

    if (!window.confirm(`คุณต้องการลบเอกสารใบสั่งซื้อเลขที่ ${po.code || ''} ใช่หรือไม่?`)) {
      return;
    }

    try {
      setDeletingId(po.id);
      // 🚀 เคลียร์สเตตฝั่งบีอีผ่าน apiClient พอร์ต 5000 อัตโนมัติ
      await removePurchaseOrderAction(po.id);
      setUiInfo(`ลบใบสั่งซื้อ ${po.code || ''} ออกจากคลังเรียบร้อยแล้ว`);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'ลบใบสั่งซื้อไม่สำเร็จ';
      setUiError(String(msg));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm animate-fadeIn">
      {(uiError || uiInfo) && (
        <div className="p-3 border-b border-slate-100 px-4 font-bold text-xs">
          {uiError && <div className="text-rose-600 bg-rose-50 border border-rose-100 p-2 rounded-xl">⚠️ ข้อขัดข้อง: {uiError}</div>}
          {!uiError && uiInfo && <div className="text-emerald-600 bg-emerald-50 border border-emerald-100 p-2 rounded-xl">✅ สำเร็จ: {uiInfo}</div>}
        </div>
      )}

      <div className="w-full overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-black uppercase select-none">
              <th className="px-4 py-3 w-[50px]">#</th>
              <th className="px-4 py-3">วันที่ออกเอกสาร</th>
              <th className="px-4 py-3">เลขที่ใบสั่งซื้อ (PO Code)</th>
              <th className="px-4 py-3">คู่ค้าจัดซื้อ (Supplier)</th>
              <th className="px-4 py-3 text-center w-[120px]">สถานะ</th>
              <th className="px-4 py-3 text-center w-[130px]">การจัดการ</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td className="px-4 py-8 text-center text-slate-400 font-bold italic animate-pulse" colSpan={6}>
                  กำลังประมวลผลดึงโครงสร้างประวัติจัดซื้อเรียลไทม์...
                </td>
              </tr>
            )}

            {!loading && rows.length === 0 && (
              <tr>
                <td className="px-4 py-10 text-center text-slate-400 font-bold italic" colSpan={6}>
                  ไม่พบเอกสารใบสั่งซื้อจัดคลังในเงื่อนไขปัจจุบัน
                </td>
              </tr>
            )}

            {!loading &&
              rows.map((po, index) => {
                const statusMeta = getStatusMeta(po?.status);
                const isDeleting = deletingId === po?.id;
                const isPending = String(po?.status || '').toUpperCase() === 'PENDING';

                return (
                  <tr key={po.id} className="hover:bg-slate-50/40 transition-colors duration-150 group">
                    <td className="px-4 py-3 font-bold text-slate-400">{index + 1}</td>
                    <td className="px-4 py-3 font-medium text-slate-500">{formatDateTh(po?.createdAt)}</td>
                    <td className="px-4 py-3 font-black text-slate-900 group-hover:text-orange-500 transition-colors tracking-tight">{po?.code || '-'}</td>
                    <td className="px-4 py-3 font-bold text-slate-700">{po?.supplier?.name || '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-black border ${statusMeta.className}`}>
                        {statusMeta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <StandardActionButtons
                          showEdit={isPending}
                          showDelete={isPending}
                          onEdit={() => handleEdit(po.id)}
                          onDelete={isDeleting ? undefined : () => handleDelete(po)}
                        />
                        {isDeleting && <span className="text-[10px] text-slate-400 font-bold animate-pulse">กำลังลบ...</span>}
                        {!isPending && (
                          <span className="text-[10px] text-slate-400 font-bold bg-slate-50 border px-2 py-0.5 rounded-md select-none">
                            คุมคลังแล้ว
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PurchaseOrderListTable;