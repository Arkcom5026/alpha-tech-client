import React, { useEffect, useRef, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { feedback } from '@/design-system';
import { createExpensePayee } from '@/features/taxExpense/api/taxExpenseApi';

const initialForm = {
  payeeType: 'INDIVIDUAL',
  name: '',
  taxId: '',
  taxBranchCode: '00000',
  address: '',
  phone: '',
  email: '',
  contactPerson: '',
  notes: '',
};

const typeOptions = [
  ['INDIVIDUAL', 'บุคคลธรรมดา'],
  ['LEGAL_ENTITY', 'นิติบุคคล'],
  ['GOVERNMENT', 'หน่วยงานราชการ'],
  ['OTHER', 'อื่น ๆ'],
];

const ExpensePayeeQuickCreateDialog = ({ open, onClose, onCreated }) => {
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const savingRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    setForm(initialForm);
    setError('');
  }, [open]);

  if (!open) return null;

  const update = (key, value) => {
    if (saving || savingRef.current) return;
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (saving || savingRef.current) return;
    setError('');

    const formSnapshot = { ...form };
    if (!formSnapshot.name.trim()) {
      setError('กรุณาระบุชื่อผู้รับซ่อม');
      return;
    }
    if (formSnapshot.taxId && !/^\d{13}$/.test(formSnapshot.taxId)) {
      setError('เลขประจำตัวผู้เสียภาษีต้องมี 13 หลัก หรือเว้นว่างได้');
      return;
    }
    if (formSnapshot.taxBranchCode && !/^\d{5}$/.test(formSnapshot.taxBranchCode)) {
      setError('รหัสสาขาภาษีต้องมี 5 หลัก');
      return;
    }

    const payload = {
      ...formSnapshot,
      name: formSnapshot.name.trim(),
      taxId: formSnapshot.taxId || undefined,
      taxBranchCode: formSnapshot.taxBranchCode || undefined,
      address: formSnapshot.address || undefined,
      phone: formSnapshot.phone || undefined,
      email: formSnapshot.email || undefined,
      contactPerson: formSnapshot.contactPerson || undefined,
      notes: formSnapshot.notes || undefined,
    };

    savingRef.current = true;
    setSaving(true);
    try {
      const created = await createExpensePayee(payload);
      feedback.actionSuccess(
        'เพิ่มผู้รับซ่อมเรียบร้อยแล้ว',
        `repair:expense-payee:${created?.id || 'new'}:create:success`,
      );

      try {
        await onCreated?.(created);
      } catch (selectionError) {
        const message = selectionError?.message || 'สร้างผู้รับซ่อมสำเร็จแล้ว แต่เลือกใช้งานอัตโนมัติไม่สำเร็จ';
        setError(message);
        feedback.actionError(
          selectionError,
          'สร้างผู้รับซ่อมสำเร็จแล้ว แต่เลือกใช้งานอัตโนมัติไม่สำเร็จ',
          `repair:expense-payee:${created?.id || 'new'}:select:error`,
        );
        return;
      }

      onClose?.();
    } catch (requestError) {
      const message = requestError?.response?.data?.message || requestError?.message || 'ไม่สามารถเพิ่มผู้รับซ่อมได้';
      setError(message);
      feedback.actionError(
        requestError,
        message,
        'repair:expense-payee:create:error',
      );
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/40 p-4" role="dialog" aria-modal="true" aria-label="เพิ่มผู้รับซ่อมภายนอก">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-violet-700">ExpensePayee</p>
            <h3 className="mt-1 text-lg font-black text-slate-950">เพิ่มผู้รับซ่อมภายนอก</h3>
            <p className="mt-1 text-sm text-slate-600">สร้างผู้รับเงินค่าใช้จ่ายแล้วระบบจะเลือกผู้รับซ่อมรายนี้ให้ทันที เลขผู้เสียภาษีไม่บังคับ</p>
          </div>
          <button type="button" onClick={onClose} disabled={saving} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50" aria-label="ปิด">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="mt-5 space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-xs font-bold text-slate-700">ประเภทผู้รับเงิน
              <select disabled={saving} value={form.payeeType} onChange={(event) => update('payeeType', event.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 disabled:cursor-not-allowed disabled:bg-slate-100">
                {typeOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label className="text-xs font-bold text-slate-700">ชื่อผู้รับซ่อม *
              <input disabled={saving} value={form.name} onChange={(event) => update('name', event.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 disabled:cursor-not-allowed disabled:bg-slate-100" autoFocus />
            </label>
            <label className="text-xs font-bold text-slate-700">โทรศัพท์
              <input disabled={saving} value={form.phone} onChange={(event) => update('phone', event.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 disabled:cursor-not-allowed disabled:bg-slate-100" />
            </label>
            <label className="text-xs font-bold text-slate-700">ผู้ติดต่อ
              <input disabled={saving} value={form.contactPerson} onChange={(event) => update('contactPerson', event.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 disabled:cursor-not-allowed disabled:bg-slate-100" />
            </label>
            <label className="text-xs font-bold text-slate-700">เลขผู้เสียภาษี (ถ้ามี)
              <input disabled={saving} inputMode="numeric" maxLength={13} value={form.taxId} onChange={(event) => update('taxId', event.target.value.replace(/\D/g, ''))} className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 disabled:cursor-not-allowed disabled:bg-slate-100" />
            </label>
            <label className="text-xs font-bold text-slate-700">รหัสสาขาภาษี
              <input disabled={saving} inputMode="numeric" maxLength={5} value={form.taxBranchCode} onChange={(event) => update('taxBranchCode', event.target.value.replace(/\D/g, ''))} className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 disabled:cursor-not-allowed disabled:bg-slate-100" />
            </label>
            <label className="text-xs font-bold text-slate-700">อีเมล
              <input disabled={saving} type="email" value={form.email} onChange={(event) => update('email', event.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 disabled:cursor-not-allowed disabled:bg-slate-100" />
            </label>
            <label className="text-xs font-bold text-slate-700 md:col-span-2">ที่อยู่ตามเอกสาร
              <textarea disabled={saving} rows={2} value={form.address} onChange={(event) => update('address', event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 p-3 disabled:cursor-not-allowed disabled:bg-slate-100" />
            </label>
            <label className="text-xs font-bold text-slate-700 md:col-span-2">หมายเหตุ
              <textarea disabled={saving} rows={2} value={form.notes} onChange={(event) => update('notes', event.target.value)} placeholder="เช่น ร้านซ่อมโน้ตบุ๊ก / ช่างรับซ่อมบอร์ด" className="mt-1 w-full rounded-xl border border-slate-200 p-3 disabled:cursor-not-allowed disabled:bg-slate-100" />
            </label>
          </div>

          {error ? <p className="rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-700">{error}</p> : null}

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} disabled={saving} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50">ยกเลิก</button>
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50">
              <Plus size={16} />{saving ? 'กำลังบันทึก...' : 'บันทึกและเลือกผู้รับซ่อม'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpensePayeeQuickCreateDialog;
