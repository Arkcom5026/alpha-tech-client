import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  Calendar,
  ClipboardCheck,
  FileText,
  Search,
  SlidersHorizontal,
  User,
  XCircle,
} from 'lucide-react';

import { cancelPurchaseOrder } from '@/features/purchaseOrder/lifecycle';
import { ConfirmActionDialog, feedback } from '@/design-system';
import usePurchaseOrderReceiptStore from '../store/purchaseOrderReceiptStore';
import ReceiptStatusBadge from './ReceiptStatusBadge';

const STATUS_FILTERS = [
  { value: 'ALL', label: 'ทั้งหมด' },
  { value: 'PENDING', label: 'รอดำเนินการ' },
  { value: 'PARTIALLY_RECEIVED', label: 'รับบางส่วน' },
  { value: 'COMPLETED', label: 'เสร็จสมบูรณ์' },
];

const normalizeStatus = (status) => String(status || '').toUpperCase();

const formatDateTh = (value) => {
  if (!value) return '-';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};

const canReceive = (purchaseOrder) => {
  const status = normalizeStatus(purchaseOrder?.status);
  return status === 'PENDING' || status === 'PARTIALLY_RECEIVED';
};

const ReceiptActions = ({ purchaseOrder, isCanceling, onReceive, onCancel }) => {
  const receiveEnabled = canReceive(purchaseOrder);
  const canCancel = receiveEnabled;
  const code = purchaseOrder?.code || purchaseOrder?.poNumber || '-';

  return (
    <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
      <button
        type="button"
        disabled={!receiveEnabled || isCanceling}
        onClick={() => onReceive(purchaseOrder.id)}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-teal-700 bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
      >
        <ClipboardCheck className="h-4 w-4" />
        ตรวจรับ
      </button>

      {canCancel ? (
        <button
          type="button"
          disabled={isCanceling}
          onClick={() => onCancel(purchaseOrder.id, code)}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <XCircle className="h-4 w-4" />
          {isCanceling ? 'กำลังยกเลิก' : 'ยกเลิก'}
        </button>
      ) : (
        <div className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 text-sm font-medium text-slate-500">
          <AlertCircle className="h-4 w-4" />
          ปิดรายการแล้ว
        </div>
      )}
    </div>
  );
};

