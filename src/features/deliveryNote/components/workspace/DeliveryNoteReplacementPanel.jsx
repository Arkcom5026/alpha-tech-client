import { useEffect, useMemo, useState } from 'react';

const money = (value) => Number(value || 0).toLocaleString('th-TH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const normalizeLines = (lines = []) => (Array.isArray(lines) ? lines : []).map((line) => ({
  description: line?.description || '',
  quantity: Number(line?.quantity || 1),
  unitName: line?.unitName || 'รายการ',
  unitPrice: Number(line?.unitPrice || 0),
  lineType: line?.lineType || undefined,
}));

const lineTotal = (lines) => lines.reduce((sum, line) => sum + (Number(line.quantity || 0) * Number(line.unitPrice || 0)), 0);

const ReplacementLineTable = ({ title, lines, setLines, readOnly = false, allowAdd = true }) => {
  const updateLine = (index, field, value) => {
    if (readOnly) return;
    setLines((current) => current.map((line, lineIndex) => lineIndex === index ? { ...line, [field]: value } : line));
  };
  const removeLine = (index) => {
    if (readOnly) return;
    setLines((current) => current.filter((_, lineIndex) => lineIndex !== index));
  };

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
      <div className="flex items-center justify-between bg-slate-50 px-3 py-2">
        <span className="text-sm font-semibold text-slate-700">{title}</span>
        {!readOnly && allowAdd ? (
          <button type="button" onClick={() => setLines((current) => [...current, { description: '', quantity: 1, unitName: 'รายการ', unitPrice: 0 }])} className="text-sm font-semibold text-teal-700 hover:text-teal-900">+ เพิ่มรายการ</button>
        ) : null}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-slate-500">
            <tr>
              <th className="px-3 py-2 text-left">รายการ</th>
              <th className="w-24 px-3 py-2 text-right">จำนวน</th>
              <th className="w-28 px-3 py-2 text-left">หน่วย</th>
              <th className="w-32 px-3 py-2 text-right">ราคา/หน่วย</th>
              <th className="w-20 px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {lines.map((line, index) => (
              <tr key={`${title}-${index}`} className="border-t border-slate-100">
                <td className="p-2"><input value={line.description} readOnly={readOnly} onChange={(event) => updateLine(index, 'description', event.target.value)} className="w-full rounded-lg border border-slate-300 px-2 py-1.5 read-only:bg-slate-50" /></td>
                <td className="p-2"><input type="number" min="0.001" step="0.001" value={line.quantity} readOnly={readOnly} onChange={(event) => updateLine(index, 'quantity', event.target.value)} className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-right read-only:bg-slate-50" /></td>
                <td className="p-2"><input value={line.unitName} readOnly={readOnly} onChange={(event) => updateLine(index, 'unitName', event.target.value)} className="w-full rounded-lg border border-slate-300 px-2 py-1.5 read-only:bg-slate-50" /></td>
                <td className="p-2"><input type="number" min="0" step="0.01" value={line.unitPrice} readOnly={readOnly} onChange={(event) => updateLine(index, 'unitPrice', event.target.value)} className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-right read-only:bg-slate-50" /></td>
                <td className="p-2 text-right">{!readOnly ? <button type="button" onClick={() => removeLine(index)} className="text-xs font-medium text-rose-600">ลบ</button> : null}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const DeliveryNoteReplacementPanel = ({ replacement, loading = false, saving = false, onCreate, onSave, onLock }) => {
  const [reason, setReason] = useState('');
  const [inBudgetLines, setInBudgetLines] = useState([]);
  const [outOfBudgetLines, setOutOfBudgetLines] = useState([]);

  useEffect(() => {
    setInBudgetLines(normalizeLines(replacement?.inBudgetLines));
    setOutOfBudgetLines(normalizeLines(replacement?.outOfBudgetLines));
  }, [replacement]);

  const isDraft = replacement?.status === 'DRAFT';
  const isLocked = replacement?.status === 'LOCKED';
  const financialLock = replacement?.financialLock || replacement?.finalSnapshot?.financialLock || null;
  const lockedInBudget = Number(financialLock?.portions?.find?.((item) => item?.portion === 'IN_BUDGET')?.totalAmount || 0);
  const lockedOutBudget = Number(financialLock?.portions?.find?.((item) => item?.portion === 'OUT_OF_BUDGET')?.totalAmount || 0);
  const inBudgetTotal = useMemo(() => lineTotal(inBudgetLines), [inBudgetLines]);
  const outBudgetTotal = useMemo(() => lineTotal(outOfBudgetLines), [outOfBudgetLines]);
  const totalsMatch = Math.abs(inBudgetTotal - lockedInBudget) < 0.005 && Math.abs(outBudgetTotal - lockedOutBudget) < 0.005;

  if (!replacement || isLocked) {
    return (
      <section className="mx-auto mb-4 max-w-[210mm] rounded-2xl border border-amber-200 bg-amber-50/70 p-4 print:hidden">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold text-slate-900">เอกสารฉบับทดแทน</h2>
            <p className="mt-1 text-sm text-slate-600">
              {isLocked
                ? `ฉบับทดแทน #${replacement.replacementNumber} ถูกล็อกแล้ว${replacement.replacesReplacementId ? ` และแทนฉบับเดิม #${replacement.replacesReplacementId}` : ''}`
                : 'ใช้เมื่อหน่วยงานขอจัดรายการใหม่ โดยยอดและภาษีเดิมจะถูกล็อกไว้ทั้งหมด'}
            </p>
            {isLocked && replacement.reason ? <p className="mt-1 text-xs text-slate-500">เหตุผล: {replacement.reason}</p> : null}
          </div>
          <div className="flex min-w-[320px] flex-1 items-center justify-end gap-2">
            <input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="เหตุผลที่ต้องออกฉบับทดแทน" className="min-w-[240px] flex-1 rounded-xl border border-amber-300 bg-white px-3 py-2 text-sm" />
            <button type="button" disabled={saving || loading || !reason.trim()} onClick={() => onCreate?.(reason.trim())} className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
              {saving ? 'กำลังสร้าง...' : (isLocked ? 'สร้างฉบับทดแทนใหม่' : 'สร้างฉบับทดแทน')}
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto mb-4 max-w-[210mm] rounded-2xl border border-amber-300 bg-white p-4 shadow-sm print:hidden">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-slate-900">ฉบับทดแทน #{replacement.replacementNumber}</h2>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">DRAFT</span>
          </div>
          <p className="mt-1 text-sm text-slate-600">แก้รูปแบบรายการได้ แต่ยอด IN_BUDGET / OUT_OF_BUDGET ต้องเท่ากับ Financial Lock เดิมทุกบาท</p>
          <p className="mt-1 text-xs text-slate-500">เหตุผล: {replacement.reason}</p>
        </div>
        <div className="text-right text-sm">
          <div>IN_BUDGET <span className={Math.abs(inBudgetTotal - lockedInBudget) < 0.005 ? 'font-semibold text-teal-700' : 'font-semibold text-rose-600'}>{money(inBudgetTotal)} / {money(lockedInBudget)}</span></div>
          <div>OUT_OF_BUDGET <span className={Math.abs(outBudgetTotal - lockedOutBudget) < 0.005 ? 'font-semibold text-teal-700' : 'font-semibold text-rose-600'}>{money(outBudgetTotal)} / {money(lockedOutBudget)}</span></div>
        </div>
      </div>

      <ReplacementLineTable title="รายการในงบประมาณ" lines={inBudgetLines} setLines={setInBudgetLines} readOnly={!isDraft} allowAdd />
      {lockedOutBudget > 0 ? <ReplacementLineTable title="รายการนอกงบประมาณ (SERVICE_ONLY)" lines={outOfBudgetLines} setLines={setOutOfBudgetLines} readOnly={!isDraft} allowAdd={false} /> : null}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className={`text-sm font-medium ${totalsMatch ? 'text-teal-700' : 'text-rose-600'}`}>
          {totalsMatch ? 'ยอดตรงกับ Financial Lock พร้อมยืนยัน' : 'ยอดยังไม่ตรงกับ Financial Lock'}
        </p>
        <div className="flex gap-2">
          <button type="button" disabled={saving} onClick={() => onSave?.({ inBudgetLines, outOfBudgetLines })} className="rounded-xl border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-800 disabled:opacity-50">บันทึกแบบร่าง</button>
          <button type="button" disabled={saving || !totalsMatch} onClick={onLock} className="rounded-xl bg-amber-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">ยืนยันฉบับทดแทน</button>
        </div>
      </div>
    </section>
  );
};

export default DeliveryNoteReplacementPanel;
