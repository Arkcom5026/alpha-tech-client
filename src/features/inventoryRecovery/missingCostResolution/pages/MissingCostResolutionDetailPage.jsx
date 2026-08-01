import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, FileText, History } from 'lucide-react';
import {
  useMissingCostResolutionAuditHistory,
  useMissingCostResolutionDetail,
} from '../hooks/useMissingCostResolutionRead';
import MissingCostResolutionWorkflowPanel from '../components/MissingCostResolutionWorkflowPanel';
import MissingCostRecoveryPreviewPanel from '../components/MissingCostRecoveryPreviewPanel';

const formatNumber = (value) => new Intl.NumberFormat('th-TH', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
}).format(Number(value || 0));

const formatDate = (value) => value
  ? new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
  : '-';

const MissingCostResolutionDetailPage = () => {
  const { shopSlug, resolutionId } = useParams();
  const detailQuery = useMissingCostResolutionDetail(resolutionId);
  const auditQuery = useMissingCostResolutionAuditHistory(resolutionId);
  const detail = detailQuery.data;
  const resolution = detail?.resolution;
  const candidate = detail?.candidate;

  if (detailQuery.isLoading) return <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">กำลังโหลดรายละเอียด...</div>;

  if (detailQuery.isError) {
    const status = detailQuery.error?.response?.status;
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
        <div className="flex items-center gap-2 font-bold"><AlertTriangle className="h-5 w-5" />{status === 404 ? 'ไม่พบรายการในสาขาปัจจุบัน' : 'ไม่สามารถโหลดรายละเอียดได้'}</div>
        <p className="mt-2 text-sm">{detailQuery.error?.friendlyMessage || detailQuery.error?.response?.data?.message || detailQuery.error?.message}</p>
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <Link to={`/${shopSlug}/pos/stock/missing-cost-resolutions`} className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-700"><ArrowLeft className="h-4 w-4" />กลับรายการต้นทุนขาด</Link>
      <header className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-600">Resolution #{resolution?.id}</p><h1 className="mt-2 text-2xl font-black text-slate-900 md:text-3xl">{resolution?.product?.name || `Product #${candidate?.productId}`}</h1><p className="mt-2 text-sm text-slate-600">สถานะปัจจุบัน: <span className="font-bold text-slate-900">{resolution?.status}</span></p></div>
          <span className="self-start rounded-full bg-slate-100 px-4 py-2 text-xs font-black text-slate-700">Version {resolution?.currentVersion}</span>
        </div>
        <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-slate-50 p-4"><dt className="text-xs font-bold text-slate-500">สาขา</dt><dd className="mt-1 text-lg font-black">#{resolution?.branchId}</dd></div>
          <div className="rounded-2xl bg-slate-50 p-4"><dt className="text-xs font-bold text-slate-500">จำนวนคงเหลือ</dt><dd className="mt-1 text-lg font-black">{formatNumber(candidate?.quantity)}</dd></div>
          <div className="rounded-2xl bg-amber-50 p-4"><dt className="text-xs font-bold text-amber-700">ต้นทุนเฉลี่ยปัจจุบัน</dt><dd className="mt-1 text-lg font-black text-amber-900">{candidate?.currentCostEvidence?.avgCost == null ? 'ไม่มีข้อมูล' : formatNumber(candidate.currentCostEvidence.avgCost)}</dd></div>
          <div className="rounded-2xl bg-slate-50 p-4"><dt className="text-xs font-bold text-slate-500">อัปเดตล่าสุด</dt><dd className="mt-1 text-sm font-bold">{formatDate(resolution?.updatedAt)}</dd></div>
        </dl>
      </header>
      <MissingCostResolutionWorkflowPanel detail={detail} />
      <MissingCostRecoveryPreviewPanel resolution={resolution} />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex items-center gap-2"><FileText className="h-5 w-5 text-blue-600" /><h2 className="text-lg font-black text-slate-900">หลักฐานต้นทุน</h2></div>
          <div className="mt-5 space-y-4">
            {(resolution?.evidenceVersions || []).length === 0 && <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">ยังไม่มีหลักฐานต้นทุน</p>}
            {(resolution?.evidenceVersions || []).map((version) => <div key={version.id} className="rounded-2xl border border-slate-200 p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold text-slate-400">Version {version.version}</p><p className="mt-1 font-black text-slate-900">{version.sourceType || 'ไม่ระบุประเภทหลักฐาน'}</p></div><span className="text-lg font-black text-blue-700">{version.proposedUnitCost == null ? '-' : `${formatNumber(version.proposedUnitCost)} บาท`}</span></div><p className="mt-3 text-sm text-slate-600">{version.evidenceSummary || version.rationale || 'ไม่มีรายละเอียดเพิ่มเติม'}</p><div className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-2"><span>อ้างอิง: {version.sourceReference || '-'}</span><span>สร้างเมื่อ: {formatDate(version.createdAt)}</span></div></div>)}
          </div>
        </article>
        <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex items-center gap-2"><History className="h-5 w-5 text-violet-600" /><h2 className="text-lg font-black text-slate-900">ประวัติการดำเนินการ</h2></div>
          {auditQuery.isLoading && <p className="mt-5 text-sm text-slate-500">กำลังโหลดประวัติ...</p>}
          {auditQuery.isError && <p className="mt-5 text-sm text-red-600">ไม่สามารถโหลดประวัติได้</p>}
          <ol className="mt-5 space-y-4">{(auditQuery.data?.items || []).map((event) => <li key={event.eventId} className="border-l-2 border-slate-200 pl-4"><p className="text-sm font-black text-slate-900">{event.previousStatus || '-'} → {event.resultingStatus}</p><p className="mt-1 text-xs text-slate-500">{event.actorIdentity} · {formatDate(event.occurredAt)}</p>{event.note && <p className="mt-2 text-sm text-slate-600">{event.note}</p>}</li>)}</ol>
        </aside>
      </div>
    </section>
  );
};

export default MissingCostResolutionDetailPage;
