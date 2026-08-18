import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Printer } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { getBranchById } from '@/features/branch/api/branchApi';
import { buildStoreDocumentHeader } from '@/features/branch/documentHeader/documentHeaderConfig';
import { feedback } from '@/design-system';
import { getQuotation } from '../api/quotationApi';

const money = (value) => Number(value || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const date = (value) => value ? new Date(value).toLocaleDateString('th-TH', { day: '2-digit', month: 'long', year: 'numeric' }) : '-';

const unwrapBranch = (payload) => payload?.data ?? payload ?? null;

const QuotationPrintPage = () => {
  const { shopSlug, quotationId } = useParams();
  const navigate = useNavigate();
  const prefix = `/${shopSlug || 'advancetech'}/pos/sales/quotations`;
  const [quotation, setQuotation] = useState(null);
  const [draftBranch, setDraftBranch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true);
      try {
        const document = await getQuotation(quotationId);
        if (!alive) return;
        setQuotation(document);
        if (!document?.documentHeaderSnapshot && document?.branchId) {
          try {
            const currentBranch = unwrapBranch(await getBranchById(document.branchId));
            if (alive) setDraftBranch(currentBranch);
          } catch (_) {
            if (alive) setDraftBranch(null);
          }
        }
      } catch (error) {
        feedback.actionError(error, 'โหลดใบเสนอราคาสำหรับพิมพ์ไม่สำเร็จ', `quotation:${quotationId}:print:error`);
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => { alive = false; };
  }, [quotationId]);

  const branch = quotation?.documentHeaderSnapshot || draftBranch || {};
  const header = useMemo(() => buildStoreDocumentHeader({
    branch,
    documentType: 'QUOTATION',
    legacyConfig: {
      branchName: branch?.name || '-',
      address: branch?.address || '-',
      phone: branch?.phone || '-',
      taxId: branch?.taxId || '-',
    },
  }), [branch]);

  if (loading) return <div className="p-8 text-center text-slate-500">กำลังจัดเตรียมใบเสนอราคา...</div>;
  if (!quotation) return <div className="p-8 text-center text-rose-700">ไม่พบใบเสนอราคา</div>;

  const recipientName = quotation.customerCompany || quotation.customerName || '-';
  const items = quotation.items || [];

  return (
    <main className="quotation-print-shell min-h-screen bg-slate-100 px-3 py-5 text-black print:bg-white print:p-0 md:px-6 md:py-8">
      <div className="quotation-print-toolbar mx-auto mb-4 flex max-w-[195mm] items-center justify-between print:hidden">
        <button type="button" onClick={() => navigate(`${prefix}/${quotationId}`)} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50"><ArrowLeft className="h-4 w-4" /> กลับไปแก้ไข</button>
        <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"><Printer className="h-4 w-4" /> พิมพ์ใบเสนอราคา</button>
      </div>

      <section className="quotation-a4 mx-auto box-border w-[195mm] min-h-[280mm] rounded-[2.5mm] border border-slate-500 bg-white p-[5mm] shadow-sm print:rounded-[2.5mm] print:shadow-none">
        <header className="flex items-start justify-between gap-5 border-b border-slate-300 pb-3">
          <div className={`flex min-w-0 flex-1 gap-3 ${header?.headerStyle?.logoPosition === 'right' ? 'flex-row-reverse' : header?.headerStyle?.logoPosition === 'center' ? 'flex-col items-center' : ''}`}>
            {header.logoUrl ? <img src={header.logoUrl} alt="โลโก้ร้าน" className="shrink-0 object-contain" style={{ width: `${header?.headerStyle?.logoSize || 56}px`, height: `${header?.headerStyle?.logoSize || 56}px` }} /> : null}
            <div className={`min-w-0 text-xs leading-5 ${header?.headerStyle?.textAlign === 'center' ? 'text-center' : header?.headerStyle?.textAlign === 'right' ? 'text-right' : 'text-left'}`}>
              {header.branchName ? <h2 className="font-bold text-slate-950" style={{ fontSize: header?.headerStyle?.storeNameSize === 'xl' ? 24 : header?.headerStyle?.storeNameSize === 'lg' ? 20 : header?.headerStyle?.storeNameSize === 'sm' ? 13 : 16 }}>{header.branchName}</h2> : null}
              {header.address ? <p>ที่อยู่: {header.address}</p> : null}
              {header.phone ? <p>โทร: {header.phone}</p> : null}
              {header.taxId ? <p>เลขประจำตัวผู้เสียภาษี: {header.taxId}</p> : null}
              {header?.headerStyle?.headerNote ? <p className="whitespace-pre-wrap">{header.headerStyle.headerNote}</p> : null}
            </div>
          </div>
          <div className="shrink-0 text-right">
            <h1 className="text-xl font-extrabold underline">ใบเสนอราคา</h1>
            <p className="text-sm font-bold">QUOTATION</p>
            {quotation.status === 'DRAFT' ? <p className="mt-2 inline-block rounded border border-amber-300 bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-800">DRAFT</p> : null}
          </div>
        </header>

        <div className="mt-3 grid grid-cols-[1.55fr_1fr] gap-3 text-xs leading-5">
          <section className="rounded border border-slate-500 p-2.5">
            <p><strong>เรียน / ลูกค้า:</strong> {recipientName}</p>
            {quotation.customerDepartment ? <p><strong>แผนก:</strong> {quotation.customerDepartment}</p> : null}
            {quotation.customerContactName ? <p><strong>ผู้ติดต่อ:</strong> {quotation.customerContactName}</p> : null}
            {quotation.customerAddress ? <p className="whitespace-pre-wrap"><strong>ที่อยู่:</strong> {quotation.customerAddress}</p> : null}
            {quotation.customerPhone ? <p><strong>โทร:</strong> {quotation.customerPhone}</p> : null}
            {quotation.customerTaxId ? <p><strong>เลขประจำตัวผู้เสียภาษี:</strong> {quotation.customerTaxId}</p> : null}
          </section>
          <section className="rounded border border-slate-500 p-2.5">
            <p><strong>เลขที่:</strong> {quotation.code}</p>
            <p><strong>วันที่:</strong> {date(quotation.issueDate || quotation.createdAt)}</p>
            <p><strong>ยืนราคาถึง:</strong> {date(quotation.validUntil)}</p>
            <p><strong>เงื่อนไขการชำระเงิน:</strong> {quotation.paymentTerms || '-'}</p>
          </section>
        </div>

        {quotation.subject ? <div className="mt-3 text-sm"><strong>เรื่อง:</strong> {quotation.subject}</div> : null}
        {quotation.introduction ? <div className="mt-2 whitespace-pre-wrap text-xs leading-5">{quotation.introduction}</div> : null}

        <table className="mt-3 w-full table-fixed border-collapse text-[11px] leading-4">
          <thead>
            <tr className="bg-slate-50">
              <th className="w-[7%] border border-slate-600 px-1 py-1.5">ลำดับ<br/>ITEM</th>
              <th className="w-[43%] border border-slate-600 px-2 py-1.5">รายการ / รายละเอียด<br/>DESCRIPTION</th>
              <th className="w-[9%] border border-slate-600 px-1 py-1.5">จำนวน<br/>QTY</th>
              <th className="w-[9%] border border-slate-600 px-1 py-1.5">หน่วย<br/>UNIT</th>
              <th className="w-[14%] border border-slate-600 px-1 py-1.5">ราคาต่อหน่วย<br/>UNIT PRICE</th>
              <th className="w-[18%] border border-slate-600 px-1 py-1.5">จำนวนเงิน<br/>AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td className="border border-slate-600 py-8 text-center text-slate-400" colSpan="6">ไม่มีรายการสินค้า — เอกสารนี้อาจใช้ข้อความรายละเอียดทั่วไปแทนรายการสินค้า</td></tr>
            ) : items.map((item, index) => (
              <tr key={item.id} className="align-top break-inside-avoid">
                <td className="border border-slate-600 px-1 py-1.5 text-center">{index + 1}</td>
                <td className="border border-slate-600 px-2 py-1.5"><div className="font-semibold">{item.title}</div>{item.description ? <div className="mt-0.5 whitespace-pre-wrap text-[10px] leading-4">{item.description}</div> : null}</td>
                <td className="border border-slate-600 px-1 py-1.5 text-right">{Number(item.quantity || 0)}</td>
                <td className="border border-slate-600 px-1 py-1.5 text-center">{item.unitName || '-'}</td>
                <td className="border border-slate-600 px-1 py-1.5 text-right">{money(item.unitPrice)}</td>
                <td className="border border-slate-600 px-1 py-1.5 text-right font-semibold">{money(item.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-3 grid grid-cols-[1.55fr_1fr] gap-3">
          <div className="text-xs leading-5">
            {quotation.closingNote ? <div className="whitespace-pre-wrap"><strong>เงื่อนไข / รายละเอียดเพิ่มเติม</strong><br/>{quotation.closingNote}</div> : null}
            {quotation.notes ? <div className="mt-2 whitespace-pre-wrap"><strong>หมายเหตุ:</strong> {quotation.notes}</div> : null}
          </div>
          <div className="rounded border border-slate-500 p-2 text-xs leading-5">
            <div className="flex justify-between"><span>ยอดรายการ</span><span>{money(quotation.subtotal)} บาท</span></div>
            {Number(quotation.lineDiscountTotal || 0) > 0 ? <div className="flex justify-between"><span>ส่วนลดรายการ</span><span>- {money(quotation.lineDiscountTotal)} บาท</span></div> : null}
            {Number(quotation.billDiscount || 0) > 0 ? <div className="flex justify-between"><span>ส่วนลดท้ายบิล</span><span>- {money(quotation.billDiscount)} บาท</span></div> : null}
            {quotation.vatEnabled ? <div className="flex justify-between"><span>ภาษีมูลค่าเพิ่ม {Number(quotation.vatRate || 0)}%</span><span>{money(quotation.vatAmount)} บาท</span></div> : null}
            <div className="mt-1 flex justify-between border-t border-slate-400 pt-1 text-sm font-bold"><span>ยอดสุทธิ</span><span>{money(quotation.grandTotal)} บาท</span></div>
          </div>
        </div>

        <footer className="mt-10 grid grid-cols-2 gap-16 text-center text-xs">
          <div><div className="border-b border-slate-600 pb-7">ผู้เสนอราคา</div><p className="pt-1">วันที่ ______ / ______ / ______</p></div>
          <div><div className="border-b border-slate-600 pb-7">ผู้อนุมัติ / ผู้ยอมรับใบเสนอราคา</div><p className="pt-1">วันที่ ______ / ______ / ______</p></div>
        </footer>
      </section>

      <style>{`
        @media print {
          @page { size: A4; margin: 6mm; }
          html, body, #root { margin: 0 !important; padding: 0 !important; min-height: 0 !important; height: auto !important; }
          body:has(.quotation-print-shell) #root *:has(.quotation-print-shell) { display: block !important; position: static !important; width: auto !important; max-width: none !important; min-width: 0 !important; min-height: 0 !important; height: auto !important; margin: 0 !important; padding: 0 !important; overflow: visible !important; transform: none !important; }
          .quotation-print-shell { display: block !important; width: auto !important; min-height: 0 !important; margin: 0 !important; padding: 0 !important; background: white !important; }
          .quotation-a4 { box-sizing: border-box !important; width: 195mm !important; max-width: 195mm !important; min-height: 280mm !important; margin: 0 auto !important; padding: 5mm !important; border: 0.3mm solid #444 !important; box-shadow: none !important; overflow: visible !important; }
        }
      `}</style>
    </main>
  );
};

export default QuotationPrintPage;