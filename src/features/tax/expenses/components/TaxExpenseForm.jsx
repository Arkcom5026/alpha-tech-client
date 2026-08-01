import React, { useMemo, useState } from 'react';
import { Plus, Save, Tags, Trash2 } from 'lucide-react';
import { formatTaxExpenseMoney } from '../presentation/taxExpensePresentation';

const emptyItem = (categoryId = '') => ({
  categoryId,
  description: '',
  quantity: 1,
  unitAmount: '',
  vatAmount: 0,
  withholdingTaxAmount: 0,
});

const TaxExpenseForm = ({ categories, saving, onSubmitExpense, onSubmitCategory }) => {
  const [counterpartyName, setCounterpartyName] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');
  const [items, setItems] = useState([emptyItem()]);
  const [categoryCode, setCategoryCode] = useState('');
  const [categoryName, setCategoryName] = useState('');

  const totals = useMemo(() => items.reduce((value, item) => {
    const subtotal = Number(item.quantity || 0) * Number(item.unitAmount || 0);
    const vat = Number(item.vatAmount || 0);
    const withholding = Number(item.withholdingTaxAmount || 0);
    return { subtotal: value.subtotal + subtotal, vat: value.vat + vat, withholding: value.withholding + withholding };
  }, { subtotal: 0, vat: 0, withholding: 0 }), [items]);

  const updateItem = (index, key, value) => {
    setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item));
  };

  const submitExpense = async (event) => {
    event.preventDefault();
    await onSubmitExpense({
      counterpartyType: 'OTHER',
      counterpartyName,
      documentNumber: documentNumber || undefined,
      expenseDate,
      note: note || undefined,
      items: items.map((item) => ({
        ...item,
        categoryId: Number(item.categoryId),
        quantity: Number(item.quantity),
        unitAmount: Number(item.unitAmount),
        subtotalAmount: Number(item.quantity) * Number(item.unitAmount),
        vatAmount: Number(item.vatAmount || 0),
        withholdingTaxAmount: Number(item.withholdingTaxAmount || 0),
      })),
    });
    setCounterpartyName('');
    setDocumentNumber('');
    setNote('');
    setItems([emptyItem()]);
  };

  const submitCategory = async (event) => {
    event.preventDefault();
    await onSubmitCategory({ code: categoryCode, name: categoryName });
    setCategoryCode('');
    setCategoryName('');
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <form onSubmit={submitExpense} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="font-black text-slate-900">บันทึกร่างค่าใช้จ่าย</h2>
          <p className="mt-1 text-sm text-slate-500">ยอดรวมจะคำนวณจากรายการย่อยและตรวจซ้ำโดย Backend</p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <input required value={counterpartyName} onChange={(e) => setCounterpartyName(e.target.value)} placeholder="ผู้รับเงิน / คู่ค้า" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm" />
          <input value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} placeholder="เลขที่เอกสาร" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm" />
          <input required type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm" />
        </div>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="grid gap-2 rounded-xl bg-slate-50 p-3 md:grid-cols-[11rem_minmax(0,1fr)_5rem_7rem_7rem_auto]">
              <select required value={item.categoryId} onChange={(e) => updateItem(index, 'categoryId', e.target.value)} className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm">
                <option value="">เลือกหมวด</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.code} — {category.name}</option>)}
              </select>
              <input required value={item.description} onChange={(e) => updateItem(index, 'description', e.target.value)} placeholder="รายละเอียด" className="rounded-lg border border-slate-300 px-2 py-2 text-sm" />
              <input required min="0.01" step="0.01" type="number" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', e.target.value)} placeholder="จำนวน" className="rounded-lg border border-slate-300 px-2 py-2 text-sm" />
              <input required min="0" step="0.01" type="number" value={item.unitAmount} onChange={(e) => updateItem(index, 'unitAmount', e.target.value)} placeholder="ราคา/หน่วย" className="rounded-lg border border-slate-300 px-2 py-2 text-sm" />
              <input min="0" step="0.01" type="number" value={item.vatAmount} onChange={(e) => updateItem(index, 'vatAmount', e.target.value)} placeholder="VAT" className="rounded-lg border border-slate-300 px-2 py-2 text-sm" />
              <button type="button" disabled={items.length === 1} onClick={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="rounded-lg p-2 text-rose-600 disabled:opacity-30"><Trash2 size={18} /></button>
            </div>
          ))}
          <button type="button" onClick={() => setItems((current) => [...current, emptyItem()])} className="inline-flex items-center gap-2 text-sm font-bold text-blue-700"><Plus size={17} /> เพิ่มรายการ</button>
        </div>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="หมายเหตุ" className="min-h-20 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" />
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-blue-50 p-3">
          <div className="text-sm text-blue-900">ก่อน VAT {formatTaxExpenseMoney(totals.subtotal)} · VAT {formatTaxExpenseMoney(totals.vat)} · รวม {formatTaxExpenseMoney(totals.subtotal + totals.vat)}</div>
          <button disabled={saving || categories.length === 0} className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"><Save size={17} /> บันทึกร่าง</button>
        </div>
      </form>
      <form onSubmit={submitCategory} className="h-fit space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 font-black text-slate-900"><Tags size={18} /> เพิ่มหมวดค่าใช้จ่าย</div>
        <input required value={categoryCode} onChange={(e) => setCategoryCode(e.target.value)} placeholder="รหัส เช่น UTILITIES" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" />
        <input required value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="ชื่อหมวด" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" />
        <button disabled={saving} className="w-full rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-700 disabled:opacity-50">เพิ่มหมวด</button>
      </form>
    </div>
  );
};

export default TaxExpenseForm;
