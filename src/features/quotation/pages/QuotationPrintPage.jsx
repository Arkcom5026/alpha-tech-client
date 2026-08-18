import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Pencil, Plus, Printer, Save, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { getBranchById } from '@/features/branch/api/branchApi';
import { buildStoreDocumentHeader } from '@/features/branch/documentHeader/documentHeaderConfig';
import { feedback } from '@/design-system';
import { addQuotationLine, getQuotation, updateQuotationLine } from '../api/quotationApi';

const money = (value) => Number(value || 0).toLocaleString('th-TH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const date = (value) => value
  ? new Date(value).toLocaleDateString('th-TH', { day: '2-digit', month: 'long', year: 'numeric' })
  : '-';

const unwrapBranch = (payload) => payload?.data ?? payload ?? null;

const estimateLineHeightMm = (item = {}) => {
  const text = `${item.title || ''} ${item.description || ''}`.trim();
  const visualLines = Math.max(1, Math.ceil(text.length / 62));
  return Math.min(24, 6 + (visualLines * 3.5));
};

const tableFillerHeightMm = (items = []) => {
  const occupied = items.reduce((sum, item) => sum + estimateLineHeightMm(item), 0);
  return Math.max(0, 118 - occupied);
};

const buildLineDraft = (item = {}, sortOrder = 0) => ({
  id: item.id || null,
  sourceProductId: item.sourceProductId || null,
  title: item.title || '',
  description: item.description || '',
  quantity: Number(item.quantity || 1),
  unitName: item.unitName || '',
  unitPrice: Number(item.unitPrice || 0),
  sortOrder: Number(item.sortOrder ?? sortOrder),
});

const QuotationPrintPage = () => {
  const { shopSlug, quotationId } = useParams();
  const navigate = useNavigate();
  const prefix = `/${shopSlug || 'advancetech'}/pos/sales/quotations`;
  const [quotation, setQuotation] = useState(null);
  const [draftBranch, setDraftBranch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingLineId, setEditingLineId] = useState(null);
  const [lineDraft, setLineDraft] = useState(null);
  const [savingLine, setSavingLine] = useState(false);

  const refreshQuotation = async () => {
    const refreshed = await getQuotation(quotationId);
    setQuotation(refreshed);
    return refreshed;
  };

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

  const editable = quotation?.status === 'DRAFT';
  const items = quotation?.items || [];

  const beginLineEdit = (item) => {
    if (!editable || savingLine) return;
    if (editingLineId === item.id) {
      setEditingLineId(null);
      setLineDraft(null);
      return;
    }
    setEditingLineId(item.id);
    setLineDraft(buildLineDraft(item));
  };

  const beginNewLine = () => {
    if (!editable || savingLine) return;
    setEditingLineId('NEW');
    setLineDraft(buildLineDraft({}, items.length));
  };

  const cancelLineEdit = () => {
    if (savingLine) return;
    setEditingLineId(null);
    setLineDraft(null);
  };

  const patchLineDraft = (key, value) => {
    setLineDraft((current) => current ? { ...current, [key]: value } : current);
  };

  const saveLineEdit = async () => {
    if (!editable || savingLine || !editingLineId || !lineDraft) return;
    if (!String(lineDraft.title || '').trim()) {
      feedback.info('กรุณาระบุชื่อรายการ');
      return;
    }
    const quantity = Number(lineDraft.quantity);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      feedback.info('จำนวนต้องเป็นจำนวนเต็มตั้งแต่ 1 ขึ้นไป');
      return;
    }

    const payload = { ...lineDraft, quantity, discountAmount: 0 };
    const isNew = editingLineId === 'NEW';
    setSavingLine(true);
    try {
      if (isNew) await addQuotationLine(quotationId, payload);
      else await updateQuotationLine(quotationId, editingLineId, payload);
      await refreshQuotation();
      setEditingLineId(null);
      setLineDraft(null);
      feedback.actionSuccess(
        isNew ? 'เพิ่มรายการบนใบเสนอราคาแล้ว' : 'บันทึกรายการบนใบเสนอราคาแล้ว',
        `quotation:${quotationId}:print-line:${isNew ? 'new' : editingLineId}:save:success`,
      );
    } catch (error) {
      feedback.actionError(error, isNew ? 'เพิ่มรายการไม่สำเร็จ' : 'บันทึกรายการไม่สำเร็จ', `quotation:${quotationId}:print-line:save:error`);
    } finally {
      setSavingLine(false);
    }
  };

  const renderLineEditor = () => {
    if (!editable || !lineDraft) return null;
    const isNew = editingLineId === 'NEW';
    return (
      <div className="quotation-line-editor print:hidden border-x border-b border-slate-500 bg-slate-50 p-2.5">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-xs font-bold text-slate-800">{isNew ? 'เพิ่มรายการใหม่' : 'แก้ไขรายการ'}</p>
          {isNew ? <span className="text-[10px] text-slate-500">พิมพ์เองได้ทั้งหมด ไม่จำเป็นต้องอ้างอิงสินค้า</span> : null}
        </div>
        <div className="grid gap-2 text-xs md:grid-cols-12">
          <label className="md:col-span-12">
            <span className="mb-1 block font-semibold text-slate-700">ชื่อรายการ</span>
            <input value={lineDraft.title} onChange={(event) => patchLineDraft('title', event.target.value)} className="h-9 w-full rounded border border-slate-300 bg-white px-2.5 outline-none focus:border-teal-500" />
          </label>
          <label className="md:col-span-12">
            <span className="mb-1 block font-semibold text-slate-700">รายละเอียดเพิ่มเติม</span>
            <textarea rows="3" value={lineDraft.description} onChange={(event) => patchLineDraft('description', event.target.value)} className="w-full resize-y rounded border border-slate-300 bg-white px-2.5 py-2 leading-5 outline-none focus:border-teal-500" placeholder="พิมพ์รายละเอียดหลายบรรทัดได้" />
          </label>
          <label className="md:col-span-2">
            <span className="mb-1 block font-semibold text-slate-700">จำนวน</span>
            <input type="number" min="1" step="1" value={lineDraft.quantity} onChange={(event) => patchLineDraft('quantity', event.target.value)} className="h-9 w-full rounded border border-slate-300 bg-white px-2.5 text-right outline-none focus:border-teal-500" />
          </label>
          <label className="md:col-span-2">
            <span className="mb-1 block font-semibold text-slate-700">หน่วย</span>
            <input value={lineDraft.unitName} onChange={(event) => patchLineDraft('unitName', event.target.value)} className="h-9 w-full rounded border border-slate-300 bg-white px-2.5 outline-none focus:border-teal-500" />
          </label>
          <label className="md:col-span-4">
            <span className="mb-1 block font-semibold text-slate-700">ราคา/หน่วย</span>
            <input type="number" min="0" step="0.01" value={lineDraft.unitPrice} onChange={(event) => patchLineDraft('unitPrice', event.target.value)} className="h-9 w-full rounded border border-slate-300 bg-white px-2.5 text-right outline-none focus:border-teal-500" />
          </label>
          <div className="flex items-end justify-end gap-2 md:col-span-4">
            <button type="button" onClick={cancelLineEdit} disabled={savingLine} className="inline-flex h-9 items-center gap-1 rounded border border-slate-300 bg-white px-3 font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50"><X className="h-3.5 w-3.5" /> ยกเลิก</button>
            <button type="button" onClick={saveLineEdit} disabled={savingLine} className="inline-flex h-9 items-center gap-1 rounded bg-teal-700 px-3 font-semibold text-white hover:bg-teal-800 disabled:opacity-50"><Save className="h-3.5 w-3.5" /> {savingLine ? 'กำลังบันทึก' : 'บันทึก'}</button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <div className="p-8 text-center text-slate-500">กำลังจัดเตรียมใบเสนอราคา...</div>;
  if (!quotation) return <div className="p-8 text-center text-rose-700">ไม่พบใบเสนอราคา</div>;

  const recipientName = quotation.customerCompany || quotation.customerName || '-';
  const fillerHeight = tableFillerHeightMm(items);
  const hasTerms = Boolean(quotation.closingNote || quotation.notes || quotation.paymentTerms);
  const adjustedSubtotal = items.reduce(
    (sum, item) => sum + Math.max(0, Number(item.quantity || 0)) * Math.max(0, Number(item.unitPrice || 0)),
    0,
  );
  const vatRate = quotation.vatEnabled === false ? 0 : Number(quotation.vatRate || 0);
  const vatAmount = adjustedSubtotal * vatRate / 100;
  const grandTotal = adjustedSubtotal + vatAmount;
  const configuredLogoSize = Number(header?.headerStyle?.logoSize || 72);
  const deliveryAlignedLogoSize = Math.min(92, Math.max(72, configuredLogoSize));

  return (
    <main className="quotation-print-shell min-h-screen bg-slate-100 px-3 py-5 text-black print:bg-white print:p-0 md:px-6 md:py-8">
      <div className="quotation-print-toolbar mx-auto mb-4 flex max-w-[195mm] items-center justify-between print:hidden">
        <button type="button" onClick={() => navigate(`${prefix}/${quotationId}`)} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50"><ArrowLeft className="h-4 w-4" /> กลับไปแก้ไข</button>
        <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"><Printer className="h-4 w-4" /> พิมพ์ใบเสนอราคา</button>
      </div>

      <section className="quotation-a4 mx-auto box-border flex w-[195mm] min-h-[280mm] flex-col rounded-[2.5mm] border border-slate-500 bg-white p-[5mm] shadow-sm print:rounded-[2.5mm] print:shadow-none">
        <div className="quotation-document-header flex min-h-[31mm] items-center justify-between gap-5 border-b border-slate-300 pb-2 mb-1.5">
          <div className={`flex min-w-0 flex-1 items-center gap-4 ${header?.headerStyle?.logoPosition === 'right' ? 'flex-row-reverse' : header?.headerStyle?.logoPosition === 'center' ? 'flex-col items-center' : ''}`}>
            {header.logoUrl ? <img src={header.logoUrl} alt="โลโก้ร้าน" className="shrink-0 object-contain" style={{ width: `${deliveryAlignedLogoSize}px`, height: `${deliveryAlignedLogoSize}px` }} /> : null}
            <div className={`min-w-0 text-[11px] leading-[1.35] ${header?.headerStyle?.textAlign === 'center' ? 'text-center' : header?.headerStyle?.textAlign === 'right' ? 'text-right' : 'text-left'}`}>
              {header.branchName ? <h2 className="font-bold leading-tight text-slate-950" style={{ fontSize: header?.headerStyle?.storeNameSize === 'xl' ? 22 : header?.headerStyle?.storeNameSize === 'lg' ? 19 : header?.headerStyle?.storeNameSize === 'sm' ? 13 : 16 }}>{header.branchName}</h2> : null}
              {header.address ? <p className="mt-0.5">ที่อยู่: {header.address}</p> : null}
              <div className="flex flex-wrap gap-x-4">{header.phone ? <p>โทร: {header.phone}</p> : null}{header.taxId ? <p>เลขประจำตัวผู้เสียภาษี: {header.taxId}</p> : null}</div>
              {header?.headerStyle?.headerNote ? <p className="mt-0.5 whitespace-pre-wrap">{header.headerStyle.headerNote}</p> : null}
            </div>
          </div>
          <div className="w-[36mm] shrink-0 text-right">
            {quotation.status === 'DRAFT' ? <div className="inline-flex min-w-[25mm] flex-col items-center rounded-[1.5mm] border border-amber-400 px-2 py-1.5 text-center"><span className="text-[9px] font-bold text-amber-800">ฉบับร่าง</span><span className="text-[7.5px] font-semibold tracking-wide text-amber-700">DRAFT</span></div> : <div className="inline-flex min-w-[25mm] flex-col items-center rounded-[1.5mm] border border-slate-400 px-2 py-1.5 text-center"><span className="text-[9px] font-bold">ต้นฉบับลูกค้า</span><span className="text-[7.5px] font-semibold tracking-wide">CUSTOMER ORIGINAL</span></div>}
          </div>
        </div>

        <div className="quotation-document-title py-2.5 text-center"><h1 className="text-[18px] font-extrabold leading-none underline underline-offset-2">ใบเสนอราคา</h1><p className="mt-1 text-[10px] font-bold tracking-[0.16em]">QUOTATION</p></div>

        <div className="grid grid-cols-[1.6fr_1fr] gap-3 text-[10.5px] leading-[1.5]">
          <section className="quotation-info-panel rounded-[2mm] border border-slate-500 px-2.5 py-2">
            <p><strong>ลูกค้า:</strong> {recipientName}</p>{quotation.customerDepartment ? <p><strong>แผนก:</strong> {quotation.customerDepartment}</p> : null}{quotation.customerContactName ? <p><strong>ผู้ติดต่อ:</strong> {quotation.customerContactName}</p> : null}{quotation.customerAddress ? <p className="whitespace-pre-wrap"><strong>ที่อยู่:</strong> {quotation.customerAddress}</p> : null}<div className="flex flex-wrap gap-x-4">{quotation.customerPhone ? <p><strong>โทร:</strong> {quotation.customerPhone}</p> : null}{quotation.customerTaxId ? <p><strong>เลขประจำตัวผู้เสียภาษี:</strong> {quotation.customerTaxId}</p> : null}</div>
          </section>
          <section className="quotation-info-panel rounded-[2mm] border border-slate-500 px-2.5 py-2"><div className="grid grid-cols-[28mm_1fr] gap-x-1"><span className="font-semibold">วันที่:</span><span>{date(quotation.issueDate || quotation.createdAt)}</span><span className="font-semibold">เลขที่:</span><span className="font-semibold">{quotation.code}</span><span className="font-semibold">ยืนราคาถึง:</span><span>{date(quotation.validUntil)}</span><span className="font-semibold">เงื่อนไขชำระเงิน:</span><span>{quotation.paymentTerms || '-'}</span></div></section>
        </div>

        {(quotation.subject || quotation.introduction) ? <section className="quotation-message mt-2.5 text-[10.5px] leading-[1.55]">{quotation.subject ? <p><strong>เรื่อง:</strong> {quotation.subject}</p> : null}{quotation.introduction ? <p className={`${quotation.subject ? 'mt-1' : ''} whitespace-pre-wrap`}>{quotation.introduction}</p> : null}</section> : null}

        <div className="quotation-table-wrap mt-2.5">
          <table className="w-full table-fixed border-collapse text-[10px] leading-[1.4]">
            <thead><tr><th className="w-[7%] border border-slate-600 px-1 py-1.5 font-bold">ลำดับ<br/><span className="text-[8px] font-semibold">ITEM</span></th><th className="w-[40%] border border-slate-600 px-2 py-1.5 font-bold print:w-[45%]">รายการ / รายละเอียด<br/><span className="text-[8px] font-semibold">DESCRIPTION</span></th><th className="w-[8%] border border-slate-600 px-1 py-1.5 font-bold">จำนวน<br/><span className="text-[8px] font-semibold">QTY</span></th><th className="w-[8%] border border-slate-600 px-1 py-1.5 font-bold">หน่วย<br/><span className="text-[8px] font-semibold">UNIT</span></th><th className="w-[14%] border border-slate-600 px-1 py-1.5 font-bold">ราคา/หน่วย<br/><span className="text-[8px] font-semibold">UNIT PRICE</span></th><th className="w-[18%] border border-slate-600 px-1 py-1.5 font-bold">จำนวนเงิน<br/><span className="text-[8px] font-semibold">AMOUNT</span></th>{editable ? <th className="w-[5%] border border-slate-600 px-1 py-1.5 print:hidden">&nbsp;</th> : null}</tr></thead>
            <tbody>
              {items.map((item, index) => {
                const isEditing = editable && editingLineId === item.id;
                const amount = Math.max(0, Number(item.quantity || 0)) * Math.max(0, Number(item.unitPrice || 0));
                return <React.Fragment key={item.id}><tr className={`align-top break-inside-avoid ${isEditing ? 'bg-slate-50 print:bg-white' : ''}`}><td className="border border-slate-500 px-1 py-1.5 text-center">{index + 1}</td><td className="border border-slate-500 px-2 py-1.5"><div className="font-semibold">{item.title}</div>{item.description ? <div className="mt-0.5 whitespace-pre-wrap text-[9px] leading-[1.5]">{item.description}</div> : null}</td><td className="border border-slate-500 px-1 py-1.5 text-right">{Number(item.quantity || 0)}</td><td className="border border-slate-500 px-1 py-1.5 text-center">{item.unitName || '-'}</td><td className="border border-slate-500 px-1 py-1.5 text-right tabular-nums">{money(item.unitPrice)}</td><td className="border border-slate-500 px-1 py-1.5 text-right font-semibold tabular-nums">{money(amount)}</td>{editable ? <td className="border border-slate-500 px-1 py-1 text-center align-top print:hidden"><button type="button" onClick={() => beginLineEdit(item)} className={`inline-flex h-7 w-7 items-center justify-center rounded border ${isEditing ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-300 bg-white text-slate-500 hover:bg-slate-50'}`} aria-label="แก้ไขรายการนี้บนใบเสนอราคา" title="แก้ไขรายการ"><Pencil className="h-3.5 w-3.5" /></button></td> : null}</tr>{isEditing ? <tr className="print:hidden"><td colSpan="7" className="p-0">{renderLineEditor()}</td></tr> : null}</React.Fragment>;
              })}

              {editable ? <React.Fragment><tr className="quotation-add-line-row print:hidden"><td className="h-9 border border-slate-500 text-center text-slate-400">{items.length + 1}</td><td className="border border-slate-500 px-2 text-[9px] text-slate-400">เพิ่มรายการถัดไป</td><td className="border border-slate-500">&nbsp;</td><td className="border border-slate-500">&nbsp;</td><td className="border border-slate-500">&nbsp;</td><td className="border border-slate-500">&nbsp;</td><td className="border border-slate-500 p-1 text-center"><button type="button" onClick={beginNewLine} disabled={savingLine || editingLineId === 'NEW'} className="inline-flex h-7 w-7 items-center justify-center rounded border border-teal-400 bg-teal-50 text-teal-700 hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-50" aria-label="เพิ่มรายการถัดไปบนใบเสนอราคา" title="เพิ่มรายการ"><Plus className="h-4 w-4" /></button></td></tr>{editingLineId === 'NEW' ? <tr className="print:hidden"><td colSpan="7" className="p-0">{renderLineEditor()}</td></tr> : null}</React.Fragment> : null}

              {fillerHeight > 0 ? <tr className="quotation-table-filler" aria-hidden="true"><td className="border border-slate-500" style={{ height: `${fillerHeight}mm` }}>&nbsp;</td><td className="border border-slate-500">&nbsp;</td><td className="border border-slate-500">&nbsp;</td><td className="border border-slate-500">&nbsp;</td><td className="border border-slate-500">&nbsp;</td><td className="border border-slate-500">&nbsp;</td>{editable ? <td className="border border-slate-500 print:hidden">&nbsp;</td> : null}</tr> : null}
            </tbody>
          </table>
        </div>

        <div className="quotation-settlement grid min-h-[19mm] grid-cols-[1.6fr_1fr] break-inside-avoid text-[10px] leading-[1.45]">
          <section className="border-x border-b border-slate-500 px-2.5 py-1.5"><p className="font-semibold">เงื่อนไข / หมายเหตุ</p>{quotation.closingNote ? <div className="mt-0.5 whitespace-pre-wrap">{quotation.closingNote}</div> : null}{quotation.notes ? <div className={`${quotation.closingNote ? 'mt-0.5' : ''} whitespace-pre-wrap`}>{quotation.notes}</div> : null}{!hasTerms ? <p className="mt-0.5">-</p> : null}</section>
          <section className="border-b border-r border-slate-500"><div className="flex justify-between gap-3 border-b border-slate-400 px-2.5 py-1"><span>ยอดราคาหลังปรับ</span><span className="tabular-nums">{money(adjustedSubtotal)}</span></div>{quotation.vatEnabled ? <div className="flex justify-between gap-3 border-b border-slate-400 px-2.5 py-1"><span>ภาษีมูลค่าเพิ่ม {Number(quotation.vatRate || 0)}%</span><span className="tabular-nums">{money(vatAmount)}</span></div> : null}<div className="flex justify-between gap-3 bg-slate-50 px-2.5 py-1.5 text-[13px] font-extrabold print:bg-white"><span>ยอดสุทธิ</span><span className="tabular-nums">{money(grandTotal)} บาท</span></div></section>
        </div>

        <footer className="quotation-signatures absolute bottom-[5mm] left-[8mm] right-[8mm] grid grid-cols-2 gap-[20mm] text-center text-[10px]"><div><div className="mx-auto h-[11mm] w-[86%] border-b border-slate-500" /><p className="mt-1 font-semibold">ผู้เสนอราคา / QUOTED BY</p><p className="mt-1 text-[9px]">วันที่ ______ / ______ / ______</p></div><div><div className="mx-auto h-[11mm] w-[86%] border-b border-slate-500" /><p className="mt-1 font-semibold">ผู้ตอบรับใบเสนอราคา / ACCEPTED BY</p><p className="mt-1 text-[9px]">วันที่ ______ / ______ / ______</p></div></footer>
      </section>

      <style>{`
        .quotation-a4 { font-family: var(--document-font-family, Tahoma, Arial, sans-serif); }
        @media print {
          @page { size: A4; margin: 6mm !important; }
          html, body, #root { margin: 0 !important; padding: 0 !important; min-height: 0 !important; height: auto !important; }
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body:has(.quotation-print-shell) #root *:has(.quotation-print-shell) { box-sizing: border-box !important; display: block !important; position: static !important; width: auto !important; max-width: none !important; min-width: 0 !important; min-height: 0 !important; height: auto !important; margin: 0 !important; padding: 0 !important; overflow: visible !important; transform: none !important; }
          .quotation-print-shell { display: block !important; width: auto !important; min-height: 0 !important; margin: 0 !important; padding: 0 !important; background: white !important; }
          body .quotation-a4 { box-sizing: border-box !important; display: flex !important; flex-direction: column !important; position: relative !important; width: 195mm !important; max-width: 195mm !important; height: 280mm !important; min-height: 280mm !important; max-height: 280mm !important; margin: 0 auto !important; padding: 5mm !important; border: 0.3mm solid #444 !important; border-radius: 2.5mm !important; box-shadow: none !important; overflow: hidden !important; page-break-inside: avoid !important; break-inside: avoid-page !important; }
          .quotation-document-header, .quotation-document-title, .quotation-info-panel, .quotation-message, .quotation-table-wrap, .quotation-settlement, .quotation-signatures, tr, td, th { page-break-inside: avoid !important; break-inside: avoid-page !important; }
          body .quotation-signatures { position: absolute !important; left: 8mm !important; right: 8mm !important; bottom: 5mm !important; }
        }
      `}</style>
    </main>
  );
};

export default QuotationPrintPage;