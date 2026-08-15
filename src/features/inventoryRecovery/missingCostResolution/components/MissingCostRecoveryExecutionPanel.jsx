import React, { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, History, RefreshCw, ShieldCheck } from 'lucide-react';
import { feedback } from '@/design-system';
import {
  useExecuteMissingCostRecovery,
  useMissingCostRecoveryApprovalPlan,
  useMissingCostRecoveryAudit,
  useMissingCostRecoveryPreview,
} from '../hooks/useMissingCostResolutionWorkflow';

const money = (value) => new Intl.NumberFormat('th-TH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}).format(Number(value || 0));

const dateTime = (value) => value
  ? new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
  : '-';

const errorMessage = (error) => error?.friendlyMessage
  || error?.response?.data?.message
  || error?.message
  || 'ไม่สามารถดำเนินการได้';

const newIdempotencyKey = (resolutionId) => {
  const random = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `mcr-${resolutionId}-${random}`;
};

const MissingCostRecoveryExecutionPanel = ({ detail }) => {
  const resolution = detail?.resolution;
  const resolutionId = resolution?.id;
  const approved = resolution?.status === 'APPROVED';
  const [loaded, setLoaded] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState(() => newIdempotencyKey(resolutionId));

  const previewQuery = useMissingCostRecoveryPreview(resolutionId, approved && loaded);
  const planQuery = useMissingCostRecoveryApprovalPlan(resolutionId, approved && loaded);
  const executeMutation = useExecuteMissingCostRecovery(resolutionId);
  const auditQuery = useMissingCostRecoveryAudit(resolutionId, approved && (executeMutation.isSuccess || loaded));

  const preview = previewQuery.data;
  const plan = planQuery.data;
  const ready = preview?.validation?.result === 'VALIDATED_PREVIEW_ONLY'
    && !preview?.validation?.stale
    && plan?.validation?.result === 'VALIDATED_APPROVAL_PLAN_ONLY';

  const payload = useMemo(() => plan ? ({
    executionPlanId: plan.executionPlanId,
    executionPlanHash: plan.executionPlanHash,
    previewId: plan.previewId,
    previewHash: plan.previewHash,
    sourceSnapshotHash: plan.sourceSnapshotHash,
    evidenceHash: plan.evidenceHash,
    operatorIdentity: plan.operatorIdentity,
  }) : null, [plan]);

  if (!approved) return null;

  const refreshAuthority = async () => {
    setLoaded(true);
    setConfirmed(false);
    await Promise.all([previewQuery.refetch(), planQuery.refetch()]);
  };

  const execute = async () => {
    if (!ready || !payload || !confirmed || executeMutation.isPending) return;
    try {
      await executeMutation.mutateAsync({ payload, idempotencyKey });
      feedback.actionSuccess(
        'นำต้นทุนที่อนุมัติไปใช้กับสต๊อกสำเร็จ',
        'inventory-recovery.missing-cost.execute',
      );
      setConfirmed(false);
      setIdempotencyKey(newIdempotencyKey(resolutionId));
      await auditQuery.refetch();
    } catch (error) {
      const code = error?.response?.data?.code || error?.code;
      if (String(code || '').includes('STALE')) {
        feedback.warning('ข้อมูลเปลี่ยนแล้ว กรุณาสร้าง Preview และ Plan ใหม่');
      } else if (String(code || '').includes('DUPLICATE')) {
        feedback.info('คำสั่งนี้เคยดำเนินการแล้ว ระบบไม่ทำซ้ำ');
      } else if (error?.response?.status === 403) {
        feedback.actionError(
          error,
          'บัญชีนี้ไม่มีสิทธิ์ดำเนินการ หรือระบบยังไม่ได้เปิดความสามารถนี้',
          'inventory-recovery.missing-cost.execute',
        );
      } else {
        feedback.actionError(
          error,
          errorMessage(error),
          'inventory-recovery.missing-cost.execute',
        );
      }
    }
  };

  return (
    <section className="space-y-5 rounded-3xl border border-emerald-200 bg-white p-5 shadow-sm md:p-7">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-emerald-600" /><h2 className="text-lg font-black text-slate-900">นำต้นทุนที่อนุมัติไปใช้กับสต๊อก</h2></div>
          <p className="mt-2 text-sm text-slate-600">ระบบจะอ่านข้อมูลปัจจุบันและสร้างแผนใหม่จาก Server ทุกครั้งก่อนยืนยัน</p>
        </div>
        <button type="button" onClick={refreshAuthority} disabled={previewQuery.isFetching || planQuery.isFetching} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-black text-slate-700 hover:bg-slate-50 disabled:opacity-50">
          <RefreshCw className="h-4 w-4" />ตรวจข้อมูลและสร้างแผนใหม่
        </button>
      </div>

      {(previewQuery.isFetching || planQuery.isFetching) && <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">กำลังตรวจข้อมูลปัจจุบันและสร้างแผน...</p>}

      {(previewQuery.isError || planQuery.isError) && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <div className="flex items-center gap-2 font-black"><AlertTriangle className="h-4 w-4" />ไม่สามารถสร้าง Authority ล่าสุดได้</div>
          <p className="mt-1">{errorMessage(previewQuery.error || planQuery.error)}</p>
        </div>
      )}

      {preview?.validation?.stale && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-800">
          <p className="font-black">ข้อมูลเปลี่ยนจากหลักฐานที่อนุมัติ จึงห้าม Execute</p>
          <p className="mt-1 text-sm">{(preview.validation.staleReasons || []).join(', ') || 'STALE_ABORT_REQUIRED'}</p>
        </div>
      )}

      {ready && (
        <div className="space-y-4">
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-slate-50 p-4"><dt className="text-xs font-bold text-slate-500">จำนวนปัจจุบัน</dt><dd className="mt-1 text-xl font-black">{money(preview.proposedRecovery?.quantity)}</dd></div>
            <div className="rounded-2xl bg-blue-50 p-4"><dt className="text-xs font-bold text-blue-700">ต้นทุนที่อนุมัติ</dt><dd className="mt-1 text-xl font-black text-blue-900">{money(preview.proposedRecovery?.unitCost)} บาท</dd></div>
            <div className="rounded-2xl bg-emerald-50 p-4"><dt className="text-xs font-bold text-emerald-700">มูลค่าสต๊อกหลังแก้</dt><dd className="mt-1 text-xl font-black text-emerald-900">{money(plan.totals?.totalInventoryValue)} บาท</dd></div>
            <div className="rounded-2xl bg-slate-50 p-4"><dt className="text-xs font-bold text-slate-500">ผู้อนุมัติจาก Server</dt><dd className="mt-1 text-sm font-black">{plan.approvalIdentity || '-'}</dd></div>
          </dl>

          <label className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4 text-sm text-slate-700">
            <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} className="mt-1 h-4 w-4" />
            <span>ยืนยันว่าตรวจสอบสินค้า จำนวน ต้นทุน และมูลค่าหลังดำเนินการแล้ว และต้องการ Execute แผนล่าสุดนี้หนึ่งครั้ง</span>
          </label>

          <button type="button" onClick={execute} disabled={!confirmed || executeMutation.isPending} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-700 disabled:opacity-50">
            <CheckCircle2 className="h-4 w-4" />{executeMutation.isPending ? 'กำลังดำเนินการ...' : 'ยืนยันนำต้นทุนไปใช้กับสต๊อก'}
          </button>
        </div>
      )}

      {auditQuery.data && (
        <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4">
          <div className="flex items-center gap-2 font-black text-violet-900"><History className="h-4 w-4" />ผลและหลักฐานหลังดำเนินการ</div>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
            <div><dt className="text-violet-700">จำนวนคงเหลือ</dt><dd className="font-black">{money(auditQuery.data.resultingInventoryAuthority?.quantity)}</dd></div>
            <div><dt className="text-violet-700">ต้นทุนเฉลี่ย</dt><dd className="font-black">{money(auditQuery.data.resultingInventoryAuthority?.avgCost)} บาท</dd></div>
            <div><dt className="text-violet-700">มูลค่าสต๊อก</dt><dd className="font-black">{money(auditQuery.data.resultingInventoryAuthority?.inventoryValue)} บาท</dd></div>
            <div><dt className="text-violet-700">ดำเนินการเมื่อ</dt><dd className="font-black">{dateTime(auditQuery.data.latestExecution?.occurredAt)}</dd></div>
          </dl>
          <p className="mt-3 break-all text-xs text-violet-700">Execution hash: {auditQuery.data.latestExecution?.eventHash}</p>
        </div>
      )}
    </section>
  );
};

export default MissingCostRecoveryExecutionPanel;