export default function PurchaseOrderReceiptTable({ purchaseOrders, loading }) {
  const navigate = useNavigate();
  const { shopSlug } = useParams();
  const { fetchPurchaseOrdersForReceiptAction } = usePurchaseOrderReceiptStore();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [cancelingId, setCancelingId] = useState(null);
  const [pendingCancel, setPendingCancel] = useState(null);

  const filtered = useMemo(() => {
    const list = Array.isArray(purchaseOrders) ? purchaseOrders : [];
    const query = String(searchText || '').trim().toLowerCase();

    return list.filter((purchaseOrder) => {
      const supplierName = String(purchaseOrder?.supplier?.name || '').toLowerCase();
      const code = String(purchaseOrder?.code || purchaseOrder?.poNumber || '').toLowerCase();
      const matchesQuery = !query || supplierName.includes(query) || code.includes(query);
      const matchesStatus =
        statusFilter === 'ALL' || normalizeStatus(purchaseOrder?.status) === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [purchaseOrders, searchText, statusFilter]);

  const handleReceive = (id) => {
    const targetSlug = shopSlug || 'advancetech';
    navigate(`/${targetSlug}/pos/purchases/receipt/create/${id}`);
  };

  const handleCancel = (id, code) => {
    setPendingCancel({ id, code });
  };

  const confirmCancel = async () => {
    if (!pendingCancel) return;
    const { id, code } = pendingCancel;
    try {
      setCancelingId(id);
      await cancelPurchaseOrder(id);
      await fetchPurchaseOrdersForReceiptAction({ shopSlug: shopSlug || 'advancetech' });
      feedback.success(`ยกเลิกใบสั่งซื้อ ${code} สำเร็จ`);
      setPendingCancel(null);
    } catch (error) {
      feedback.error(error, {
        fallback: 'ไม่สามารถยกเลิกเอกสารได้ กรุณาลองใหม่อีกครั้ง',
      });
    } finally {
      setCancelingId(null);
    }
  };

  return (
    <>
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-label="รายการตรวจรับสินค้า">
      <div className="space-y-4 border-b border-slate-200 bg-slate-50 p-4 lg:flex lg:items-center lg:justify-between lg:space-y-0">
        <div className="relative w-full lg:max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            aria-label="ค้นหาใบสั่งซื้อที่รอตรวจรับ"
            placeholder="ค้นหา Supplier หรือเลขที่ใบสั่งซื้อ"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            className="min-h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0" aria-label="ตัวกรองสถานะใบสั่งซื้อ">
          <span className="inline-flex min-h-11 shrink-0 items-center gap-2 px-1 text-sm font-medium text-slate-500">
            <SlidersHorizontal className="h-4 w-4" /> ตัวกรอง
          </span>
          {STATUS_FILTERS.map((filter) => {
            const active = statusFilter === filter.value;
            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setStatusFilter(filter.value)}
                className={`min-h-11 shrink-0 rounded-xl border px-4 text-sm font-semibold transition ${
                  active
                    ? 'border-teal-300 bg-teal-100 text-teal-900'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div role="status" className="flex min-h-40 items-center justify-center gap-3 p-6 text-sm font-medium text-slate-500">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
          กำลังโหลดรายการตรวจรับสินค้า
        </div>
      ) : filtered.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-slate-300" />
          <h2 className="mt-3 text-base font-semibold text-slate-900">ไม่พบรายการที่ตรงกับเงื่อนไข</h2>
          <p className="mt-1 text-sm text-slate-500">ลองเปลี่ยนคำค้นหาหรือตัวกรองสถานะ</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 p-3 md:hidden">
            {filtered.map((purchaseOrder) => {
              const code = purchaseOrder?.code || purchaseOrder?.poNumber || '-';
              return (
                <article key={purchaseOrder.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-500">เลขที่ใบสั่งซื้อ</p>
                      <h2 className="mt-1 break-all text-base font-bold text-slate-950">{code}</h2>
                    </div>
                    <ReceiptStatusBadge status={purchaseOrder?.status} />
                  </div>

                  <dl className="mt-4 space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <User className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <div className="min-w-0">
                        <dt className="text-xs text-slate-500">Supplier</dt>
                        <dd className="break-words font-semibold text-slate-800">{purchaseOrder?.supplier?.name || '-'}</dd>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <div>
                        <dt className="text-xs text-slate-500">วันที่ออกเอกสาร</dt>
                        <dd className="font-semibold text-slate-800">{formatDateTh(purchaseOrder?.createdAt)}</dd>
                      </div>
                    </div>
                  </dl>

                  <div className="mt-4 border-t border-slate-200 pt-4">
                    <ReceiptActions
                      purchaseOrder={purchaseOrder}
                      isCanceling={cancelingId === purchaseOrder.id}
                      onReceive={handleReceive}
                      onCancel={handleCancel}
                    />
                  </div>
                </article>
              );
            })}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500">
                  <th className="px-5 py-4">วันที่ออกเอกสาร</th>
                  <th className="px-5 py-4">เลขที่ใบสั่งซื้อ</th>
                  <th className="px-5 py-4">Supplier</th>
                  <th className="px-5 py-4 text-center">สถานะ</th>
                  <th className="px-5 py-4 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((purchaseOrder) => (
                  <tr key={purchaseOrder.id} className="transition hover:bg-teal-50/40">
                    <td className="px-5 py-4 text-sm font-medium text-slate-500">{formatDateTh(purchaseOrder?.createdAt)}</td>
                    <td className="px-5 py-4 text-sm font-bold text-slate-950">{purchaseOrder?.code || purchaseOrder?.poNumber || '-'}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-700">{purchaseOrder?.supplier?.name || '-'}</td>
                    <td className="px-5 py-4 text-center"><ReceiptStatusBadge status={purchaseOrder?.status} /></td>
                    <td className="px-5 py-4">
                      <ReceiptActions
                        purchaseOrder={purchaseOrder}
                        isCanceling={cancelingId === purchaseOrder.id}
                        onReceive={handleReceive}
                        onCancel={handleCancel}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
    <ConfirmActionDialog
      open={Boolean(pendingCancel)}
      title="ยืนยันการยกเลิกใบสั่งซื้อ"
      description={pendingCancel ? `ใบสั่งซื้อ ${pendingCancel.code} จะไม่สามารถนำมาตรวจรับสินค้าได้อีก` : ''}
      confirmLabel="ยืนยันยกเลิก"
      loadingLabel="กำลังยกเลิก..."
      intent="destructive"
      loading={Boolean(cancelingId)}
      onConfirm={confirmCancel}
      onClose={() => {
        if (!cancelingId) setPendingCancel(null);
      }}
    />
    </>
  );
}
