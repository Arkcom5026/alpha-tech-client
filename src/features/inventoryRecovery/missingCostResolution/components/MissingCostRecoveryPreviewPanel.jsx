import React, { useState } from 'react';
import { AlertTriangle, Calculator, RefreshCw, ShieldCheck } from 'lucide-react';
import {
  useMissingCostRecoveryApprovalPlan,
  useMissingCostRecoveryPreview,
} from '../hooks/useMissingCostResolutionWorkflow';

const money = (value) => new Intl.NumberFormat('th-TH', {
  style: 'currency',
  currency: 'THB',
  minimumFractionDigits: 2,
}).format(Number(value || 0));

const errorText = (error) => error?.friendlyMessage
  || error?.response?.data?.message
  || error?.message
  || 'ไม่สามารถสร้างข้อมูลตรวจสอบได้';

const MissingCostRecoveryPreviewPanel = ({ resolution }) => {
  const [requested, setRequested] = useState(false);
  const resolutionId = resolution?.id;
  const approved = resolution?.status === 'APPROVED';
  const previewQuery = useMissingCostRecoveryPreview(resolutionId, approved && requested);
  const preview = previewQuery.data;
  const planQuery = useMissingCostRecoveryApprovalPlan(
    resolutionId,
    approved && requested && preview?.validation?.result === 'VALIDATED_PREVIEW_ONLY'
  );
  const plan = planQuery.data;
  const loading = previewQuery.isFetching || planQuery.isFetching;

  if (!approved) return null;

  return (
    <section className="space-y-4 rounded-3xl border border-blue-200 bg-blue-50/40 p-5 shadow-sm md:p-7">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2"><Calculator className="h-5 w-5 text-blue-700" /><h2 className="text-lg font-black text-slate-900">ตัวอย่างผลกระทบก่อนแก้ต้นทุน</h2></div>
          <p className="mt-2 text-sm text-slate-600">ระบบจะอ่านสต๊อกและหลักฐานจาก Server ใหม่ทุกครั้ง ไม่ใช้ Plan ที่เก็บค้างใน Browser</p>
        </div>
        <button type="button" onClick={() => setRequested(true)} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-black text-white hover:bg-blue-700 disabled:opacity-50">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />{requested ? 'อ่านข้อมูลใหม่' : 'สร้าง Preview'}
        </button>
      </div>

      {(previewQuery.isError || planQuery.isError) && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <div className="flex items-center gap-2 font-black"><AlertTriangle className="h-4 w-4" />ไม่สามารถสร้างแผนได้</div>
          <p className="mt-1">{errorText(previewQuery.error || planQuery.error)}</p>
        </div>
      )}

      {preview && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-4"><p className="text-xs font-bold text-slate-500">จำนวนปัจจุบัน</p><p className="mt-1 text-xl font-black">{preview.proposedRecovery?.quantity ?? 0}</p></div>
          <div className="rounded-2xl bg-white p-4"><p className="text-xs font-bold text-slate-500">ต้นทุนที่อนุมัติ</p><p className="mt-1 text-xl font-black text-blue-700">{money(preview.proposedRecovery?.unitCost)}</p></div>
          <div className="rounded-2xl bg-white p-4"><p className="text-xs font-bold text-slate-500">มูลค่าสต๊อกหลังแก้</p><p className="mt-1 text-xl font-black text-emerald-700">{money(preview.proposedRecovery?.inventoryValue)}</p></div>
          <div className="rounded-2xl bg-white p-4"><p className="text-xs font-bold text-slate-500">ผลตรวจ Snapshot</p><p className={`mt-1 text-sm font-black ${preview.validation?.stale ? 'text-red-700' : 'text-emerald-700'}`}>{preview.validation?.result}</p></div>
        </div>
      )}

      {preview?.validation?.stale && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-black">ข้อมูลเปลี่ยนจากตอนอนุมัติ ระบบหยุดดำเนินการ</p>
          <p className="mt-1">{(preview.validation.staleReasons || []).join(', ')}</p>
        </div>
      )}

      {plan && (
        <div className="rounded-2xl border border-emerald-200 bg-white p-4">
          <div className="flex items-center gap-2 font-black text-emerald-800"><ShieldCheck className="h-5 w-5" />แผนได้รับการตรวจแบบ Deterministic</div>
          <dl className="mt-3 grid gap-2 text-xs text-slate-600 md:grid-cols-2">
            <div><dt className="font-bold">Plan ID</dt><dd className="break-all font-mono">{plan.executionPlanId}</dd></div>
            <div><dt className="font-bold">Plan Hash</dt><dd className="break-all font-mono">{plan.executionPlanHash}</dd></div>
            <div><dt className="font-bold">Preview ID</dt><dd className="break-all font-mono">{plan.previewId}</dd></div>
            <div><dt className="font-bold">จำนวน Operation</dt><dd>{plan.totals?.operationCount ?? 0}</dd></div>
          </dl>
          <p className="mt-3 text-xs text-slate-500">แผนนี้ยังไม่ใช่สิทธิ์แก้สต๊อก และจะต้องถูกสร้างใหม่อีกครั้งใน Server เมื่อยืนยัน Execute</p>
        </div>
      )}
    </section>
  );
};

export default MissingCostRecoveryPreviewPanel;
