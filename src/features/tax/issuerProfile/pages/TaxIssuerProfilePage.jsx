import { useEffect, useState } from 'react';
import { useBranchStore } from '@/features/branch/store/branchStore';
import { getTaxIssuerProfile, saveTaxIssuerProfile } from '../../intake/api/taxIntakeApi';

const EMPTY = {
  legalName: '', taxId: '', registeredAddress: '', branchCode: '00000', isHeadOffice: true,
  shortTaxInvoicePrefix: 'ABB-', fullTaxInvoicePrefix: 'TAX-', creditNotePrefix: 'CN-', status: 'DRAFT',
};

const Field = ({ label, children }) => <label className="space-y-1 text-sm font-semibold text-slate-700"><span>{label}</span>{children}</label>;
const inputClass = 'min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-normal text-slate-900 outline-none focus:border-teal-600';

const TaxIssuerProfilePage = () => {
  const branchId = useBranchStore((state) => Number(state.selectedBranchId || state.currentBranch?.id || 0));
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const change = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  useEffect(() => {
    if (!branchId) return;
    setLoading(true); setError('');
    getTaxIssuerProfile({ branchId })
      .then((result) => setForm({ ...EMPTY, ...(result?.profile || {}) }))
      .catch((requestError) => setError(requestError?.response?.data?.message || requestError.message))
      .finally(() => setLoading(false));
  }, [branchId]);

  const submit = async (event) => {
    event.preventDefault(); setSaving(true); setError(''); setMessage('');
    try {
      const result = await saveTaxIssuerProfile({ branchId, ...form });
      setForm({ ...EMPTY, ...(result?.profile || {}) });
      setMessage('บันทึกข้อมูลผู้ออกเอกสารภาษีเรียบร้อยแล้ว');
    } catch (requestError) {
      setError(requestError?.response?.data?.message || requestError.message);
    } finally { setSaving(false); }
  };

  if (!branchId) return <main className="p-6 text-amber-700">กรุณาเลือกสาขาก่อนตั้งค่าภาษีขาย</main>;
  if (loading) return <main className="p-6">กำลังโหลดข้อมูลผู้ออกเอกสาร...</main>;

  return <main className="mx-auto max-w-5xl space-y-5 p-4 md:p-6">
    <header><h1 className="text-2xl font-black text-slate-900">ตั้งค่าผู้ออกเอกสารภาษีขาย</h1><p className="text-sm text-slate-600">ข้อมูลนี้จะถูกเก็บเป็น snapshot และใช้ควบคุมเลขใบกำกับภาษีของสาขา</p></header>
    {message && <div className="rounded-xl bg-emerald-50 p-3 text-emerald-800">{message}</div>}
    {error && <div className="rounded-xl bg-rose-50 p-3 text-rose-800">{error}</div>}
    <form onSubmit={submit} className="grid gap-4 rounded-2xl border bg-white p-5 shadow-sm md:grid-cols-2">
      <Field label="ชื่อจดทะเบียน"><input className={inputClass} value={form.legalName || ''} onChange={(e) => change('legalName', e.target.value)} required /></Field>
      <Field label="เลขประจำตัวผู้เสียภาษี"><input className={inputClass} value={form.taxId || ''} onChange={(e) => change('taxId', e.target.value.replace(/\D/g, '').slice(0, 13))} required /></Field>
      <Field label="ที่อยู่จดทะเบียน"><textarea className={`${inputClass} min-h-24`} value={form.registeredAddress || ''} onChange={(e) => change('registeredAddress', e.target.value)} required /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="รหัสสาขา"><input className={inputClass} value={form.branchCode || ''} onChange={(e) => change('branchCode', e.target.value.replace(/\D/g, '').slice(0, 5))} required /></Field>
        <Field label="ประเภทสำนักงาน"><select className={inputClass} value={form.isHeadOffice ? 'HEAD' : 'BRANCH'} onChange={(e) => change('isHeadOffice', e.target.value === 'HEAD')}><option value="HEAD">สำนักงานใหญ่</option><option value="BRANCH">สาขา</option></select></Field>
      </div>
      <Field label="Prefix ใบกำกับภาษีอย่างย่อ"><input className={inputClass} value={form.shortTaxInvoicePrefix || ''} onChange={(e) => change('shortTaxInvoicePrefix', e.target.value)} /></Field>
      <Field label="Prefix ใบกำกับภาษีเต็มรูป"><input className={inputClass} value={form.fullTaxInvoicePrefix || ''} onChange={(e) => change('fullTaxInvoicePrefix', e.target.value)} /></Field>
      <Field label="Prefix ใบลดหนี้"><input className={inputClass} value={form.creditNotePrefix || ''} onChange={(e) => change('creditNotePrefix', e.target.value)} /></Field>
      <Field label="สถานะ"><select className={inputClass} value={form.status || 'DRAFT'} onChange={(e) => change('status', e.target.value)}><option value="DRAFT">ฉบับร่าง</option><option value="ACTIVE">เปิดใช้งาน</option><option value="SUSPENDED">ระงับใช้งาน</option></select></Field>
      <div className="md:col-span-2 flex justify-end"><button disabled={saving} className="min-h-11 rounded-xl bg-teal-700 px-5 font-bold text-white disabled:opacity-50">{saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}</button></div>
    </form>
  </main>;
};

export default TaxIssuerProfilePage;
