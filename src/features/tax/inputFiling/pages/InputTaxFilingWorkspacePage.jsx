import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  FileCheck2,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useBranchStore } from '@/features/branch/store/branchStore';
import {
  advanceInputTaxDocumentLifecycle,
  getInputTaxFilingWorkspace,
  inputTaxFilingErrorMessage,
  prepareInputTaxFilingBatch,
  removeInputTaxDocumentFromFiling,
  selectInputTaxDocumentForFiling,
} from '../api/inputTaxFilingApi';
import { formatTaxDate, formatTaxMoney } from '../../presentation/taxPresentation';

const ELIGIBILITY_REASON_TH = {
  ALLOCATION_MISMATCH: 'ยอดเอกสารและใบรับสินค้ายังไม่ตรงกัน',
  DUPLICATE_DOCUMENT_RISK: 'ต้องตรวจสอบความเสี่ยงเอกสารซ้ำก่อน',
  MANUAL_REVIEW_REQUIRED: 'ต้องตรวจสอบเอกสารก่อนนำเข้าชุด',
  REPLACED_DOCUMENT: 'เอกสารถูกแทนที่แล้ว',
  CANCELLED_DOCUMENT: 'เอกสารถูกยกเลิกแล้ว',
  PARTIAL_BUSINESS_USE: 'ใช้สิทธิ์ VAT ได้เพียงบางส่วน',
};

const DOCUMENT_STATUS_TH = {
  DRAFT: 'แบบร่าง',
  REGISTERED: 'ลงทะเบียนแล้ว',
  UNDER_REVIEW: 'กำลังตรวจสอบ',
  APPROVED: 'อนุมัติแล้ว',
  REJECTED: 'ไม่ผ่านการตรวจ',
};

const LIFECYCLE_ACTION_TH = {
  REGISTERED: 'ลงทะเบียนเอกสาร',
  UNDER_REVIEW: 'ส่งตรวจเอกสาร',
  APPROVED: 'ยืนยันเป็นรายการภาษีซื้อ',
};

const lifecycleSuccessText = (targetStatus) => ({
  REGISTERED: 'ลงทะเบียนเอกสารแล้ว',
  UNDER_REVIEW: 'ส่งเอกสารเข้าสู่ขั้นตรวจสอบแล้ว',
  APPROVED: 'อนุมัติเอกสารเป็นรายการภาษีซื้อแล้ว',
}[targetStatus] || 'อัปเดตเอกสารแล้ว');

const eligibilityText = (document) => {
  if (document.requiresInputVatApproval) return 'รออนุมัติเป็นรายการภาษีซื้อ';
  if (document.filingItem?.status === 'FILED') return 'บันทึกการยื่นแล้ว';
  if (document.filingItem?.status === 'SELECTED') return 'อยู่ในชุดภาษีซื้อแล้ว';
  if (document.canSelectForFiling) return 'พร้อมนำเข้าชุด';
  if (document.documentStatus === 'REJECTED') return 'เอกสารไม่ถูกนำมาใช้เป็นภาษีซื้อ';
  const reasons = document.eligibility?.reasonCodes || [];
  return reasons.map((code) => ELIGIBILITY_REASON_TH[code] || 'ยังไม่พร้อมนำเข้าชุด').join(' · ')
    || 'ยังไม่พร้อมนำเข้าชุด';
};

const reconciliationText = (status) => ({
  RECONCILED: 'ยอดตรงกันแล้ว',
  UNLINKED: 'ยังไม่ผูกใบรับสินค้า',
  PARTIALLY_RECONCILED: 'ยอดยังไม่ครบ',
  OVER_ALLOCATED: 'ยอดผูกเกินเอกสาร',
}[status] || 'ต้องตรวจสอบ');

const InputTaxFilingWorkspacePage = () => {
  const navigate = useNavigate();
  const { shopSlug, taxPeriodId } = useParams();
  const selectedBranchId = useBranchStore((state) => state.selectedBranchId);
  const currentBranch = useBranchStore((state) => state.currentBranch);
  const branchId = Number(selectedBranchId || currentBranch?.id || 0) || null;
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [removalId, setRemovalId] = useState(null);
  const [removalReason, setRemovalReason] = useState('');

  const load = useCallback(async () => {
    if (!branchId || !taxPeriodId) return;
    setLoading(true);
    setError('');
    try {
      setWorkspace(await getInputTaxFilingWorkspace({ branchId, taxPeriodId }));
    } catch (requestError) {
      const message = inputTaxFilingErrorMessage(requestError);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [branchId, taxPeriodId]);

  useEffect(() => { load(); }, [load]);

  const documents = Array.isArray(workspace?.documents) ? workspace.documents : [];
  const readyDocuments = useMemo(
    () => documents.filter((document) => document.canSelectForFiling),
    [documents],
  );
  const batch = workspace?.batch || null;
  const summary = workspace?.summary || {};
  const pendingApprovalCount = Number(summary.pendingApprovalCount || 0);

  const advanceDocument = async (document) => {
    if (!document?.canAdvanceLifecycle || !document?.nextLifecycleTarget || submitting) return;
    setSubmitting(true);
    try {
      await advanceInputTaxDocumentLifecycle({
        branchId,
        taxDocumentId: document.taxDocumentId,
        targetStatus: document.nextLifecycleTarget,
      });
      toast.success(lifecycleSuccessText(document.nextLifecycleTarget));
      await load();
    } catch (requestError) {
      toast.error(inputTaxFilingErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  };

  const prepare = async () => {
    if (!branchId || !taxPeriodId || pendingApprovalCount > 0 || submitting) return;
    setSubmitting(true);
    try {
      const result = await prepareInputTaxFilingBatch({ branchId, taxPeriodId });
      toast.success(result?.replayed ? 'เปิดชุดภาษีซื้อเดิมของรอบนี้แล้ว' : 'เริ่มเตรียมชุดภาษีซื้อแล้ว');
      await load();
    } catch (requestError) {
      toast.error(inputTaxFilingErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  };

  const selectDocument = async (taxDocumentId) => {
    if (!batch?.id || submitting) return;
    setSubmitting(true);
    try {
      await selectInputTaxDocumentForFiling({ branchId, batchId: batch.id, taxDocumentId });
      toast.success('เพิ่มเอกสารเข้าชุดภาษีซื้อแล้ว');
      await load();
    } catch (requestError) {
      toast.error(inputTaxFilingErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  };

  const selectAllReady = async () => {
    if (!batch?.id || readyDocuments.length === 0 || submitting) return;
    setSubmitting(true);
    let completed = 0;
    try {
      for (const document of readyDocuments) {
        await selectInputTaxDocumentForFiling({
          branchId,
          batchId: batch.id,
          taxDocumentId: document.taxDocumentId,
        });
        completed += 1;
      }
      toast.success(`เพิ่มเอกสารพร้อมใช้ ${completed} รายการเข้าชุดแล้ว`);
    } catch (requestError) {
      toast.error(inputTaxFilingErrorMessage(requestError));
    } finally {
      await load();
      setSubmitting(false);
    }
  };

  const removeDocument = async (document) => {
    const reason = removalReason.trim();
    if (!batch?.id || !reason || submitting) return;
    setSubmitting(true);
    try {
      await removeInputTaxDocumentFromFiling({
        branchId,
        batchId: batch.id,
        taxDocumentId: document.taxDocumentId,
        reason,
        version: document.filingItem?.version,
      });
      toast.success('นำเอกสารออกจากชุดภาษีซื้อแล้ว');
      setRemovalId(null);
      setRemovalReason('');
      await load();
    } catch (requestError) {
      toast.error(inputTaxFilingErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  };

  const goReadiness = () => navigate(`/${shopSlug || 'advancetech'}/pos/finance/tax-periods/${taxPeriodId}/readiness`);

  return (
    <section className="space-y-5">
      <header className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <button type="button" onClick={() => navigate(-1)} className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" aria-label="ย้อนกลับ"><ArrowLeft size={18} /></button>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">การเตรียมข้อมูลภาษีซื้อ</p>
              <h1 className="mt-1 text-2xl font-black text-slate-950">เตรียมชุดภาษีซื้อสำหรับปิดรอบ</h1>
              <p className="mt-1 text-sm text-slate-500">รอบ {workspace?.period?.periodCode || taxPeriodId} · {currentBranch?.name || `สาขา #${branchId || '-'}`}</p>
              <p className="mt-1 text-xs text-slate-400">ขั้นตอนนี้เป็นการจัดเตรียมข้อมูลภายในระบบ ยังไม่ใช่การยื่นแบบต่อกรมสรรพากร</p>
            </div>
          </div>
          <button type="button" onClick={load} disabled={loading || submitting} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 disabled:opacity-50"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} />โหลดข้อมูลใหม่</button>
        </div>
      </header>

      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</div> : null}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm font-semibold text-slate-500">กำลังตรวจรายการภาษีซื้อ...</div>
      ) : workspace ? (
        <>
          {pendingApprovalCount > 0 ? (
            <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
              <h2 className="font-black text-amber-950">ขั้นตอนที่ 1 · ตรวจและอนุมัติใบกำกับภาษีซื้อ</h2>
              <p className="mt-1 text-sm text-amber-800">ยังมี {pendingApprovalCount} เอกสารที่ต้องผ่านขั้นตอนเอกสารก่อน ระบบจึงจะนำมาเป็น authority ภาษีซื้อและจัดเข้าชุดได้</p>
            </section>
          ) : !batch ? (
            <section className="rounded-3xl border border-blue-200 bg-blue-50 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="font-black text-blue-950">ขั้นตอนที่ 2 · เริ่มเตรียมชุดภาษีซื้อ</h2>
                  <p className="mt-1 text-sm text-blue-800">เอกสารที่ต้องอนุมัติครบแล้ว ระบบจะสร้างชุดแบบร่างสำหรับรวบรวมรายการที่ผ่านเงื่อนไขจาก Server</p>
                </div>
                <button type="button" onClick={prepare} disabled={submitting} className="rounded-xl bg-emerald-700 px-5 py-3 font-black text-white disabled:opacity-40">เริ่มเตรียมชุดภาษีซื้อ</button>
              </div>
            </section>
          ) : (
            <section className={`rounded-3xl border p-5 ${summary.readyForTaxClosing ? 'border-emerald-200 bg-emerald-50' : 'border-blue-200 bg-blue-50/40'}`}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex items-center gap-2"><ShieldCheck size={19} className={summary.readyForTaxClosing ? 'text-emerald-700' : 'text-blue-700'} /><h2 className="font-black text-slate-950">ขั้นตอนที่ 3 · ชุดภาษีซื้อ #{batch.id} · {batch.status === 'DRAFT' ? 'กำลังจัดเตรียม' : 'บันทึกแล้ว'}</h2></div>
                  <p className="mt-1 text-sm text-slate-600">เลือกเข้าชุดแล้ว {Number(summary.selectedDocumentCount || 0)} จาก {Number(summary.authorityDocumentCount || 0)} รายการ</p>
                </div>
                {summary.readyForTaxClosing ? (
                  <button type="button" onClick={goReadiness} className="rounded-xl bg-emerald-700 px-5 py-3 font-black text-white">ขั้นตอนที่ 4 · กลับไปตรวจความพร้อมภาษี</button>
                ) : (
                  <button type="button" onClick={selectAllReady} disabled={submitting || readyDocuments.length === 0} className="rounded-xl bg-blue-700 px-5 py-3 font-black text-white disabled:opacity-40">เพิ่มรายการที่พร้อมทั้งหมด ({readyDocuments.length})</button>
                )}
              </div>
            </section>
          )}

          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <Metric label="เอกสารที่เห็นในรอบ" value={summary.visibleDocumentCount || 0} />
            <Metric label="รออนุมัติ" value={summary.pendingApprovalCount || 0} />
            <Metric label="รายการภาษีซื้อ" value={summary.authorityDocumentCount || 0} />
            <Metric label="อยู่ในชุดแล้ว" value={summary.selectedDocumentCount || 0} />
            <Metric label="ยังเหลือเข้าชุด" value={summary.remainingDocumentCount || 0} />
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-4 py-3">
              <h2 className="font-black text-slate-950">เอกสารภาษีซื้อของรอบนี้</h2>
              <p className="mt-1 text-xs text-slate-500">เอกสารใหม่ต้องผ่าน lifecycle จนเกิด Input VAT authority ก่อน ส่วนการนำเข้าชุดใช้ผล reconciliation และ eligibility จาก Server เท่านั้น</p>
            </div>
            {documents.length === 0 ? (
              <p className="p-8 text-center text-sm font-semibold text-slate-500">รอบนี้ยังไม่มีเอกสารภาษีซื้อ</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {documents.map((document) => {
                  const selected = ['SELECTED', 'FILED'].includes(document.filingItem?.status);
                  const removing = removalId === document.taxDocumentId;
                  const lifecycleLabel = LIFECYCLE_ACTION_TH[document.nextLifecycleTarget];
                  return (
                    <article key={document.taxDocumentId} className="p-4">
                      <div className="grid gap-4 lg:grid-cols-[1.4fr_.8fr_.8fr_auto] lg:items-center">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-black text-slate-950">{document.documentNumber || `เอกสาร #${document.taxDocumentId}`}</p>
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-black text-slate-700">{DOCUMENT_STATUS_TH[document.documentStatus] || document.documentStatus}</span>
                            <span className={`rounded-full px-2 py-0.5 text-xs font-black ${selected ? 'bg-emerald-100 text-emerald-800' : document.canSelectForFiling ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>{eligibilityText(document)}</span>
                          </div>
                          <p className="mt-1 text-sm text-slate-600">{document.supplierName} · {formatTaxDate(document.documentDate)}</p>
                          <p className="mt-1 text-xs text-slate-500">ตรวจยอด: {reconciliationText(document.reconciliation?.status)}</p>
                          {document.lifecycleBlockedReason === 'RECONCILIATION_REQUIRED' ? <p className="mt-1 text-xs font-bold text-amber-700">ต้องทำให้ยอดใบกำกับและใบรับสินค้าตรงกันก่อนจึงจะอนุมัติเป็นรายการภาษีซื้อได้</p> : null}
                        </div>
                        <div><p className="text-xs font-bold text-slate-500">มูลค่าก่อน VAT</p><p className="mt-1 font-black text-slate-900">{formatTaxMoney(document.subtotalAmount)}</p></div>
                        <div><p className="text-xs font-bold text-slate-500">VAT</p><p className="mt-1 font-black text-slate-900">{formatTaxMoney(document.vatAmount)}</p></div>
                        <div className="flex justify-end">
                          {document.canAdvanceLifecycle && lifecycleLabel ? (
                            <button type="button" onClick={() => advanceDocument(document)} disabled={submitting} className="rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-black text-white disabled:opacity-40">{lifecycleLabel}</button>
                          ) : document.canSelectForFiling ? (
                            <button type="button" onClick={() => selectDocument(document.taxDocumentId)} disabled={submitting} className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-black text-white disabled:opacity-40"><FileCheck2 size={16} />เพิ่มเข้าชุด</button>
                          ) : document.canRemoveFromFiling ? (
                            <button type="button" onClick={() => { setRemovalId(removing ? null : document.taxDocumentId); setRemovalReason(''); }} disabled={submitting} className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-black text-rose-700 disabled:opacity-40"><XCircle size={16} />นำออก</button>
                          ) : selected ? (
                            <span className="inline-flex items-center gap-2 text-sm font-black text-emerald-700"><CheckCircle2 size={17} />อยู่ในชุดแล้ว</span>
                          ) : null}
                        </div>
                      </div>
                      {removing ? (
                        <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3">
                          <label className="block text-xs font-black text-rose-900">เหตุผลที่นำเอกสารออกจากชุด</label>
                          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                            <input value={removalReason} onChange={(event) => setRemovalReason(event.target.value)} placeholder="เช่น ต้องกลับไปแก้ไขข้อมูลเอกสาร" className="min-h-10 flex-1 rounded-xl border border-rose-200 bg-white px-3" />
                            <button type="button" onClick={() => removeDocument(document)} disabled={submitting || !removalReason.trim()} className="rounded-xl bg-rose-700 px-4 py-2 text-sm font-black text-white disabled:opacity-40">ยืนยันนำออก</button>
                          </div>
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </>
      ) : null}
    </section>
  );
};

const Metric = ({ label, value }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4">
    <p className="text-xs font-black text-slate-500">{label}</p>
    <p className="mt-1 text-2xl font-black text-slate-950">{value}</p>
  </div>
);

export default InputTaxFilingWorkspacePage;
