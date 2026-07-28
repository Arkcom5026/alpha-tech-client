import React, { useEffect, useState } from 'react';
import { formatTaxMoney, sourceTypeLabel } from '../utils/inputTaxReceiptLink';

const InputTaxDocumentLinkPanel = ({ links, busyLinkId, onReallocate, onCancel }) => {
  const [drafts, setDrafts] = useState({});
  const [cancelDraft, setCancelDraft] = useState({ linkId: null, reason: '' });
  useEffect(() => {
    setDrafts(Object.fromEntries((links || []).map((link) => [link.id, {
      allocatedSubtotal: link.allocatedSubtotal,
      allocatedVatAmount: link.allocatedVatAmount,
      allocatedTotalAmount: link.allocatedTotalAmount,
    }])));
  }, [links]);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-4"><h2 className="font-black text-slate-900">ใบรับที่ผูกกับเอกสารนี้</h2><p className="text-xs text-slate-500">ยกเลิกแล้วจะยังคงประวัติไว้</p></div>
      <div className="divide-y divide-slate-100">
        {(links || []).map((link) => {
          const draft = drafts[link.id] || {};
          const active = link.state === 'ACTIVE';
          return (
            <div key={link.id} className="space-y-3 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><p className="font-bold text-slate-900">{link.receiptCode}</p><p className="text-xs text-slate-500">{sourceTypeLabel[link.sourceType]} · {link.deliveryNoteNumber || 'ไม่มีเลขใบส่งสินค้า'}</p></div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{active ? 'ใช้งานอยู่' : 'ยกเลิกแล้ว'}</span>
              </div>
              {active ? (
                <>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {[
                      ['allocatedSubtotal', 'ก่อน VAT'],
                      ['allocatedVatAmount', 'VAT'],
                      ['allocatedTotalAmount', 'รวม'],
                    ].map(([field, label]) => <label key={field}><span className="mb-1 block text-xs font-bold text-slate-500">{label}</span><input type="number" min="0" step="0.01" value={draft[field] ?? 0} onChange={(event) => setDrafts((current) => ({ ...current, [link.id]: { ...current[link.id], [field]: event.target.value } }))} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-right text-sm" /></label>)}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" disabled={busyLinkId === link.id} onClick={() => onReallocate(link, draft)} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">บันทึกยอดจัดสรร</button>
                    <button type="button" disabled={busyLinkId === link.id} onClick={() => setCancelDraft({ linkId: link.id, reason: '' })} className="rounded-lg border border-rose-300 px-3 py-2 text-xs font-bold text-rose-700 disabled:opacity-50">ยกเลิกการผูก</button>
                  </div>
                  {cancelDraft.linkId === link.id && (
                    <div className="space-y-2 rounded-xl border border-rose-200 bg-rose-50 p-3">
                      <label>
                        <span className="mb-1 block text-xs font-bold text-rose-800">เหตุผลที่ยกเลิกการผูก</span>
                        <textarea
                          rows={2}
                          value={cancelDraft.reason}
                          onChange={(event) => setCancelDraft((current) => ({ ...current, reason: event.target.value }))}
                          className="w-full rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm"
                        />
                      </label>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={busyLinkId === link.id || !cancelDraft.reason.trim()}
                          onClick={async () => {
                            await onCancel(link, cancelDraft.reason.trim());
                            setCancelDraft({ linkId: null, reason: '' });
                          }}
                          className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                        >
                          ยืนยันยกเลิกการผูก
                        </button>
                        <button type="button" disabled={busyLinkId === link.id} onClick={() => setCancelDraft({ linkId: null, reason: '' })} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-600 disabled:opacity-50">ไม่ยกเลิก</button>
                      </div>
                    </div>
                  )}
                </>
              ) : <p className="text-sm text-slate-500">ยอดเดิม {formatTaxMoney(link.allocatedTotalAmount)} · {link.cancelReason || 'ไม่มีเหตุผลกำกับ'}</p>}
            </div>
          );
        })}
        {(!links || links.length === 0) && <div className="p-8 text-center text-sm text-slate-500">เอกสารนี้ยังไม่มีใบรับสินค้าที่ผูกไว้</div>}
      </div>
    </div>
  );
};

export default InputTaxDocumentLinkPanel;
