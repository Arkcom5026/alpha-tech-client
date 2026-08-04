import React from 'react';
import { BUSINESS_TYPE_OPTIONS, getBusinessTypeLabel } from '../utils/businessType';
import useCanonicalProductGroups from '../hooks/useCanonicalProductGroups';

const REVIEW_STATUS = {
  READY: 'READY',
  PRODUCT_TYPE_REVIEW_REQUIRED: 'PRODUCT_TYPE_REVIEW_REQUIRED',
};

const REVIEW_OPTIONS = [
  ['', 'ทุกสถานะ'],
  [REVIEW_STATUS.READY, 'พร้อมตรวจ'],
  [REVIEW_STATUS.PRODUCT_TYPE_REVIEW_REQUIRED, 'ต้องตรวจ Product Type'],
];

const statusLabel = (status) =>
  status === REVIEW_STATUS.READY ? 'พร้อมตรวจ' : 'ต้องตรวจ Product Type';

const statusClass = (status) =>
  status === REVIEW_STATUS.READY
    ? 'bg-emerald-50 text-emerald-700'
    : 'bg-amber-50 text-amber-700';

const CandidateReviewPage = () => {
  const { groups, summary, pagination, templateBranch, categoryId, loading, error, refresh } =
    useCanonicalProductGroups();
  const [filters, setFilters] = React.useState({
    businessType: '',
    reviewStatus: '',
    q: '',
    page: 1,
    pageSize: 30,
  });

  const load = React.useCallback(
    (next) => (next.businessType ? refresh(next) : Promise.resolve(null)),
    [refresh]
  );

  const selectBusinessType = (businessType) => {
    const next = { ...filters, businessType, reviewStatus: '', q: '', page: 1 };
    setFilters(next);
    load(next);
  };

  const apply = (next) => {
    setFilters(next);
    load(next);
  };

  const page = pagination?.page || filters.page;
  const totalPages = Math.max(pagination?.totalPages || 1, 1);
  const totalGroups = summary?.totalGroups ?? pagination?.total ?? groups.length;
  const ready = summary?.ready ?? 0;
  const reviewRequired = summary?.productTypeReviewRequired ?? 0;

  return (
    <div className="min-h-screen space-y-5 bg-slate-50 p-4 xl:p-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-orange-500">Platform Product Knowledge</p>
        <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Canonical Product Group Review</h1>
            <p className="mt-2 max-w-3xl text-sm font-medium text-slate-500">ตรวจสินค้าเป็นกลุ่มกลางข้ามร้าน ลด Candidate ซ้ำ และเตรียมข้อมูลก่อนสร้าง Product Template ของแพลตฟอร์ม</p>
          </div>
          <button type="button" disabled={!filters.businessType || loading} onClick={() => load(filters)} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-black text-slate-700 disabled:opacity-40">
            {loading ? 'กำลังโหลด...' : 'รีเฟรชกลุ่ม'}
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-orange-200 bg-orange-50/60 p-5 shadow-sm">
        <p className="text-[11px] font-black uppercase tracking-[0.14em] text-orange-600">Business Type Scope</p>
        <h2 className="mt-1 text-lg font-black text-slate-900">เลือกกลุ่มธุรกิจที่ต้องการตรวจ</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {BUSINESS_TYPE_OPTIONS.map((item) => (
            <button key={item.value} type="button" onClick={() => selectBusinessType(item.value)} className={`rounded-2xl border px-4 py-2.5 text-sm font-black transition ${filters.businessType === item.value ? 'border-orange-500 bg-orange-500 text-white' : 'border-orange-200 bg-white text-slate-700'}`}>
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {filters.businessType && (
        <>
          <section className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
            {[
              ['กลุ่มทั้งหมด', totalGroups],
              ['พร้อมตรวจ', ready],
              ['ต้องตรวจ Product Type', reviewRequired],
              ['Template Branch', templateBranch?.branchCode || '-'],
              ['Category ID', categoryId || '-'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">{label}</p>
                <p className="mt-2 text-2xl font-black text-slate-900">{value}</p>
              </div>
            ))}
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <form onSubmit={(event) => { event.preventDefault(); apply({ ...filters, page: 1 }); }} className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_240px_130px]">
              <input value={filters.q} onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))} placeholder="ค้นหาชื่อสินค้า แบรนด์ Fingerprint หรือร้าน..." className="min-h-11 rounded-2xl border border-slate-200 px-4 text-sm font-semibold outline-none focus:border-orange-400" />
              <select value={filters.reviewStatus} onChange={(event) => apply({ ...filters, reviewStatus: event.target.value, page: 1 })} className="min-h-11 rounded-2xl border border-slate-200 px-4 text-sm font-bold text-slate-700">
                {REVIEW_OPTIONS.map(([value, label]) => <option key={value || 'ALL'} value={value}>{label}</option>)}
              </select>
              <button type="submit" disabled={loading} className="rounded-2xl bg-slate-950 px-5 text-sm font-black text-white disabled:opacity-50">ค้นหา</button>
            </form>
          </section>

          {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error.message || String(error)}</div>}

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="grid grid-cols-[1.5fr_180px_130px_130px_190px] gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3 text-[11px] font-black uppercase tracking-[0.1em] text-slate-500">
              <div>Canonical Group</div><div>Product Type</div><div>Products</div><div>Stores</div><div>Review Status</div>
            </div>
            {loading && groups.length === 0 ? (
              <div className="p-10 text-center text-sm font-bold text-slate-500">กำลังโหลด Canonical Groups...</div>
            ) : groups.length === 0 ? (
              <div className="p-10 text-center text-sm font-bold text-slate-500">ไม่พบกลุ่มสินค้าใน {getBusinessTypeLabel(filters.businessType)}</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {groups.map((group) => (
                  <div key={group.groupFingerprint} className="grid grid-cols-[1.5fr_180px_130px_130px_190px] gap-3 px-4 py-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-slate-900">{group.canonicalName || '-'}</p>
                      <p className="mt-1 truncate text-xs font-semibold text-slate-500">{group.brandName || 'ไม่ระบุแบรนด์'}</p>
                      <p className="mt-1 truncate font-mono text-[10px] text-slate-400">{group.groupFingerprint}</p>
                    </div>
                    <div className="text-sm font-bold text-slate-600">{group.productTypeName || '-'}</div>
                    <div className="text-lg font-black text-slate-900">{group.sourceProductCount || 0}</div>
                    <div className="text-lg font-black text-slate-900">{group.sourceBranchCount || 0}</div>
                    <div>
                      <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-black ${statusClass(group.reviewStatus)}`}>{statusLabel(group.reviewStatus)}</span>
                      {(group.reviewReasons || []).length > 0 && <p className="mt-2 text-xs font-semibold text-amber-700">{group.reviewReasons.join(', ')}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-4 text-sm font-bold text-slate-600">
              <span>Page {page} / {totalPages} · {pagination?.total ?? groups.length} กลุ่ม</span>
              <div className="flex gap-2">
                <button type="button" disabled={page <= 1 || loading} onClick={() => apply({ ...filters, page: page - 1 })} className="rounded-2xl border border-slate-200 px-4 py-2 disabled:opacity-40">ก่อนหน้า</button>
                <button type="button" disabled={page >= totalPages || loading} onClick={() => apply({ ...filters, page: page + 1 })} className="rounded-2xl border border-slate-200 px-4 py-2 disabled:opacity-40">ถัดไป</button>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-blue-200 bg-blue-50 p-5 text-sm font-bold text-blue-800">PT-GR-01 เป็น Workspace แบบอ่านอย่างเดียว การสร้าง Template, Merge, Split, Ignore และ Link Product จะเปิดใน Increment ถัดไปหลังตรวจ Group Projection แล้ว</section>
        </>
      )}
    </div>
  );
};

export default CandidateReviewPage;
