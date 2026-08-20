import { useEffect, useMemo, useState } from 'react';
import { buildPreparationSeedLines } from '@/features/sales/documents/preparation/adapters/saleDocumentPreparationAdapter';

const money = (value) => Number(value || 0).toLocaleString('th-TH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const emptyLine = () => ({ description: '', quantity: 1, unitName: 'ชิ้น', unitPrice: 0 });

const DeliveryNotePreparationPanel = ({
  preparation,
  sourceSaleItems = [],
  saving = false,
  onCreate,
  onSave,
  onLock,
}) => {
  const [lines, setLines] = useState([]);

  useEffect(() => {
    if (!preparation) {
      setLines([]);
      return;
    }
    setLines((Array.isArray(preparation.lines) ? preparation.lines : []).map((line) => ({
      description: line?.description || '',
      quantity: Number(line?.quantity || 1),
      unitName: line?.unitName || 'ชิ้น',
      unitPrice: Number(line?.unitPrice || 0),
    })));
  }, [preparation]);

  const documentTotal = useMemo(() => lines.reduce((sum, line) => (
    sum + (Number(line.quantity || 0) * Number(line.unitPrice || 0))
  ), 0), [lines]);
  const sourceTotal = Number(preparation?.sourceTotal || 0);
  const outOfBudget = Math.max(sourceTotal - documentTotal, 0);
  const exceedsSource = documentTotal > sourceTotal + 0.005;
  const isLocked = preparation?.status === 'LOCKED';
  const canLock = !isLocked && !saving && !exceedsSource && lines.length > 0 && documentTotal > 0;

  if (!preparation) {
    return (
      <section className="mx-auto mb-4 max-w-[210mm] rounded-2xl border border-teal-200 bg-teal-50/80 p-4 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-slate-900">จัดเตรียมรายการเอกสารสำหรับหน่วยงาน</h2>
            <p className="mt-1 text-sm text-slate-600">
              สร้างแบบร่างชุดเดียวเพื่อแก้รายการบนเอกสาร โดยไม่เปลี่ยนรายการขายหรือสต๊อกจริง
            </p>
          </div>
          <button
            type="button"
            onClick={onCreate}
            disabled={saving}
            className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'กำลังสร้าง...' : 'เริ่มจัดเตรียมเอกสาร'}
          </button>
        </div>
      </section>
    );
  }

  const updateLine = (index, field, value) => {
    if (isLocked) return;
    setLines((current) => current.map((line, lineIndex) => (
      lineIndex === index ? { ...line, [field]: value } : line
    )));
  };

  const removeLine = (index) => {
    if (isLocked) return;
    setLines((current) => current.filter((_, lineIndex) => lineIndex !== index));
  };

  return (
    <section className="mx-auto mb-4 max-w-[210mm] rounded-2xl border border-teal-200 bg-white p-4 shadow-sm print:hidden">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-slate-900">รายการเอกสารสำหรับหน่วยงาน</h2>
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${isLocked ? 'bg-slate-200 text-slate-700' : 'bg-teal-100 text-teal-800'}`}>
              {isLocked ? 'LOCKED' : 'DRAFT'}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            {isLocked
              ? 'ชุดข้อมูลนี้ถูกยืนยันและล็อกแล้ว รายการสำหรับพิมพ์จะอ่านจาก snapshot ชุดนี้'
              : 'แก้ทับแบบร่างชุดเดิมได้จนกว่าจะกดยืนยันแบบร่าง'}
          </p>
        </div>
        {!isLocked ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setLines(buildPreparationSeedLines(sourceSaleItems))}
              disabled={saving}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              คัดลอกรายการขายเป็นจุดเริ่มต้น
            </button>
            <button
              type="button"
              onClick={() => setLines((current) => [...current, emptyLine()])}
              disabled={saving}
              className="rounded-xl border border-teal-300 bg-teal-50 px-3 py-2 text-sm font-medium text-teal-800 hover:bg-teal-100 disabled:opacity-60"
            >
              + เพิ่มรายการ
            </button>
          </div>
        ) : null}
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-2 text-left font-medium">รายการบนเอกสาร</th>
              <th className="w-24 px-3 py-2 text-right font-medium">จำนวน</th>
              <th className="w-28 px-3 py-2 text-left font-medium">หน่วย</th>
              <th className="w-32 px-3 py-2 text-right font-medium">ราคา/หน่วย</th>
              <th className="w-28 px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {lines.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-500">ยังไม่มีรายการในแบบร่าง</td>
              </tr>
            ) : lines.map((line, index) => (
              <tr key={`preparation-line-${index}`} className="border-t border-slate-100">
                <td className="p-2">
                  <input
                    value={line.description}
                    readOnly={isLocked}
                    onChange={(event) => updateLine(index, 'description', event.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 outline-none focus:border-teal-500 read-only:bg-slate-50"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    min="0.001"
                    step="0.001"
                    value={line.quantity}
                    readOnly={isLocked}
                    onChange={(event) => updateLine(index, 'quantity', event.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-right outline-none focus:border-teal-500 read-only:bg-slate-50"
                  />
                </td>
                <td className="p-2">
                  <input
                    value={line.unitName}
                    readOnly={isLocked}
                    onChange={(event) => updateLine(index, 'unitName', event.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 outline-none focus:border-teal-500 read-only:bg-slate-50"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={line.unitPrice}
                    readOnly={isLocked}
                    onChange={(event) => updateLine(index, 'unitPrice', event.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-right outline-none focus:border-teal-500 read-only:bg-slate-50"
                  />
                </td>
                <td className="p-2 text-right">
                  {!isLocked ? (
                    <button
                      type="button"
                      onClick={() => removeLine(index)}
                      className="rounded-lg px-2 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50"
                    >
                      ลบ
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div className="grid min-w-[300px] grid-cols-2 gap-x-5 gap-y-1 text-sm">
          <span className="text-slate-500">ยอดธุรกรรมจริง</span><span className="text-right font-medium">{money(sourceTotal)}</span>
          <span className="text-slate-500">ยอดเอกสารหน่วยงาน</span><span className="text-right font-medium">{money(documentTotal)}</span>
          <span className="text-slate-500">ยอดนอกงบประมาณ</span><span className="text-right font-semibold text-teal-700">{money(outOfBudget)}</span>
        </div>
        {!isLocked ? (
          <div className="text-right">
            {exceedsSource ? (
              <p className="mb-2 text-sm font-medium text-rose-600">ยอดเอกสารต้องไม่เกินยอดธุรกรรมจริง</p>
            ) : null}
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => onSave?.(lines)}
                disabled={saving || exceedsSource}
                className="rounded-xl border border-teal-300 bg-white px-4 py-2 text-sm font-semibold text-teal-800 hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'กำลังบันทึก...' : 'บันทึกแบบร่าง'}
              </button>
              <button
                type="button"
                onClick={onLock}
                disabled={!canLock}
                className="rounded-xl bg-teal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                ยืนยันแบบร่าง
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm font-medium text-slate-600">แบบร่างถูกล็อกแล้ว และไม่สามารถแก้รายการเดิมได้</p>
        )}
      </div>
    </section>
  );
};

export default DeliveryNotePreparationPanel;
