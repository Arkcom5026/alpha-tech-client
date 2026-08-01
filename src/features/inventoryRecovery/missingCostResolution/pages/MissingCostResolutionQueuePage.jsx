import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, RefreshCw, Search } from 'lucide-react';
import { useMissingCostResolutionQueue } from '../hooks/useMissingCostResolutionRead';

const STATUS_OPTIONS = [
  ['', 'ทุกสถานะ'],
  ['DRAFT', 'ฉบับร่าง'],
  ['SUBMITTED', 'รอตรวจสอบ'],
  ['UNDER_REVIEW', 'กำลังตรวจสอบ'],
  ['RETURNED_FOR_CORRECTION', 'ส่งกลับแก้ไข'],
  ['APPROVED', 'อนุมัติแล้ว'],
  ['REJECTED', 'ปฏิเสธ'],
  ['CANCELLED', 'ยกเลิก'],
];

const statusLabel = Object.fromEntries(STATUS_OPTIONS);

const formatNumber = (value) => new Intl.NumberFormat('th-TH', {
  maximumFractionDigits: 2,
}).format(Number(value || 0));

const MissingCostResolutionQueuePage = () => {
  const { shopSlug } = useParams();
  const [status, setStatus] = useState('');
  const [productId, setProductId] = useState('');
  const filters = useMemo(() => ({ status, productId }), [status, productId]);
  const query = useMissingCostResolutionQueue(filters);
  const data = query.data;
  const candidates = data?.candidates || [];

  return (
    <section className="space-y-5">
      <header className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-600">Inventory Recovery</p>
            <h1 className="mt-2 text-2xl font-black text-slate-900 md:text-3xl">รายการสินค้าที่ต้นทุนขาด</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">ตรวจสอบรายการตามสาขาปัจจุบัน จัดเตรียมหลักฐาน และติดตามสถานะการแก้ไขโดยไม่แก้ StockBalance โดยตรง</p>
          </div>
          <button
            type="button"
            onClick={() => query.refetch()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className={`h-4 w-4 ${query.isFetching ? 'animate-spin' : ''}`} />
            โหลดใหม่
          </button>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-[220px_minmax(0,1fr)]">
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500"
          >
            {STATUS_OPTIONS.map(([value, label]) => <option key={value || 'all'} value={value}>{label}</option>)}
          </select>
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 focus-within:border-blue-500">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={productId}
              onChange={(event) => setProductId(event.target.value.replace(/\D/g, ''))}
              placeholder="ค้นหาด้วย Product ID"
              className="min-w-0 flex-1 bg-transparent py-2.5 text-sm outline-none"
            />
          </label>
        </div>
      </header>

      {query.isLoading && (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">กำลังโหลดรายการ...</div>
      )}

      {query.isError && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
          <div className="flex items-center gap-2 font-bold"><AlertTriangle className="h-5 w-5" />ไม่สามารถโหลดรายการได้</div>
          <p className="mt-2 text-sm">{query.error?.friendlyMessage || query.error?.response?.data?.message || query.error?.message}</p>
        </div>
      )}

      {!query.isLoading && !query.isError && candidates.length === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="font-bold text-slate-700">ไม่พบรายการตามตัวกรองนี้</p>
          <p className="mt-1 text-sm text-slate-500">รายการจากสาขาอื่นจะไม่ถูกเปิดเผยในหน้านี้</p>
        </div>
      )}

      {candidates.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          {candidates.map((item) => (
            <Link
              key={item.candidateId}
              to={`/${shopSlug}/pos/stock/missing-cost-resolutions/${item.candidateId}`}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Resolution #{item.candidateId}</p>
                  <h2 className="mt-1 text-lg font-black text-slate-900">Product #{item.productId}</h2>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{statusLabel[item.status] || item.status}</span>
              </div>
              <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-slate-50 p-3">
                  <dt className="text-slate-500">จำนวนคงเหลือ</dt>
                  <dd className="mt-1 text-lg font-black text-slate-900">{formatNumber(item.quantity)}</dd>
                </div>
                <div className="rounded-2xl bg-amber-50 p-3">
                  <dt className="text-amber-700">ต้นทุนที่มีอยู่</dt>
                  <dd className="mt-1 text-lg font-black text-amber-900">{item.currentCostEvidence?.avgCost == null ? 'ไม่มีข้อมูล' : formatNumber(item.currentCostEvidence.avgCost)}</dd>
                </div>
              </dl>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};

export default MissingCostResolutionQueuePage;
