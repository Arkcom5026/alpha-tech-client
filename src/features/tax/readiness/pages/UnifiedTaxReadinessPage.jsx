import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, RefreshCw, ShieldAlert, TriangleAlert } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useBranchStore } from '@/features/branch/store/branchStore';
import { getUnifiedTaxReadiness, getUnifiedTaxReadinessErrorMessage } from '../api/unifiedTaxReadinessApi';

const DOMAIN_LABELS_TH = {
  OUTPUT_VAT: 'ภาษีขาย',
  INPUT_VAT: 'ภาษีซื้อ',
  TAX_EXPENSE: 'ค่าใช้จ่ายทางภาษี',
  WITHHOLDING_TAX: 'ภาษีหัก ณ ที่จ่าย',
  DOCUMENTS: 'เอกสาร',
  RECONCILIATION: 'ตรวจสอบยอดและความสอดคล้อง',
  PP30: 'ภ.พ.30 (PP30)',
  TAX_PERIOD: 'รอบภาษี',
};

const EXCEPTION_COPY_TH = {
  INPUT_VAT_DOCUMENT_APPROVAL_REQUIRED: ['มีใบกำกับภาษีซื้อที่ยังรออนุมัติ', 'กรุณาตรวจเอกสารและยืนยันให้เป็นรายการภาษีซื้อก่อนจัดชุดปิดรอบ'],
  INPUT_VAT_FILING_NOT_PREPARED: ['ยังไม่ได้เตรียมชุดภาษีซื้อสำหรับรอบนี้', 'กรุณารวบรวมรายการภาษีซื้อที่พร้อมเข้าชุดให้ครบก่อนปิดรอบ'],
  INPUT_VAT_FILING_INCOMPLETE: ['ชุดภาษีซื้อยังไม่ครบ', 'ยังมีรายการภาษีซื้อที่ต้องตรวจสอบหรือนำเข้าชุด'],
  INPUT_VAT_PERIOD_UNBOUND: ['มีรายการภาษีซื้อที่ยังไม่ผูกกับรอบภาษี', 'กรุณาตรวจสอบรายการภาษีซื้อของรอบนี้'],
  OUTPUT_VAT_FILING_NOT_PREPARED: ['ยังไม่ได้เตรียมชุดภาษีขายสำหรับรอบนี้', 'กรุณาตรวจสอบและเตรียมรายการภาษีขายให้ครบ'],
  OUTPUT_VAT_FILING_INCOMPLETE: ['ชุดภาษีขายยังไม่ครบ', 'ยังมีรายการภาษีขายที่ต้องจัดการ'],
  OUTPUT_VAT_PERIOD_UNBOUND: ['มีรายการภาษีขายที่ยังไม่ผูกกับรอบภาษี', 'กรุณาตรวจสอบรายการภาษีขายของรอบนี้'],
  TAX_PERIOD_NOT_LOCKED: ['รอบภาษียังไม่ได้ล็อก', 'ควรล็อกรอบภาษีเมื่อจัดเตรียมข้อมูลทุกส่วนเสร็จแล้ว'],
  VAT_SETTLEMENT_CARRY_FORWARD_AUTHORITY_REQUIRED: ['ต้องยืนยันยอด VAT ยกมาจากรอบก่อน', 'กรุณาตรวจสอบและยืนยันยอดเครดิตภาษีที่ยกมาจากรอบก่อน'],
  TAX_EXPENSE_EVIDENCE_INCOMPLETE: ['หลักฐานค่าใช้จ่ายทางภาษียังไม่ครบ', 'กรุณาตรวจสอบและยืนยันหลักฐานค่าใช้จ่าย'],
  TAX_EXPENSE_VAT_CIT_ASSESSMENT_PENDING: ['ยังมีค่าใช้จ่ายที่ต้องประเมินภาษี', 'กรุณายืนยันการพิจารณา VAT และภาษีเงินได้นิติบุคคล'],
  WHT_CERTIFICATE_NOT_ISSUED: ['เอกสารภาษีหัก ณ ที่จ่ายยังไม่ครบ', 'กรุณาตรวจสอบและจัดเตรียมหลักฐานภาษีหัก ณ ที่จ่าย'],
};

