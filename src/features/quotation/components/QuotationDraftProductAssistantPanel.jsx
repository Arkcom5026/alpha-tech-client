import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { feedback } from '@/design-system';
import { getProductsForPos } from '@/features/product/api/productApi';
import { addQuotationLine, getQuotation } from '../api/quotationApi';

const prices = (product) => [
  ['ราคาปลีก', Number(product?.priceRetail || 0)],
  ['ราคาช่าง', Number(product?.priceTechnician || 0)],
  ['ราคาส่ง', Number(product?.priceWholesale || 0)],
];

const QuotationDraftProductAssistantPanel = ({ quotationId }) => {
  const [host, setHost] = useState(null);
  const [quotation, setQuotation] = useState(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let observer;
    const mount = () => {
      const shell = document.querySelector('.quotation-print-shell');
      const a4 = shell?.querySelector('.quotation-a4');
      if (!shell || !a4) return false;
      const node = document.createElement('div');
      node.dataset.quotationProductAssistantHost = 'true';
      shell.insertBefore(node, a4);
      setHost(node);
      return true;
    };
    if (!mount()) {
      observer = new MutationObserver(() => { if (mount()) observer?.disconnect(); });
      observer.observe(document.body, { childList: true, subtree: true });
    }
    return () => {
      observer?.disconnect();
      document.querySelector('[data-quotation-product-assistant-host="true"]')?.remove?.();
    };
  }, [quotationId]);

  useEffect(() => {
    let alive = true;
    getQuotation(quotationId).then((row) => { if (alive) setQuotation(row); }).catch(() => null);
    return () => { alive = false; };
  }, [quotationId]);

  const search = async () => {
    const text = query.trim();
    if (!text) return feedback.info('กรุณาพิมพ์ชื่อสินค้าที่ต้องการค้นหา');
    setBusy(true);
    try {
      const rows = await getProductsForPos({ search: text, take: 20, readyOnly: false, hasPrice: false, activeOnly: true });
      setResults(Array.isArray(rows) ? rows : []);
    } catch (error) {
      feedback.actionError(error, 'ค้นหาสินค้าสำหรับใบเสนอราคาไม่สำเร็จ', `quotation:${quotationId}:product-assistant:search:error`);
    } finally {
      setBusy(false);
    }
  };

  const add = async (product, unitPrice) => {
    setBusy(true);
    try {
      await addQuotationLine(quotationId, {
        sourceProductId: Number(product.id),
        title: product.name,
        description: '',
        quantity: 1,
        unitName: product.unitName || product.unit?.name || '',
        unitPrice,
        discountAmount: 0,
        sortOrder: quotation?.items?.length || 0,
      });
      feedback.actionSuccess('เพิ่มสินค้าลงฉบับร่างแล้ว', `quotation:${quotationId}:product-assistant:add:success`);
      window.location.reload();
    } catch (error) {
      feedback.actionError(error, 'เพิ่มสินค้าลงใบเสนอราคาไม่สำเร็จ', `quotation:${quotationId}:product-assistant:add:error`);
      setBusy(false);
    }
  };

  if (!host || quotation?.status !== 'DRAFT') return null;

  return createPortal(
    <section data-testid="quotation-draft-product-assistant" className="mx-auto mb-3 max-w-[195mm] rounded-xl border border-sky-200 bg-sky-50 p-3 print:hidden">
      <div className="text-sm font-bold text-sky-950">ค้นหาสินค้าเพื่อช่วยกรอก Draft</div>
      <div className="mb-2 text-[11px] text-sky-800">เป็นเพียงตัวช่วยกรอก ไม่จองสต๊อก และยังแก้ชื่อ จำนวน หน่วย และราคาได้อิสระ</div>
      <div className="flex gap-2">
        <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && search()} placeholder="ค้นหาจากชื่อสินค้า" className="h-9 flex-1 rounded-lg border border-sky-200 bg-white px-3 text-sm" />
        <button type="button" onClick={search} disabled={busy} className="rounded-lg bg-sky-700 px-4 text-sm font-semibold text-white disabled:opacity-50">{busy ? 'กำลังค้นหา' : 'ค้นหา'}</button>
      </div>
      {results.length ? <div className="mt-3 max-h-72 space-y-2 overflow-y-auto">
        {results.map((product) => <div key={product.id} className="rounded-lg border border-sky-100 bg-white p-2 text-xs">
          <div className="font-bold text-slate-900">{product.name}</div>
          <div className="text-[11px] text-slate-500">{[product.brandName, product.productType, product.unitName].filter(Boolean).join(' · ')}</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {prices(product).map(([label, value]) => <button key={label} type="button" disabled={busy} onClick={() => add(product, value)} className="rounded border border-sky-200 bg-sky-50 px-2 py-1 font-semibold text-sky-900">{label} {value.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</button>)}
            <button type="button" disabled={busy} onClick={() => add(product, 0)} className="rounded border border-slate-200 bg-white px-2 py-1 font-semibold">กำหนดราคาเอง</button>
          </div>
        </div>)}
      </div> : null}
    </section>,
    host,
  );
};

export default QuotationDraftProductAssistantPanel;
