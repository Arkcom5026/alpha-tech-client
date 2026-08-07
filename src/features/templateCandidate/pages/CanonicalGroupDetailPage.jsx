import React from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  getCanonicalProductGroupApi,
  materializeCanonicalProductGroupsApi,
} from '../api/templateCandidateApi';
import { getBusinessTypeLabel } from '../utils/businessType';

const statusLabel = (status) =>
  status === 'READY' ? 'พร้อมตรวจ' : 'ต้องตรวจ Product Type';

const statusClass = (status) =>
  status === 'READY'
    ? 'bg-emerald-50 text-emerald-700'
    : 'bg-amber-50 text-amber-700';

const CanonicalGroupDetailPage = () => {
  const navigate = useNavigate();
  const { groupKey } = useParams();
  const [searchParams] = useSearchParams();
  const businessType = searchParams.get('businessType') || '';
  const [detail, setDetail] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [materializing, setMaterializing] = React.useState(false);
  const [materializeResult, setMaterializeResult] = React.useState(null);
  const [materializeError, setMaterializeError] = React.useState(null);

  React.useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    getCanonicalProductGroupApi(groupKey, { businessType })
      .then((response) => {
        if (!active) return;
        setDetail(response?.data || response);
      })
      .catch((requestError) => {
        if (!active) return;
        setError(requestError);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [groupKey, businessType]);

  const materializeGroup = async () => {
    setMaterializing(true);
    setMaterializeError(null);
    setMaterializeResult(null);
    try {
      const response = await materializeCanonicalProductGroupsApi({
        businessType,
        apply: true,
        limit: 500,
        groupKey,
      });
      setMaterializeResult(response?.data || response);
    } catch (requestError) {
      setMaterializeError(requestError);
    } finally {
      setMaterializing(false);
    }
  };

  if (loading) {
    return <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm font-bold text-slate-500">กำลังโหลดรายละเอียด Canonical Group...</div>;
  }

  if (error || !detail) {
    return (
      <div className="space-y-4">
        <button type="button" onClick={() => navigate(-1)} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700">ย้อนกลับ</button>
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm font-bold text-red-700">{error?.message || 'ไม่พบ Canonical Group'}</div>
      </div>
    );
  }

  const group = detail.group || detail;
  const sourceProducts = group.sourceProducts || detail.sourceProducts || [];
  const sourceBranches = detail.sourceBranches || group.sourceBranches || [];
  const templateBranch = detail.templateBranch || null;
  const canMaterialize = group.reviewStatus === 'READY';

  return (
    <div className="min-h-screen space-y-5 bg-slate-50 p-4 xl:p-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <button type="button" onClick={() => navigate(-1)} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-black text-slate-700">← กลับไปหน้ากลุ่ม</button>
        <p className="mt-5 text-[11px] font-black uppercase tracking-[0.18em] text-orange-500">Product Template · Canonical Group Detail</p>
        <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-black text-slate-900">{group.canonicalName || '-'}</h1>
            <p className="mt-2 text-sm font-bold text-slate-500">มุมมองแบบอ่านอย่างเดียวสำหรับตรวจ Canonical Group ก่อนสร้าง Candidate</p>
            <p className="mt-2 text-sm font-bold text-slate-500">{group.canonicalBrandName || group.brandName || 'ไม่ระบุแบรนด์'}</p>
            <p className="mt-2 break-all font-mono text-xs text-slate-400">{group.groupKey || group.groupFingerprint || groupKey}</p>
          </div>
          <span className={`inline-flex rounded-full px-4 py-2 text-xs font-black ${statusClass(group.reviewStatus)}`}>{statusLabel(group.reviewStatus)}</span>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {[
          ['Business Type', getBusinessTypeLabel(detail.businessType || businessType)],
          ['Template Branch', templateBranch?.branchCode || '-'],
          ['Category ID', detail.categoryId || templateBranch?.categoryId || '-'],
          ['Source Products', group.sourceProductCount ?? sourceProducts.length],
          ['Source Stores', group.sourceBranchCount ?? sourceBranches.length],
        ].map(([label, value]) => (
          <div key={label} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">{label}</p>
            <p className="mt-2 text-xl font-black text-slate-900">{value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-orange-200 bg-orange-50 p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-orange-600">Candidate Materialization</p>
            <h2 className="mt-1 text-lg font-black text-slate-900">สร้าง Candidate สำหรับตรวจและสร้าง Product Template</h2>
            <p className="mt-2 text-sm font-semibold text-slate-600">ระบบจะสร้าง Candidate ผ่าน authority เดิมให้สินค้าต้นทางในกลุ่ม READY โดยไม่แก้สินค้า ราคา หรือสต๊อก</p>
          </div>
          <button type="button" disabled={!canMaterialize || materializing} onClick={materializeGroup} className="rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-40">
            {materializing ? 'กำลังสร้าง Candidates...' : 'สร้าง Candidates จากกลุ่มนี้'}
          </button>
        </div>
        {!canMaterialize && <p className="mt-3 text-sm font-bold text-amber-800">กลุ่มนี้ต้องแก้ Product Type ให้เป็น READY ก่อนจึงจะสร้าง Candidate ได้</p>}
        {materializeError && <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{materializeError.message || String(materializeError)}</div>}
        {materializeResult && (
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-4"><p className="text-xs font-black text-slate-400">CREATED</p><p className="mt-1 text-2xl font-black text-emerald-700">{materializeResult.created?.length || 0}</p></div>
            <div className="rounded-2xl bg-white p-4"><p className="text-xs font-black text-slate-400">SKIPPED</p><p className="mt-1 text-2xl font-black text-amber-700">{materializeResult.skipped?.length || 0}</p></div>
            <div className="rounded-2xl bg-white p-4"><p className="text-xs font-black text-slate-400">FAILED</p><p className="mt-1 text-2xl font-black text-red-700">{materializeResult.failed?.length || 0}</p></div>
          </div>
        )}
      </section>

      {(group.reviewReasons || []).length > 0 && (
        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-amber-700">Review Reasons</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {group.reviewReasons.map((reason) => <span key={reason} className="rounded-full bg-white px-3 py-1 text-xs font-black text-amber-800">{reason}</span>)}
          </div>
        </section>
      )}

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
          <h2 className="text-lg font-black text-slate-900">Source Products</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">สินค้าจริงของแต่ละร้านที่ระบบจัดอยู่ใน Canonical Group นี้</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-white text-[11px] font-black uppercase tracking-[0.1em] text-slate-500">
              <tr><th className="px-5 py-3">Product</th><th className="px-5 py-3">Store</th><th className="px-5 py-3">Product Type</th><th className="px-5 py-3">Brand</th><th className="px-5 py-3">Unit</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sourceProducts.map((product) => (
                <tr key={product.id}>
                  <td className="px-5 py-4"><p className="font-black text-slate-900">{product.name || '-'}</p><p className="mt-1 text-xs font-semibold text-slate-400">Product #{product.id}</p></td>
                  <td className="px-5 py-4"><p className="font-bold text-slate-700">{product.branchName || '-'}</p><p className="mt-1 text-xs text-slate-400">Branch #{product.branchId || '-'}</p></td>
                  <td className="px-5 py-4 font-bold text-slate-600">{product.productTypeName || '-'}</td>
                  <td className="px-5 py-4 font-bold text-slate-600">{product.brandName || '-'}</td>
                  <td className="px-5 py-4 font-bold text-slate-600">{product.unitName || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default CanonicalGroupDetailPage;
