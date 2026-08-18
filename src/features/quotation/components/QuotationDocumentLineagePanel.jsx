import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { getQuotationDocumentLineage } from '../api/quotationApi';

const labelSale = (sale) => sale?.officialDocumentNumber || sale?.code || (sale?.id ? `Sale #${sale.id}` : '-');

const QuotationDocumentLineagePanel = ({ quotationId, shopSlug }) => {
  const navigate = useNavigate();
  const [portalHost, setPortalHost] = useState(null);
  const [lineage, setLineage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let observer = null;
    let host = null;

    const mountHost = () => {
      const shell = document.querySelector('.quotation-print-shell');
      const a4 = shell?.querySelector('.quotation-a4');
      if (!shell || !a4) return false;

      const existingHost = shell.querySelector('[data-quotation-lineage-host="true"]');
      if (existingHost) {
        host = existingHost;
        setPortalHost(existingHost);
        return true;
      }

      host = document.createElement('div');
      host.dataset.quotationLineageHost = 'true';
      shell.insertBefore(host, a4);
      setPortalHost(host);
      return true;
    };

    if (!mountHost()) {
      observer = new MutationObserver(() => {
        if (mountHost()) observer?.disconnect();
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      observer?.disconnect();
      host?.remove?.();
    };
  }, [quotationId]);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const result = await getQuotationDocumentLineage(quotationId);
        if (alive) setLineage(result || null);
      } catch (loadError) {
        if (alive) setError(loadError?.response?.data?.message || loadError?.message || 'โหลดเอกสารอ้างอิงไม่สำเร็จ');
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => { alive = false; };
  }, [quotationId]);

  if (!portalHost) return null;

  const rows = Array.isArray(lineage?.sales) ? lineage.sales : [];
  const prefix = `/${shopSlug || 'advancetech'}/pos/sales`;

  let content = null;
  if (loading) {
    content = <div data-testid="quotation-document-lineage" className="mx-auto mb-3 max-w-[195mm] rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500 print:hidden">กำลังตรวจสอบเอกสารที่อ้างอิงใบเสนอราคานี้...</div>;
  } else if (error) {
    content = <div data-testid="quotation-document-lineage" className="mx-auto mb-3 max-w-[195mm] rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 print:hidden">{error}</div>;
  } else if (rows.length) {
    content = (
      <section data-testid="quotation-document-lineage" className="mx-auto mb-3 max-w-[195mm] rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 print:hidden">
        <div className="mb-2 text-xs font-bold text-teal-900">เอกสารที่อ้างอิงใบเสนอราคานี้</div>
        <div className="space-y-2">
          {rows.map((row) => {
            const sale = row?.sale;
            const deliveryNote = row?.deliveryNote;
            const taxDocument = row?.taxDocument;
            return (
              <div key={row?.reference?.id || sale?.id} className="grid gap-2 rounded-lg border border-teal-100 bg-white px-3 py-2 text-xs text-slate-700 md:grid-cols-[1.2fr_1fr_1fr]">
                <div><span className="font-semibold text-slate-900">การขาย:</span> {sale ? labelSale(sale) : '-'}</div>
                <div>
                  <span className="font-semibold text-slate-900">ใบส่งของ:</span>{' '}
                  {deliveryNote?.saleId ? <button type="button" onClick={() => navigate(`${prefix}/delivery-note/print/${deliveryNote.saleId}`)} className="font-semibold text-teal-700 underline decoration-dotted underline-offset-2">{deliveryNote.documentNumber || `Sale #${deliveryNote.saleId}`}</button> : '-'}
                </div>
                <div><span className="font-semibold text-slate-900">เอกสารภาษี:</span> {taxDocument ? (taxDocument.issuedDocumentNumber || taxDocument.documentNumber || `Tax #${taxDocument.id}`) : '-'}</div>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  return content ? createPortal(content, portalHost) : null;
};

export default QuotationDocumentLineagePanel;
