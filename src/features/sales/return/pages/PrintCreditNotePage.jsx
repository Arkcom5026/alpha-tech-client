import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getPrintableCreditNote } from '@/features/sales/return/api/saleReturnApi';
import {
  resolveStatutoryPresentation,
  visibleStatutoryBlockContent,
} from '@/features/printing/presentation/statutoryPresentation';

const money = (value) => Number(value || 0).toLocaleString('th-TH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const DOCUMENT_FONT_FAMILY = 'var(--document-font-family, "TH Sarabun New", "Sarabun", Tahoma, Arial, sans-serif)';

const PrintCreditNotePage = () => {
  const { taxDocumentId, shopSlug = 'advancetech' } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [projection, setProjection] = useState(null);
  const [error, setError] = useState('');

  const branchId = Number(searchParams.get('branchId'));

  useEffect(() => {
    if (!Number.isInteger(branchId) || branchId <= 0) {
      setError('ไม่พบข้อมูลสาขาสำหรับพิมพ์ใบลดหนี้');
      return;
    }
    getPrintableCreditNote({ branchId, taxDocumentId })
      .then(setProjection)
      .catch((err) => setError(err.response?.data?.message || err.message));
  }, [branchId, taxDocumentId]);

  const presentation = useMemo(() => resolveStatutoryPresentation({
    documentPurpose: 'CREDIT_NOTE',
    presentationSnapshot: projection?.presentationSnapshot,
    issuer: projection?.issuer,
  }), [projection?.issuer, projection?.presentationSnapshot]);

  const legalHeader = presentation.legalHeader;
  const notes = visibleStatutoryBlockContent(presentation, 'NOTES');
  const customFooter = visibleStatutoryBlockContent(presentation, 'CUSTOM_FOOTER');

  if (error) {
    return <main className="p-6"><div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div></main>;
  }
  if (!projection) return <main className="p-6">กำลังเตรียมใบลดหนี้...</main>;

  return (
    <div className="credit-note-print-shell min-h-screen bg-slate-100 px-4 py-6 print:min-h-0 print:bg-white print:p-0">
      <style>{`
        @page { size: A4; margin: 4mm; }

        .credit-note-a4-page {
          box-sizing: border-box;
          width: 210mm;
          min-height: 296mm;
          margin: 0 auto;
          padding: 6mm;
          background: #fff;
          color: #000;
          font-family: ${DOCUMENT_FONT_FAMILY};
        }

        @media print {
          html,
          body,
          #root,
          .credit-note-print-shell {
            width: auto !important;
            min-height: 0 !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            background: #fff !important;
          }

          .credit-note-a4-page {
            box-sizing: border-box !important;
            width: 201mm !important;
            min-height: 288mm !important;
            margin: 0 auto !important;
            padding: 5mm !important;
            border: 0.3mm solid #444 !important;
            border-radius: 2.5mm !important;
            box-shadow: none !important;
            background: #fff !important;
            color: #000 !important;
            font-family: ${DOCUMENT_FONT_FAMILY} !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>

      <div className="mx-auto mb-3 flex w-full max-w-[210mm] justify-end gap-3 print:hidden">
        <button
          type="button"
          className="rounded-xl border bg-white px-5 py-3 font-bold"
          onClick={() => navigate(`/${shopSlug}/pos/sales/sale-return`)}
        >
          กลับรายการคืนสินค้า
        </button>
        <button
          type="button"
          className="rounded-xl bg-slate-900 px-5 py-3 font-bold text-white"
          onClick={() => window.print()}
        >
          พิมพ์ใบลดหนี้
        </button>
      </div>

      <article className="credit-note-a4-page relative shadow-sm">
        <div role="banner" className="border-b-2 border-slate-900 pb-4">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="text-[22px] font-black leading-tight">{projection.document.title}</h1>
              <div className="mt-2 grid gap-x-8 gap-y-1 text-[14px] leading-tight sm:grid-cols-2">
                <div>เลขที่: <b>{projection.document.number}</b></div>
                <div>วันที่ออก: {new Date(projection.document.issuedAt).toLocaleString('th-TH')}</div>
                <div>อ้างอิงใบกำกับเดิม: <b>{projection.originalInvoice.number}</b></div>
                <div>รายการคืนสินค้า: #{projection.saleReturn.id}</div>
              </div>
            </div>
            <div className="rounded-[2mm] border border-slate-400 px-3 py-2 text-right text-[13px] font-bold leading-tight">
              ใบลดหนี้<br />CREDIT NOTE
            </div>
          </div>
        </div>

        <section className="my-4 grid gap-4 text-[14px] leading-tight sm:grid-cols-2">
          <div className="rounded-[2mm] border border-black p-3" style={{ textAlign: legalHeader.textAlign || 'left' }}>
            <div className="flex items-start gap-3">
              {legalHeader.showLogo !== false && legalHeader.logoUrl ? (
                <img
                  src={legalHeader.logoUrl}
                  alt="logo"
                  className="shrink-0 object-contain"
                  style={{ width: legalHeader.logoSize || 56, height: legalHeader.logoSize || 56 }}
                />
              ) : null}
              <div className="min-w-0 flex-1">
                <h2 className="font-black">ผู้ออกเอกสาร</h2>
                <p>{projection.issuer.legalName}</p>
                <p>เลขประจำตัวผู้เสียภาษี: {projection.issuer.taxId}</p>
                <p>{projection.issuer.registeredAddress}</p>
              </div>
            </div>
          </div>
          <div className="rounded-[2mm] border border-black p-3">
            <h2 className="font-black">ผู้รับเอกสาร</h2>
            <p>{projection.recipient?.legalName || projection.sale.customerName || '-'}</p>
            <p>เลขประจำตัวผู้เสียภาษี: {projection.recipient?.taxId || projection.sale.customerTaxId || '-'}</p>
            <p>{projection.recipient?.registeredAddress || '-'}</p>
          </div>
        </section>

        <table className="w-full table-fixed border-collapse border border-black text-[13px] leading-tight">
          <thead>
            <tr className="bg-slate-100 text-left">
              <th className="w-[52%] border border-black px-2 py-1.5">รายการ / DESCRIPTION</th>
              <th className="w-[12%] border border-black px-2 py-1.5 text-right">จำนวน</th>
              <th className="w-[18%] border border-black px-2 py-1.5 text-right">มูลค่า</th>
              <th className="w-[18%] border border-black px-2 py-1.5 text-right">ภาษี</th>
            </tr>
          </thead>
          <tbody>
            {projection.lines.map((line) => (
              <tr key={line.id}>
                <td className="border border-black px-2 py-1.5">{line.description}</td>
                <td className="border border-black px-2 py-1.5 text-right tabular-nums">{line.quantity}</td>
                <td className="border border-black px-2 py-1.5 text-right tabular-nums">{money(line.lineAmount)}</td>
                <td className="border border-black px-2 py-1.5 text-right tabular-nums">{money(line.vatAmount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <section className="ml-auto mt-4 w-[45%] space-y-1.5 border-t-2 border-black pt-3 text-[14px] leading-tight">
          <div className="flex justify-between gap-4"><span>มูลค่าก่อนภาษี</span><b className="tabular-nums">{money(projection.document.subtotalAmount)}</b></div>
          <div className="flex justify-between gap-4"><span>ภาษีมูลค่าเพิ่ม</span><b className="tabular-nums">{money(projection.document.taxAmount)}</b></div>
          <div className="flex justify-between gap-4 border-t border-black pt-2 text-[16px] font-black"><span>รวมใบลดหนี้</span><b className="tabular-nums">{money(projection.document.totalAmount)} บาท</b></div>
        </section>

        {(notes || customFooter) ? (
          <section data-testid="credit-note-presentation-footer" className="mt-4 max-w-[70%] space-y-1 text-[12px] leading-tight">
            {notes ? <p><b>หมายเหตุ:</b> {notes}</p> : null}
            {customFooter ? <p className="whitespace-pre-line">{customFooter}</p> : null}
          </section>
        ) : null}

        <section className="absolute bottom-[8mm] left-[6mm] right-[6mm] grid grid-cols-2 gap-12 text-center text-[14px]">
          <div className="flex h-[20mm] flex-col justify-end">
            <div className="border-t border-dashed border-black pt-1">ผู้จัดทำ / ผู้มีอำนาจ</div>
          </div>
          <div className="flex h-[20mm] flex-col justify-end">
            <div className="border-t border-dashed border-black pt-1">ผู้รับเอกสาร</div>
          </div>
        </section>
      </article>
    </div>
  );
};

export default PrintCreditNotePage;
