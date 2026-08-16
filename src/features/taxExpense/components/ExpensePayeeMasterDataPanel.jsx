import React, { useMemo, useState } from 'react';
import { Plus, RefreshCw, Search } from 'lucide-react';

const initialForm = {
  payeeType: 'LEGAL_ENTITY',
  name: '',
  taxId: '',
  taxBranchCode: '00000',
  address: '',
  phone: '',
  email: '',
  contactPerson: '',
  notes: '',
};

const typeLabel = {
  INDIVIDUAL: 'บุคคลธรรมดา',
  LEGAL_ENTITY: 'นิติบุคคล',
  GOVERNMENT: 'หน่วยงานราชการ',
  OTHER: 'อื่น ๆ',
};

const ExpensePayeeMasterDataPanel = ({ payees, loading, saving, onRefresh, onSearch, onCreate }) => {
  const [query, setQuery] = useState('');
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');

  const activeCount = useMemo(() => payees.filter((payee) => payee.active !== false).length, [payees]);

  const update = (key, value) => {
    if (saving) return;
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (saving) return;

    setError('');
    if (!form.name.trim()) {
      setError('กรุณาระบุชื่อผู้รับเงิน');
      return;
    }
    if (form.taxId && !/^\d{13}$/.test(form.taxId)) {
      setError('เลขประจำตัวผู้เสียภาษีต้องมี 13 หลัก');
      return;
    }
    if (form.taxBranchCode && !/^\d{5}$/.test(form.taxBranchCode)) {
      setError('รหัสสาขาภาษีต้องมี 5 หลัก');
      return;
    }

    try {
      const created = await onCreate({
        ...form,
        name: form.name.trim(),
        taxId: form.taxId || undefined,
        taxBranchCode: form.taxBranchCode || undefined,
        address: form.address || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
        contactPerson: form.contactPerson || undefined,
        notes: form.notes || undefined,
      });
      if (!created) return;
      setForm(initialForm);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message
          || requestError?.message
          || 'ไม่สามารถเพิ่มผู้รับเงินค่าใช้จ่ายได้',
      );
    }
  };

  const search = (event) => {
    event.preventDefault();
    onSearch(query.trim());
  };

  return (
    <section className="rounded-2xl border border-teal-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-black text-slate-900">ผู้รับเงินค่าใช้จ่าย</h2>
          <p className="mt-1 text-xs text-slate-500">ข้อมูลชุดนี้แยกจาก Supplier และใช้เฉพาะร้านปัจจุบัน</p>
        </div>
        <div className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">ใช้งาน {activeCount} ราย</div>
      </div>

      <div className="mt-4 grid gap-5 xl:grid-cols-[1fr_1.15fr]">
        <form onSubmit={submit} className="space-y-3 rounded-xl bg-slate-50 p-4">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-xs font-bold text-slate-700">ประเภท
              <select value={form.payeeType} onChange={(event) => update('payeeType', event.target.value)} disabled={saving} className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 disabled:cursor-not-allowed disabled:bg-slate-100">
                {Object.entries(typeLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label className="text-xs font-bold text-slate-700">ชื่อผู้รับเงิน
              <input value={form.name} onChange={(event) => update('name', event.target.value)} disabled={saving} className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-2 disabled:cursor-not-allowed disabled:bg-slate-100" />
            </label>
            <label className="text-xs font-bold text-slate-700">เลขผู้เสียภาษี
              <input inputMode="numeric" maxLength={13} value={form.taxId} onChange={(event) => update('taxId', event.target.value.replace(/\D/g, ''))} disabled={saving} className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-2 disabled:cursor-not-allowed disabled:bg-slate-100" />
            </label>
            <label className="text-xs font-bold text-slate-700">รหัสสาขาภาษี
              <input inputMode="numeric" maxLength={5} value={form.taxBranchCode} onChange={(event) => update('taxBranchCode', event.target.value.replace(/\D/g, ''))} disabled={saving} className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-2 disabled:cursor-not-allowed disabled:bg-slate-100" />
            </label>
            <label className="text-xs font-bold text-slate-700">โทรศัพท์
              <input value={form.phone} onChange={(event) => update('phone', event.target.value)} disabled={saving} className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-2 disabled:cursor-not-allowed disabled:bg-slate-100" />
            </label>
            <label className="text-xs font-bold text-slate-700">อีเมล
              <input type="email" value={form.email} onChange={(event) => update('email', event.target.value)} disabled={saving} className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-2 disabled:cursor-not-allowed disabled:bg-slate-100" />
            </label>
            <label className="text-xs font-bold text-slate-700">ผู้ติดต่อ
              <input value={form.contactPerson} onChange={(event) => update('contactPerson', event.target.value)} disabled={saving} className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-2 disabled:cursor-not-allowed disabled:bg-slate-100" />
            </label>
            <label className="text-xs font-bold text-slate-700 md:col-span-2">ที่อยู่ตามเอกสาร
              <textarea rows={2} value={form.address} onChange={(event) => update('address', event.target.value)} disabled={saving} className="mt-1 w-full rounded-lg border border-slate-200 p-2 disabled:cursor-not-allowed disabled:bg-slate-100" />
            </label>
            <label className="text-xs font-bold text-slate-700 md:col-span-2">หมายเหตุ
              <textarea rows={2} value={form.notes} onChange={(event) => update('notes', event.target.value)} disabled={saving} className="mt-1 w-full rounded-lg border border-slate-200 p-2 disabled:cursor-not-allowed disabled:bg-slate-100" />
            </label>
          </div>
          {error && <p className="text-xs font-semibold text-rose-700">{error}</p>}
          <button type="submit" disabled={saving} className="inline-flex h-9 items-center gap-2 rounded-lg bg-teal-600 px-4 text-xs font-bold text-white disabled:bg-slate-300"><Plus size={15} />{saving ? 'กำลังบันทึก...' : 'เพิ่มผู้รับเงิน'}</button>
        </form>

        <div>
          <form onSubmit={search} className="flex gap-2">
            <div className="relative flex-1"><Search size={15} className="absolute left-3 top-2.5 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ค้นหาชื่อ เลขผู้เสียภาษี โทรศัพท์ หรือผู้ติดต่อ" className="h-9 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-xs" /></div>
            <button type="submit" className="h-9 rounded-lg border border-slate-200 px-3 text-xs font-bold">ค้นหา</button>
            <button type="button" onClick={onRefresh} disabled={loading} className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-xs font-bold"><RefreshCw size={14} className={loading ? 'animate-spin' : ''} />รีเฟรช</button>
          </form>

          <div className="mt-3 overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500"><tr><th className="p-3">ชื่อ</th><th className="p-3">ประเภท</th><th className="p-3">เลขผู้เสียภาษี</th><th className="p-3">ติดต่อ</th></tr></thead>
              <tbody>{payees.map((payee) => <tr key={payee.id} className="border-t border-slate-100"><td className="p-3 font-bold text-slate-800">{payee.name}</td><td className="p-3">{typeLabel[payee.payeeType] || payee.payeeType}</td><td className="p-3">{payee.taxId || '-'}</td><td className="p-3">{payee.phone || payee.contactPerson || '-'}</td></tr>)}</tbody>
            </table>
            {!loading && !payees.length && <p className="p-8 text-center text-sm text-slate-400">ยังไม่มีผู้รับเงินค่าใช้จ่ายสำหรับร้านนี้</p>}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExpensePayeeMasterDataPanel;