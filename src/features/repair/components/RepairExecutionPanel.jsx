import React, { useMemo, useState } from 'react';
import repairApi from '../api/repairApi';

const STATUS_COPY = {
  APPROVED: {
    title: 'ลูกค้าอนุมัติแล้ว',
    description: 'เริ่มงานซ่อมเมื่อช่างพร้อมดำเนินการจริง',
  },
  REPAIRING: {
    title: 'กำลังซ่อม',
    description: 'บันทึกอะไหล่ที่ใช้ พักรออะไหล่ หรือสรุปงานเมื่อซ่อมเสร็จ',
  },
  WAITING_PARTS: {
    title: 'รออะไหล่',
    description: 'งานถูกพักไว้ชั่วคราว เมื่ออะไหล่พร้อมให้กลับมาดำเนินการซ่อมต่อ',
  },
  WAITING_QC: {
    title: 'ตรวจสอบหลังซ่อม',
    description: 'ตรวจ checklist ให้ครบก่อนระบุว่าผ่านหรือส่งกลับไปแก้งาน',
  },
  QC_FAILED: {
    title: 'QC ไม่ผ่าน',
    description: 'งานต้องกลับไปแก้ไขก่อนนำมาตรวจซ้ำอีกครั้ง',
  },
};

const QC_ITEMS = [
  { key: 'reported_symptom', label: 'อาการที่ลูกค้าแจ้งได้รับการแก้ไขแล้ว' },
  { key: 'function_test', label: 'ฟังก์ชันหลักของเครื่องทำงานปกติ' },
  { key: 'stability_test', label: 'ทดสอบความเสถียรแล้วไม่พบอาการผิดปกติ' },
  { key: 'physical_check', label: 'ตรวจสภาพภายนอกและอุปกรณ์ประกอบก่อนส่งมอบ' },
];

const normalizeProducts = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.products)) return payload.products;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const productName = (item) =>
  item?.name || item?.productName || item?.product?.name || `สินค้า #${item?.id || item?.productId || '-'}`;

const productId = (item) => Number(item?.id || item?.productId || item?.product?.id || 0);

const stockText = (item) => {
  const quantity = item?.stockQuantity ?? item?.quantity ?? item?.stockBalance?.quantity;
  return quantity === undefined || quantity === null ? 'ตรวจสอบสต๊อกเมื่อเบิก' : `คงเหลือ ${Number(quantity)}`;
};

const RepairExecutionPanel = ({ job, submitting, onWorkflowAction, onAddPart }) => {
  const workflow = job?.workflow || { status: 'RECEIVED', availableActions: [] };
  const status = workflow.status;
  const actionNames = useMemo(
    () => new Set((workflow.availableActions || []).map((item) => item.action)),
    [workflow.availableActions]
  );
  const [note, setNote] = useState('');
  const [completion, setCompletion] = useState({ workPerformed: '', resultSummary: '', technicianNote: '' });
  const [qcChecks, setQcChecks] = useState(() => Object.fromEntries(QC_ITEMS.map((item) => [item.key, false])));
  const [qcNote, setQcNote] = useState('');
  const [partSearch, setPartSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [qtyUsed, setQtyUsed] = useState(1);

  if (!['APPROVED', 'REPAIRING', 'WAITING_PARTS', 'WAITING_QC', 'QC_FAILED'].includes(status)) return null;

  const run = (action, extra = {}) =>
    onWorkflowAction({
      action,
      expectedWorkflowStatus: status,
      note: note.trim() || undefined,
      ...extra,
    });

  const searchParts = async () => {
    const query = partSearch.trim();
    if (!query) return;
    setSearching(true);
    setSearchError('');
    try {
      const payload = await repairApi.searchPartProducts(query);
      setProducts(normalizeProducts(payload).filter((item) => productId(item) > 0));
    } catch (error) {
      setProducts([]);
      setSearchError(error.message);
    } finally {
      setSearching(false);
    }
  };

  const addSelectedPart = async () => {
    const id = productId(selected);
    if (!id || Number(qtyUsed) <= 0) return;
    await onAddPart({ productId: id, qtyUsed: Number(qtyUsed) });
    setSelected(null);
    setQtyUsed(1);
    setPartSearch('');
    setProducts([]);
  };

  const submitCompletion = () => run('COMPLETE_REPAIR', { repairCompletion: completion });
  const qcPayload = () => ({
    checks: QC_ITEMS.map((item) => ({ ...item, passed: Boolean(qcChecks[item.key]) })),
    note: qcNote.trim() || undefined,
  });
  const allQcPassed = QC_ITEMS.every((item) => qcChecks[item.key]);
  const anyQcFailed = QC_ITEMS.some((item) => !qcChecks[item.key]);
  const copy = STATUS_COPY[status];

  return (
    <section className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Repair Execution</p>
          <h3 className="mt-1 text-xl font-black text-slate-950">{copy.title}</h3>
          <p className="mt-1 text-sm text-slate-500">{copy.description}</p>
        </div>
        <span className="w-fit rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
          {status}
        </span>
      </div>

      {actionNames.has('START_REPAIR') ? (
        <WorkflowAction
          title="เริ่มงานซ่อม"
          description="ยืนยันว่าช่างเริ่มดำเนินงานจริงแล้ว จากนั้นระบบจึงเปิดการเบิกอะไหล่"
          button="เริ่มซ่อม"
          disabled={submitting}
          onClick={() => run('START_REPAIR')}
        />
      ) : null}

      {status === 'REPAIRING' ? (
        <div className="mt-5 grid gap-5 xl:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h4 className="font-black text-slate-950">อะไหล่ที่ใช้ในงานนี้</h4>
            <p className="mt-1 text-xs text-slate-500">ค้นหาด้วยชื่อสินค้า รุ่น หรือรหัสสินค้า โดยไม่ต้องจำ Product ID</p>

            <div className="mt-3 flex gap-2">
              <input
                value={partSearch}
                onChange={(event) => setPartSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    searchParts();
                  }
                }}
                placeholder="ค้นหาอะไหล่"
                className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3"
              />
              <button
                type="button"
                disabled={searching || !partSearch.trim()}
                onClick={searchParts}
                className="rounded-xl bg-slate-900 px-4 font-black text-white disabled:opacity-40"
              >
                {searching ? 'ค้นหา...' : 'ค้นหา'}
              </button>
            </div>

            {searchError ? <p className="mt-2 text-sm font-bold text-red-600">{searchError}</p> : null}

            {products.length ? (
              <div className="mt-3 max-h-64 space-y-2 overflow-auto">
                {products.map((item) => {
                  const id = productId(item);
                  const active = productId(selected) === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setSelected(item)}
                      className={`w-full rounded-xl border p-3 text-left ${active ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white'}`}
                    >
                      <p className="font-black text-slate-900">{productName(item)}</p>
                      <p className="mt-1 text-xs text-slate-500">{stockText(item)}</p>
                    </button>
                  );
                })}
              </div>
            ) : null}

            {selected ? (
              <div className="mt-3 rounded-xl border border-emerald-200 bg-white p-3">
                <p className="font-black text-slate-900">เลือก: {productName(selected)}</p>
                <div className="mt-3 flex gap-2">
                  <input
                    type="number"
                    min="1"
                    value={qtyUsed}
                    onChange={(event) => setQtyUsed(event.target.value)}
                    className="w-28 rounded-xl border border-slate-300 px-3 py-2"
                  />
                  <button
                    type="button"
                    disabled={submitting || Number(qtyUsed) <= 0}
                    onClick={addSelectedPart}
                    className="rounded-xl bg-emerald-700 px-4 font-black text-white disabled:opacity-40"
                  >
                    เบิกและบันทึกอะไหล่
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-5">
            {actionNames.has('WAIT_FOR_PARTS') ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <h4 className="font-black text-amber-950">ต้องรออะไหล่?</h4>
                <p className="mt-1 text-sm text-amber-800">พักงานซ่อมพร้อมบันทึกเหตุผล เพื่อให้หน้าร้านเห็นว่าคิวนี้ติดที่อะไร</p>
                <textarea
                  rows={3}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="เช่น รอ SSD 1TB จากคลังกลาง"
                  className="mt-3 w-full rounded-xl border border-amber-200 bg-white px-4 py-3"
                />
                <button
                  type="button"
                  disabled={submitting || !note.trim()}
                  onClick={() => run('WAIT_FOR_PARTS')}
                  className="mt-3 rounded-xl bg-amber-600 px-5 py-3 font-black text-white disabled:opacity-40"
                >
                  เปลี่ยนเป็นรออะไหล่
                </button>
              </div>
            ) : null}

            {actionNames.has('COMPLETE_REPAIR') ? (
              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                <h4 className="font-black text-blue-950">ซ่อมเสร็จแล้ว</h4>
                <p className="mt-1 text-sm text-blue-800">สรุปสิ่งที่ทำและผลหลังซ่อมก่อนส่งต่อให้ผู้ตรวจ QC</p>
                <textarea
                  rows={3}
                  value={completion.workPerformed}
                  onChange={(event) => setCompletion((current) => ({ ...current, workPerformed: event.target.value }))}
                  placeholder="งานที่ดำเนินการ *"
                  className="mt-3 w-full rounded-xl border border-blue-200 bg-white px-4 py-3"
                />
                <textarea
                  rows={3}
                  value={completion.resultSummary}
                  onChange={(event) => setCompletion((current) => ({ ...current, resultSummary: event.target.value }))}
                  placeholder="ผลหลังซ่อม *"
                  className="mt-3 w-full rounded-xl border border-blue-200 bg-white px-4 py-3"
                />
                <textarea
                  rows={2}
                  value={completion.technicianNote}
                  onChange={(event) => setCompletion((current) => ({ ...current, technicianNote: event.target.value }))}
                  placeholder="หมายเหตุเพิ่มเติมของช่าง"
                  className="mt-3 w-full rounded-xl border border-blue-200 bg-white px-4 py-3"
                />
                <button
                  type="button"
                  disabled={submitting || !completion.workPerformed.trim() || !completion.resultSummary.trim()}
                  onClick={submitCompletion}
                  className="mt-3 rounded-xl bg-blue-700 px-5 py-3 font-black text-white disabled:opacity-40"
                >
                  ส่งตรวจหลังซ่อม
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {actionNames.has('RESUME_REPAIR') ? (
        <WorkflowAction
          title="อะไหล่พร้อมแล้ว"
          description="กลับเข้าสู่ขั้นกำลังซ่อม แล้วจึงเบิกอะไหล่และดำเนินงานต่อ"
          button="กลับมาซ่อมต่อ"
          disabled={submitting}
          onClick={() => run('RESUME_REPAIR')}
        />
      ) : null}

      {status === 'WAITING_QC' ? (
        <div className="mt-5 rounded-2xl border border-violet-200 bg-violet-50 p-4">
          <h4 className="font-black text-violet-950">Checklist ตรวจหลังซ่อม</h4>
          <p className="mt-1 text-sm text-violet-800">ติ๊กเฉพาะรายการที่ตรวจจริงแล้วผ่าน หากมีข้อใดไม่ผ่านให้ส่งกลับไปแก้งาน</p>
          <div className="mt-4 space-y-2">
            {QC_ITEMS.map((item) => (
              <label key={item.key} className="flex items-start gap-3 rounded-xl border border-violet-100 bg-white p-3">
                <input
                  type="checkbox"
                  checked={qcChecks[item.key]}
                  onChange={(event) => setQcChecks((current) => ({ ...current, [item.key]: event.target.checked }))}
                  className="mt-1 h-4 w-4"
                />
                <span className="text-sm font-bold text-slate-800">{item.label}</span>
              </label>
            ))}
          </div>
          <textarea
            rows={3}
            value={qcNote}
            onChange={(event) => setQcNote(event.target.value)}
            placeholder="ผลการทดสอบ / เหตุผลหากไม่ผ่าน"
            className="mt-3 w-full rounded-xl border border-violet-200 bg-white px-4 py-3"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={submitting || !allQcPassed}
              onClick={() => run('PASS_QC', { qc: qcPayload() })}
              className="rounded-xl bg-emerald-700 px-5 py-3 font-black text-white disabled:opacity-40"
            >
              QC ผ่าน — พร้อมส่งมอบ
            </button>
            <button
              type="button"
              disabled={submitting || !anyQcFailed || !qcNote.trim()}
              onClick={() => run('FAIL_QC', { qc: qcPayload() })}
              className="rounded-xl bg-red-700 px-5 py-3 font-black text-white disabled:opacity-40"
            >
              QC ไม่ผ่าน — ส่งกลับแก้งาน
            </button>
          </div>
        </div>
      ) : null}

      {actionNames.has('REWORK_AFTER_QC') ? (
        <WorkflowAction
          title="ส่งกลับให้ช่างแก้งาน"
          description="กลับเข้าสู่ขั้นกำลังซ่อมเพื่อแก้จุดที่ QC ตรวจไม่ผ่าน แล้วต้องส่งตรวจใหม่อีกครั้ง"
          button="เริ่มแก้งาน"
          disabled={submitting}
          onClick={() => run('REWORK_AFTER_QC')}
        />
      ) : null}
    </section>
  );
};

const WorkflowAction = ({ title, description, button, disabled, onClick }) => (
  <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
    <p className="font-black text-slate-950">{title}</p>
    <p className="mt-1 text-sm text-slate-500">{description}</p>
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="mt-3 rounded-xl bg-emerald-700 px-5 py-3 font-black text-white disabled:opacity-40"
    >
      {button}
    </button>
  </div>
);

export default RepairExecutionPanel;
