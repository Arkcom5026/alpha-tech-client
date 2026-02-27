// ../components/purchaseOrderListTable

import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StandardActionButtons from '@/components/shared/buttons/StandardActionButtons';
import usePurchaseOrderStore from '../store/purchaseOrderStore';

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

  // ✅ keep mapping minimal & safe; extend later if you add more statuses
  if (status === 'PENDING') return { label: 'รอดำเนินการ', className: 'bg-slate-100 text-slate-700' };
  if (status === 'PARTIALLY_RECEIVED')
    return { label: 'รับแล้วบางส่วน', className: 'bg-amber-100 text-amber-800' };
  if (status === 'COMPLETED' || status === 'RECEIVED')
    return { label: 'รับครบแล้ว', className: 'bg-emerald-100 text-emerald-800' };
  if (status === 'CANCELLED' || status === 'CANCELED')
    return { label: 'ยกเลิก', className: 'bg-rose-100 text-rose-800' };

  return { label: statusRaw || '-', className: 'bg-gray-100 text-gray-700' };
};

const canDeletePO = (po) => {
  const status = String(po?.status || '').toUpperCase();
  // ✅ guardrail: delete only when still pending (no receipt yet)
  return status === 'PENDING';
};

const PurchaseOrderListTable = ({ purchaseOrders, loading }) => {
  const navigate = useNavigate();
  const { removePurchaseOrderAction } = usePurchaseOrderStore();

  const [uiError, setUiError] = useState(null);
  const [uiInfo, setUiInfo] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const rows = useMemo(() => (Array.isArray(purchaseOrders) ? purchaseOrders : []), [purchaseOrders]);

  const handleEdit = (id) => {
    setUiError(null);
    setUiInfo(null);
    navigate(`/pos/purchases/orders/edit/${id}`);
  };

  const handleDelete = async (po) => {
    setUiError(null);
    setUiInfo(null);

    if (!po?.id) return;

    if (!canDeletePO(po)) {
      setUiError('ไม่สามารถลบใบสั่งซื้อที่เริ่มตรวจรับ/รับสินค้าแล้วได้');
      return;
    }

    try {
      setDeletingId(po.id);
      await removePurchaseOrderAction(po.id);
      setUiInfo(`ลบใบสั่งซื้อ ${po.code || ''} สำเร็จ`);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'ลบใบสั่งซื้อไม่สำเร็จ';
      setUiError(String(msg));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="border rounded-md overflow-hidden">
      {(uiError || uiInfo) && (
        <div className="p-3 border-b bg-white">
          {uiError && <div className="text-sm text-rose-700">{uiError}</div>}
          {!uiError && uiInfo && <div className="text-sm text-emerald-700">{uiInfo}</div>}
        </div>
      )}

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
              <td className="px-4 py-3" colSpan={6}>
                กำลังโหลด...
              </td>
            </tr>
          )}

          {!loading && rows.length === 0 && (
            <tr>
              <td className="px-4 py-3 text-gray-500" colSpan={6}>
                ไม่พบรายการ
              </td>
            </tr>
          )}

          {!loading &&
            rows.map((po, index) => {
              const statusMeta = getStatusMeta(po?.status);
              const isDeleting = deletingId === po?.id;

              return (
                <tr key={po.id} className="border-t">
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">{formatDateTh(po?.createdAt)}</td>
                  <td className="px-4 py-2">{po?.code || '-'}</td>
                  <td className="px-4 py-2">{po?.supplier?.name || '-'}</td>
                  <td className="px-4 py-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusMeta.className}`}>
                      {statusMeta.label}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <StandardActionButtons
                      showEdit
                      showDelete
                      onEdit={() => handleEdit(po.id)}
                      // ✅ no dialog confirm (policy); show inline message instead
                      onDelete={isDeleting ? undefined : () => handleDelete(po)}
                      // If StandardActionButtons supports disabled props, you can wire it later.
                    />
                    {isDeleting && <span className="ml-2 text-xs text-gray-500">กำลังลบ...</span>}
                    {!canDeletePO(po) && (
                      <span className="ml-2 text-xs text-gray-400">ลบได้เฉพาะสถานะ “รอดำเนินการ”</span>
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

export default PurchaseOrderListTable;
