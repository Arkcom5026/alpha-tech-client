import React, { useMemo, useState } from 'react';
import { Plus, UserRoundCheck } from 'lucide-react';

const TaxExpenseMasterDataSetup = ({ suppliers, busy, onCreateCategory, onEnablePayee }) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const available = useMemo(() => suppliers.filter((supplier) =>
    !(supplier.capabilities || []).some((entry) => entry.capability === 'EXPENSE_PAYEE')),
  [suppliers]);

  const submitCategory = async (event) => {
    event.preventDefault();
    if (!code.trim() || !name.trim()) return;
    await onCreateCategory({ code: code.trim().toUpperCase(), name: name.trim() });
    setCode('');
    setName('');
  };

  const enablePayee = async () => {
    if (!supplierId) return;
    await onEnablePayee(Number(supplierId));
    setSupplierId('');
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <form onSubmit={submitCategory} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="font-black text-slate-900">เพิ่มหมวดค่าใช้จ่าย</h3>
        <p className="mt-1 text-xs text-slate-500">สร้างหมวดสำหรับร้านปัจจุบัน</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-[.7fr_1.3fr_auto]">
          <input value={code} onChange={(event) => setCode(event.target.value)} placeholder="รหัส เช่น OFFICE" className="h-9 rounded-lg border border-slate-200 px-3 text-xs" />
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="ชื่อหมวด" className="h-9 rounded-lg border border-slate-200 px-3 text-xs" />
          <button disabled={busy || !code.trim() || !name.trim()} className="inline-flex h-9 items-center justify-center gap-1 rounded-lg bg-slate-900 px-3 text-xs font-bold text-white disabled:bg-slate-300"><Plus size={15} />เพิ่ม</button>
        </div>
      </form>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="font-black text-slate-900">กำหนด Supplier ผู้รับเงิน</h3>
        <p className="mt-1 text-xs text-slate-500">เปิดสิทธิ์ EXPENSE_PAYEE โดยไม่กระทบสิทธิ์อื่น</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
          <select value={supplierId} onChange={(event) => setSupplierId(event.target.value)} className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs">
            <option value="">เลือก Supplier</option>
            {available.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}{supplier.taxId ? ` · ${supplier.taxId}` : ''}</option>)}
          </select>
          <button type="button" onClick={enablePayee} disabled={busy || !supplierId} className="inline-flex h-9 items-center justify-center gap-1 rounded-lg bg-slate-900 px-3 text-xs font-bold text-white disabled:bg-slate-300"><UserRoundCheck size={15} />เปิดใช้</button>
        </div>
        {!available.length && <p className="mt-3 text-xs text-emerald-700">Supplier ที่ใช้งานอยู่ถูกกำหนดเป็นผู้รับเงินครบแล้ว</p>}
      </div>
    </div>
  );
};

export default TaxExpenseMasterDataSetup;
