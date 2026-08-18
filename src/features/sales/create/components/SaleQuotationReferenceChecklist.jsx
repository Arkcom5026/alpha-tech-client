import React, { useEffect, useMemo, useState } from 'react';
import { Check, ChevronDown, ChevronUp, ClipboardList } from 'lucide-react';

import { getQuotation } from '@/features/quotation/api/quotationApi';

const keyForItem = (item, index) => String(item?.id ?? `line-${index}`);

const SaleQuotationReferenceChecklist = ({ quotationId, disabled = false }) => {
  const [expanded, setExpanded] = useState(false);
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(() => new Set());

  useEffect(() => {
    let alive = true;
    setExpanded(false);
    setChecked(new Set());
    setQuotation(null);

    if (!quotationId) return () => { alive = false; };

    setLoading(true);
    getQuotation(quotationId)
      .then((row) => {
        if (alive) setQuotation(row || null);
      })
      .catch(() => {
        if (alive) setQuotation(null);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => { alive = false; };
  }, [quotationId]);

  const items = useMemo(
    () => (Array.isArray(quotation?.items) ? quotation.items : []),
    [quotation?.items]
  );

  if (!quotationId) return null;

  const label = quotation
    ? `${quotation.code} · Rev.${Number(quotation.revisionNumber || 0)}`
    : `Quotation #${quotationId}`;

  const toggleChecked = (item, index) => {
    const key = keyForItem(item, index);
    setChecked((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div
      data-testid="sale-quotation-reference-checklist"
      className="shrink-0 rounded-xl border border-slate-200 bg-slate-50"
    >
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        disabled={disabled || loading || !quotation}
        className="flex w-full items-center gap-2 px-3 py-2 text-left disabled:cursor-not-allowed disabled:opacity-60"
        aria-expanded={expanded}
      >
        <ClipboardList className="h-4 w-4 shrink-0 text-teal-700" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-semibold text-slate-800">
            <span className="truncate">อ้างอิง {label}</span>
            <span className="font-normal text-slate-500">
              {loading ? 'กำลังโหลดรายการ…' : `${items.length} รายการ`}
            </span>
          </div>
          {expanded ? (
            <p className="text-[11px] text-slate-500">ใช้เป็นเช็คลิสต์เตรียมสินค้าเท่านั้น ไม่เชื่อมกับตะกร้าขาย</p>
          ) : null}
        </div>
        <span className="text-[11px] font-medium text-slate-500">{expanded ? 'หุบรายการ' : 'ดูรายการ'}</span>
        {expanded ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-slate-500" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
        )}
      </button>

      {expanded ? (
        <div className="border-t border-slate-200 px-3 py-2" data-testid="sale-quotation-reference-checklist-items">
          {items.length ? (
            <div className="grid gap-1.5 md:grid-cols-2 xl:grid-cols-3">
              {items.map((item, index) => {
                const key = keyForItem(item, index);
                const done = checked.has(key);
                const quantity = Number(item?.quantity || 0).toLocaleString('th-TH');
                const unitName = String(item?.unitName || '').trim();
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleChecked(item, index)}
                    className={`flex min-w-0 items-start gap-2 rounded-lg border px-2.5 py-2 text-left transition-colors ${
                      done
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                        : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                    }`}
                    aria-pressed={done}
                  >
                    <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 bg-white'}`}>
                      {done ? <Check className="h-3 w-3" /> : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate text-xs font-semibold ${done ? 'line-through opacity-70' : ''}`}>
                        {item?.title || `รายการที่ ${index + 1}`}
                      </span>
                      <span className="block text-[11px] text-slate-500">
                        จำนวน {quantity}{unitName ? ` ${unitName}` : ''}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-500">ใบเสนอราคานี้ไม่มีรายการสินค้า</p>
          )}
          <p className="mt-2 text-[10px] text-slate-400">เครื่องหมายถูกเป็นสถานะชั่วคราวบนหน้าจอนี้เท่านั้น ไม่บันทึกลงใบเสนอราคา สต๊อก หรือตะกร้าขาย</p>
        </div>
      ) : null}
    </div>
  );
};

export default SaleQuotationReferenceChecklist;
