import React, { useState } from 'react';
import { Plus } from 'lucide-react';

const TaxExpenseCategoryPanel = ({ categories, saving, onCreate }) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [formError, setFormError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setFormError('');
    const normalizedCode = code.trim().toUpperCase();
    const normalizedName = name.trim();
    if (!normalizedCode || !normalizedName) {
      setFormError('กรุณาระบุรหัสและชื่อหมวดค่าใช้จ่าย');
      return;
    }
    try {
      await onCreate({ code: normalizedCode, name: normalizedName });
      setCode('');
      setName('');
    } catch (_) {}
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-black text-slate-900">หมวดค่าใช้จ่าย</h2>
          <p className="mt-1 text-xs text-slate-500">กำหนดหมวดเฉพาะร้านปัจจุบัน เพื่อใช้กับรายการค่าใช้จ่าย</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">ใช้งาน {categories.length} หมวด</span>
      </div>

      <form onSubmit={submit} className="mt-4 grid gap-3 md:grid-cols-[.7fr_1.3fr_auto]">
        <label className="text-xs font-bold text-slate-700">รหัสหมวด
          <input value={code} onChange={(event) => setCode(event.target.value)} placeholder="เช่น OFFICE" className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 uppercase" />
        </label>
        <label className="text-xs font-bold text-slate-700">ชื่อหมวดค่าใช้จ่าย
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="เช่น ค่าใช้จ่ายสำนักงาน" className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3" />
        </label>
        <button type="submit" disabled={saving} className="mt-5 inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-xs font-bold text-white disabled:bg-slate-300">
          <Plus size={15} />{saving ? 'กำลังเพิ่ม...' : 'เพิ่มหมวด'}
        </button>
      </form>

      {formError && <p className="mt-3 text-xs font-semibold text-rose-700">{formError}</p>}

      <div className="mt-4 flex flex-wrap gap-2">
        {categories.map((category) => (
          <span key={category.id} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
            {category.code} · {category.name}
          </span>
        ))}
        {!categories.length && <p className="text-xs text-amber-700">ยังไม่มีหมวดค่าใช้จ่ายสำหรับร้านนี้</p>}
      </div>
    </section>
  );
};

export default TaxExpenseCategoryPanel;
