import React, { useMemo, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';

const newItem = () => ({
  categoryId: '',
  description: '',
  quantity: '1',
  unitAmount: '',
  vatAmount: '0',
  withholdingTaxAmount: '0',
});

const TaxExpenseCreateForm = ({ categories, payees, repairReasons = [], saving, onSubmit }) => {
  const [expensePayeeId, setExpensePayeeId] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [repairSubcontractId, setRepairSubcontractId] = useState('');
  const [expenseDate, setExpenseDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');
  const [items, setItems] = useState([newItem()]);
  const [formError, setFormError] = useState('');

  const total = useMemo(() => items.reduce((sum, item) => {
    const quantity = Number(item.quantity || 0);
    const unit = Number(item.unitAmount || 0);
    const vat = Number(item.vatAmount || 0);
    return sum + (quantity * unit) + vat;
  }, 0), [items]);

  const updateItem = (index, key, value) =>
    setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item));

  const submit = async (event) => {
    event.preventDefault();
    setFormError('');
    if (!expensePayeeId || !documentNumber || items.some((item) => !item.categoryId || !item.description || !item.unitAmount)) {
      setFormError('กรุณาระบุผู้รับเงิน เลขเอกสาร และข้อมูลค่าใช้จ่ายทุกรายการ');
      return;
    }
    try {
      const repairReason = repairReasons.find((item) => Number(item.id) === Number(repairSubcontractId));
      await onSubmit({
        expensePayeeId: Number(expensePayeeId),
        repairJobId: repairReason?.repairJob?.id,
        repairSubcontractId: repairReason?.id,
        documentNumber,
        expenseDate,
        documentDate: expenseDate,
        note: note || undefined,
        items: items.map((item) => ({
          ...item,
          categoryId: Number(item.categoryId),
          quantity: Number(item.quantity),
          unitAmount: Number(item.unitAmount),
          vatAmount: Number(item.vatAmount || 0),
          withholdingTaxAmount: Number(item.withholdingTaxAmount || 0),
        })),
      });
      setDocumentNumber('');
      setNote('');
      setItems([newItem()]);
    } catch (_) {}
  };

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-black text-slate-900">บันทึกค่าใช้จ่าย</h2>
          <p className="text-xs text-slate-500">อ้างอิง ExpensePayee ของร้านและเอกสารจริง</p>
        </div>
        <span className="text-sm font-black text-slate-900">฿{total.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
      </div>

      {formError && <div className="rounded-lg bg-rose-50 p-3 text-xs font-semibold text-rose-700">{formError}</div>}

      <div className="grid gap-3 md:grid-cols-3">
        <label className="text-xs font-bold text-slate-700">ผู้รับเงินค่าใช้จ่าย
          <select value={expensePayeeId} onChange={(event) => setExpensePayeeId(event.target.value)} className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2">
            <option value="">เลือกผู้รับเงินค่าใช้จ่าย</option>
            {payees.map((payee) => <option key={payee.id} value={payee.id}>{payee.name}{payee.taxId ? ` · ${payee.taxId}` : ''}</option>)}
          </select>
        </label>
        <label className="text-xs font-bold text-slate-700">เลขที่เอกสาร
          <input value={documentNumber} onChange={(event) => setDocumentNumber(event.target.value)} className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-2" />
        </label>
        <label className="text-xs font-bold text-slate-700">วันที่ค่าใช้จ่าย
          <input type="date" value={expenseDate} onChange={(event) => setExpenseDate(event.target.value)} className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-2" />
        </label>
      </div>

      <label className="block text-xs font-bold text-slate-700">เหตุผลการจ่ายสำหรับงานซ่อมภายนอก (ถ้ามี)
        <select value={repairSubcontractId} onChange={(event) => {
          const value = event.target.value;
          setRepairSubcontractId(value);
          const reason = repairReasons.find((item) => String(item.id) === value);
          if (reason) setExpensePayeeId(String(reason.expensePayeeId));
        }} className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-2">
          <option value="">ค่าใช้จ่ายทั่วไป — ไม่อ้างอิงงานซ่อม</option>
          {repairReasons.map((reason) => <option key={reason.id} value={reason.id}>{reason.repairJob?.jobNo} · {reason.repairJob?.deviceModel} · {reason.providerName} · {reason.status}</option>)}
        </select>
      </label>

      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="grid gap-2 rounded-xl bg-slate-50 p-3 md:grid-cols-[1.1fr_1.5fr_.5fr_.7fr_.7fr_auto]">
            <select value={item.categoryId} onChange={(event) => updateItem(index, 'categoryId', event.target.value)} className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs">
              <option value="">หมวดค่าใช้จ่าย</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.code} · {category.name}</option>)}
            </select>
            <input value={item.description} onChange={(event) => updateItem(index, 'description', event.target.value)} placeholder="รายละเอียด" className="h-9 rounded-lg border border-slate-200 px-2 text-xs" />
            <input type="number" min="0.01" step="0.01" value={item.quantity} onChange={(event) => updateItem(index, 'quantity', event.target.value)} placeholder="จำนวน" className="h-9 rounded-lg border border-slate-200 px-2 text-xs" />
            <input type="number" min="0" step="0.01" value={item.unitAmount} onChange={(event) => updateItem(index, 'unitAmount', event.target.value)} placeholder="ก่อน VAT" className="h-9 rounded-lg border border-slate-200 px-2 text-xs" />
            <input type="number" min="0" step="0.01" value={item.vatAmount} onChange={(event) => updateItem(index, 'vatAmount', event.target.value)} placeholder="VAT" className="h-9 rounded-lg border border-slate-200 px-2 text-xs" />
            <button type="button" disabled={items.length === 1} onClick={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-rose-600 hover:bg-rose-50 disabled:text-slate-300"><Trash2 size={16} /></button>
          </div>
        ))}
        <button type="button" onClick={() => setItems((current) => [...current, newItem()])} className="inline-flex items-center gap-1 text-xs font-bold text-slate-700"><Plus size={15} /> เพิ่มรายการ</button>
      </div>

      <label className="block text-xs font-bold text-slate-700">หมายเหตุ
        <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={2} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs" />
      </label>

      <button type="submit" disabled={saving || !categories.length || !payees.length} className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-bold text-white disabled:bg-slate-300"><Save size={16} />{saving ? 'กำลังบันทึก...' : 'บันทึกค่าใช้จ่าย'}</button>
      {!categories.length && <p className="text-xs text-amber-700">ยังไม่มีหมวดค่าใช้จ่ายสำหรับร้านนี้</p>}
      {!payees.length && <p className="text-xs text-amber-700">ยังไม่มีผู้รับเงินค่าใช้จ่ายสำหรับร้านนี้</p>}
    </form>
  );
};

export default TaxExpenseCreateForm;