const UnifiedTaxReadinessPage = () => {
  const navigate = useNavigate();
  const { shopSlug, taxPeriodId } = useParams();
  const selectedBranchId = useBranchStore((state) => state.selectedBranchId);
  const currentBranch = useBranchStore((state) => state.currentBranch);
  const branchId = Number(selectedBranchId || currentBranch?.id || 0) || null;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!branchId || !taxPeriodId) return;
    setLoading(true);
    setError('');
    try {
      setData(await getUnifiedTaxReadiness({ branchId, taxPeriodId }));
    } catch (requestError) {
      const message = getUnifiedTaxReadinessErrorMessage(requestError);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [branchId, taxPeriodId]);

  useEffect(() => { load(); }, [load]);

  const domains = Array.isArray(data?.domains) ? data.domains : [];
  const exceptions = Array.isArray(data?.exceptions) ? data.exceptions : [];
  const blockers = useMemo(() => exceptions.filter((entry) => entry.severity === 'BLOCKER'), [exceptions]);
  const reviews = useMemo(() => exceptions.filter((entry) => entry.severity !== 'BLOCKER'), [exceptions]);

  const goToTarget = (relativePath) => {
    if (!relativePath) return;
    navigate(`/${shopSlug || 'advancetech'}/pos/finance/${relativePath}`);
  };

  const exceptionCopy = (entry) => EXCEPTION_COPY_TH[entry.code]
    || ['มีรายการภาษีที่ต้องจัดการ', 'กรุณาเปิดรายการนี้เพื่อตรวจสอบและดำเนินการต่อ'];

  return (
    <section className="space-y-5">
      <header className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <button type="button" onClick={() => navigate(-1)} className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" aria-label="ย้อนกลับ"><ArrowLeft size={18} /></button>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-600">ความพร้อมก่อนปิดรอบภาษี</p>
              <h1 className="mt-1 text-2xl font-black text-slate-900">ศูนย์ตรวจความพร้อมภาษี</h1>
              <p className="mt-1 text-sm text-slate-500">รอบ {data?.period?.periodCode || taxPeriodId} · {currentBranch?.name || `สาขา #${branchId || '-'}`}</p>
              <p className="mt-1 text-xs text-slate-400">ระบบรวบรวมสถานะจากข้อมูลภาษีแต่ละส่วน เพื่อบอกสิ่งที่ต้องจัดการต่อโดยไม่สร้างข้อมูลซ้ำ</p>
            </div>
          </div>
          <button type="button" onClick={load} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 disabled:opacity-50"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} />รีเฟรช</button>
        </div>
      </header>

      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</div>}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm font-semibold text-slate-500">กำลังตรวจความพร้อมด้านภาษี...</div>
      ) : data ? (
        <>
          <section className={`rounded-3xl border p-5 ${data.summary?.readyForAccountant ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-black text-slate-700">ความพร้อมด้านภาษี</p>
                <p className="mt-1 text-5xl font-black text-slate-950">{Number(data.summary?.readinessPercent || 0)}%</p>
                <p className="mt-2 text-sm font-semibold text-slate-600">พร้อม {Number(data.summary?.readyDomainCount || 0)} จาก {Number(data.summary?.domainCount || 0)} หมวด</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black">{data.summary?.readyForAccountant ? 'พร้อมสำหรับขั้นตอนส่งต่อ' : 'ยังมีรายการที่ต้องจัดการ'}</p>
                <p className="mt-1 text-xs text-slate-500">ต้องแก้ไข {Number(data.summary?.blockerCount || 0)} · ควรตรวจ {Number(data.summary?.reviewCount || 0)}</p>
              </div>
            </div>
          </section>

          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {domains.map((domain) => (
              <button key={domain.key} type="button" onClick={() => goToTarget(domain.target)} className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm ${domain.ready ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
                <div className="flex items-center gap-2"><CheckCircle2 size={17} className={domain.ready ? 'text-emerald-600' : 'text-slate-300'} /><span className="font-black text-slate-900">{DOMAIN_LABELS_TH[domain.key] || domain.label}</span></div>
                <p className={`mt-2 text-sm font-bold ${domain.ready ? 'text-emerald-700' : 'text-amber-700'}`}>{domain.ready ? 'พร้อม' : 'ต้องตรวจสอบ'}</p>
              </button>
            ))}
          </section>

          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center gap-2 text-amber-800"><ShieldAlert size={18} /><h2 className="font-black">รายการที่ต้องจัดการ</h2></div>
            {blockers.length === 0 ? <p className="mt-3 text-sm font-semibold text-emerald-700">ไม่มีรายการที่ขัดขวางการปิดรอบภาษี</p> : (
              <div className="mt-3 space-y-2">
                {blockers.map((entry) => {
                  const copy = exceptionCopy(entry);
                  return (
                    <button key={`${entry.code}:${entry.source}`} type="button" onClick={() => goToTarget(entry.target?.relativePath)} className="block w-full rounded-xl border border-amber-200 bg-white px-4 py-3 text-left hover:border-amber-400">
                      <div className="flex flex-wrap items-center justify-between gap-2"><span className="font-black text-amber-900">{copy[0]}</span><span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-black text-amber-800">{entry.count} รายการ</span></div>
                      <p className="mt-1 text-sm text-slate-600">{copy[1]}</p>
                      <p className="mt-1 text-xs font-bold text-blue-700">ไปดำเนินการ</p>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {reviews.length > 0 && (
            <section className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-center gap-2 text-blue-800"><TriangleAlert size={18} /><h2 className="font-black">รายการที่ควรตรวจสอบ</h2></div>
              <div className="mt-3 space-y-2">{reviews.map((entry) => { const copy = exceptionCopy(entry); return <button key={`${entry.code}:${entry.source}`} type="button" onClick={() => goToTarget(entry.target?.relativePath)} className="block w-full rounded-xl border border-blue-200 bg-white px-4 py-3 text-left"><div className="font-black text-blue-900">{copy[0]}</div><p className="mt-1 text-sm text-slate-600">{copy[1]}</p></button>; })}</div>
            </section>
          )}
        </>
      ) : null}
    </section>
  );
};

export default UnifiedTaxReadinessPage;
