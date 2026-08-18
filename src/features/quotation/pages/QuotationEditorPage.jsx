import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowUp, FileCheck2, Plus, Printer, Save, Search, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { ConfirmActionDialog, feedback } from '@/design-system';
import { searchSaleItems } from '@/features/sales/item-search/api/saleItemSearchApi';
import {
  addQuotationLine,
  getQuotation,
  issueQuotation,
  removeQuotationLine,
  updateQuotation,
  updateQuotationLine,
} from '../api/quotationApi';

const EMPTY_LINE = Object.freeze({
  id: null,
  sourceProductId: null,
  title: '',
  description: '',
  quantity: 1,
  unitName: '',
  unitPrice: 0,
  discountAmount: 0,
  sortOrder: 0,
});

const STATUS_LABELS = {
  DRAFT: 'ร่าง',
  ISSUED: 'ออกเอกสารแล้ว',
  ACCEPTED: 'ลูกค้ายอมรับ',
  REJECTED: 'ลูกค้าปฏิเสธ',
  EXPIRED: 'หมดอายุ',
  CANCELLED: 'ยกเลิก',
  CONVERTED: 'สร้างการขายแล้ว',
};

const toInputDate = (value) => value ? new Date(value).toISOString().slice(0, 10) : '';
const money = (value) => Number(value || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const buildDocumentForm = (quotation) => ({
  customerId: quotation?.customerId || null,
  customerName: quotation?.customerName || '',
  customerCompany: quotation?.customerCompany || '',
  customerDepartment: quotation?.customerDepartment || '',
  customerContactName: quotation?.customerContactName || '',
  customerPhone: quotation?.customerPhone || '',
  customerTaxId: quotation?.customerTaxId || '',
  customerAddress: quotation?.customerAddress || '',
  subject: quotation?.subject || '',
  introduction: quotation?.introduction || '',
  closingNote: quotation?.closingNote || '',
  notes: quotation?.notes || '',
  paymentTerms: quotation?.paymentTerms || '',
  issueDate: toInputDate(quotation?.issueDate),
  validUntil: toInputDate(quotation?.validUntil),
  billDiscount: Number(quotation?.billDiscount || 0),
  vatEnabled: quotation?.vatEnabled !== false,
  vatRate: Number(quotation?.vatRate ?? 7),
});

const normalizeLine = (line = {}) => ({
  id: line.id || null,
  sourceProductId: line.sourceProductId || null,
  title: line.title || '',
  description: line.description || '',
  quantity: Number(line.quantity || 1),
  unitName: line.unitName || '',
  unitPrice: Number(line.unitPrice || 0),
  discountAmount: Number(line.discountAmount || 0),
  sortOrder: Number(line.sortOrder || 0),
});

const QuotationEditorPage = () => {
  const { shopSlug, quotationId } = useParams();
  const navigate = useNavigate();
  const prefix = `/${shopSlug || 'advancetech'}/pos/sales/quotations`;
  const [quotation, setQuotation] = useState(null);
  const [form, setForm] = useState(buildDocumentForm(null));
  const [lineForm, setLineForm] = useState({ ...EMPTY_LINE });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lineBusy, setLineBusy] = useState(false);
  const [productQuery, setProductQuery] = useState('');
  const [productResults, setProductResults] = useState([]);
  const [productSearching, setProductSearching] = useState(false);
  const [confirmation, setConfirmation] = useState(null);

  const editable = quotation?.status === 'DRAFT';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getQuotation(quotationId);
      setQuotation(data);
      setForm(buildDocumentForm(data));
    } catch (error) {
      feedback.actionError(error, 'โหลดใบเสนอราคาไม่สำเร็จ', `quotation:${quotationId}:load:error`);
    } finally {
      setLoading(false);
    }
  }, [quotationId]);

  useEffect(() => { load(); }, [load]);

  const patch = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const patchLine = (key, value) => setLineForm((current) => ({ ...current, [key]: value }));
  const resetLine = () => setLineForm({ ...EMPTY_LINE, sortOrder: quotation?.items?.length || 0 });

  const handleSaveDocument = async () => {
    if (!editable || saving) return;
    setSaving(true);
    try {
      const updated = await updateQuotation(quotationId, form);
      setQuotation(updated);
      setForm(buildDocumentForm(updated));
      feedback.actionSuccess('บันทึกรายละเอียดใบเสนอราคาแล้ว', `quotation:${quotationId}:save:success`);
    } catch (error) {
      feedback.actionError(error, 'บันทึกใบเสนอราคาไม่สำเร็จ', `quotation:${quotationId}:save:error`);
    } finally {
      setSaving(false);
    }
  };

  const handleProductSearch = async (event) => {
    event?.preventDefault?.();
    const query = productQuery.trim();
    if (!query) return;
    setProductSearching(true);
    try {
      const result = await searchSaleItems(query);
      const seen = new Set();
      const deduped = (result?.items || []).filter((item) => {
        const productId = Number(item?.productId ?? item?.product?.id);
        if (!productId || seen.has(productId)) return false;
        seen.add(productId);
        return true;
      });
      setProductResults(deduped);
      if (!deduped.length) feedback.info('ไม่พบสินค้าที่พร้อมใช้เป็นตัวช่วยกรอกข้อมูล');
    } catch (error) {
      feedback.actionError(error, 'ค้นหาสินค้าไม่สำเร็จ', `quotation:${quotationId}:product-search:error`);
    } finally {
      setProductSearching(false);
    }
  };

  const useProductHelper = (item) => {
    const productId = Number(item?.productId ?? item?.product?.id) || null;
    const title = item?.product?.name || '';
    const model = item?.product?.codeType || '';
    const suggestedPrice = Number(item?.prices?.retail ?? 0) || 0;
    setLineForm((current) => ({
      ...current,
      sourceProductId: productId,
      title: title || current.title,
      description: model ? `รุ่น/แบบ: ${model}` : current.description,
      unitPrice: suggestedPrice,
    }));
    setProductResults([]);
    setProductQuery('');
  };

  const handleSaveLine = async () => {
    if (!editable || lineBusy || !lineForm.title.trim()) {
      if (!lineForm.title.trim()) feedback.info('กรุณาระบุชื่อรายการ');
      return;
    }
    setLineBusy(true);
    try {
      const wasEditing = Boolean(lineForm.id);
      if (wasEditing) await updateQuotationLine(quotationId, lineForm.id, lineForm);
      else await addQuotationLine(quotationId, lineForm);
      await load();
      resetLine();
      feedback.actionSuccess(wasEditing ? 'แก้ไขรายการแล้ว' : 'เพิ่มรายการในใบเสนอราคาแล้ว', `quotation:${quotationId}:line:save:success`);
    } catch (error) {
      feedback.actionError(error, 'บันทึกรายการไม่สำเร็จ', `quotation:${quotationId}:line:save:error`);
    } finally {
      setLineBusy(false);
    }
  };

  const executeDeleteLine = async (lineId) => {
    setLineBusy(true);
    try {
      const updated = await removeQuotationLine(quotationId, lineId);
      setQuotation(updated);
      resetLine();
      feedback.actionSuccess('ลบรายการแล้ว', `quotation:${quotationId}:line:${lineId}:delete:success`);
    } catch (error) {
      feedback.actionError(error, 'ลบรายการไม่สำเร็จ', `quotation:${quotationId}:line:${lineId}:delete:error`);
    } finally {
      setLineBusy(false);
      setConfirmation(null);
    }
  };

  const moveLine = async (line, delta) => {
    if (!editable || lineBusy) return;
    const nextSortOrder = Math.max(0, Number(line.sortOrder || 0) + delta);
    setLineBusy(true);
    try {
      await updateQuotationLine(quotationId, line.id, { ...normalizeLine(line), sortOrder: nextSortOrder });
      await load();
    } catch (error) {
      feedback.actionError(error, 'จัดลำดับรายการไม่สำเร็จ', `quotation:${quotationId}:line:${line.id}:sort:error`);
    } finally {
      setLineBusy(false);
    }
  };

  const executeIssue = async () => {
    setSaving(true);
    try {
      await updateQuotation(quotationId, form);
      const issued = await issueQuotation(quotationId);
      setQuotation(issued);
      setForm(buildDocumentForm(issued));
      feedback.actionSuccess('ออกใบเสนอราคาเรียบร้อยแล้ว', `quotation:${quotationId}:issue:success`);
    } catch (error) {
      feedback.actionError(error, 'ออกใบเสนอราคาไม่สำเร็จ', `quotation:${quotationId}:issue:error`);
    } finally {
      setSaving(false);
      setConfirmation(null);
    }
  };

  const confirmBusy = confirmation?.kind === 'DELETE_LINE' ? lineBusy : saving;
  const totals = useMemo(() => ({
    subtotal: Number(quotation?.subtotal || 0),
    lineDiscount: Number(quotation?.lineDiscountTotal || 0),
    billDiscount: Number(quotation?.billDiscount || 0),
    vat: Number(quotation?.vatAmount || 0),
    grand: Number(quotation?.grandTotal || 0),
  }), [quotation]);

  if (loading) return <div className="p-8 text-center text-slate-500">กำลังโหลดใบเสนอราคา...</div>;
  if (!quotation) return <div className="p-8 text-center text-rose-700">ไม่พบใบเสนอราคา</div>;

  return (
    <div className="mx-auto w-full max-w-[1540px] space-y-4 p-4 text-slate-800">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate(prefix)} className="rounded-xl border border-slate-300 bg-white p-2 hover:bg-slate-50"><ArrowLeft className="h-4 w-4" /></button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-slate-950">{quotation.code}</h1>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold">{STATUS_LABELS[quotation.status] || quotation.status}</span>
            </div>
            <p className="mt-1 text-sm text-slate-500">หน้าเอกสารนี้เป็นพื้นที่ทำงานหลัก — รายการทั้งหมดสามารถพิมพ์เองได้โดยไม่ต้องอ้างสินค้า</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => navigate(`${prefix}/${quotationId}/print`)} className="inline-flex h-10 items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 text-sm font-semibold text-blue-800 hover:bg-blue-100"><Printer className="h-4 w-4" /> ดูเอกสาร A4</button>
          {editable ? <button type="button" onClick={handleSaveDocument} disabled={saving} className="inline-flex h-10 items-center gap-2 rounded-xl border border-teal-300 bg-white px-4 text-sm font-semibold text-teal-800 hover:bg-teal-50 disabled:opacity-50"><Save className="h-4 w-4" /> บันทึก</button> : null}
          {editable ? <button type="button" onClick={() => setConfirmation({ kind: 'ISSUE' })} disabled={saving} className="inline-flex h-10 items-center gap-2 rounded-xl bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50"><FileCheck2 className="h-4 w-4" /> ออกใบเสนอราคา</button> : null}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 font-bold text-slate-950">ผู้รับใบเสนอราคา</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <input disabled={!editable} value={form.customerCompany} onChange={(e) => patch('customerCompany', e.target.value)} placeholder="ชื่อหน่วยงาน / บริษัท" className="h-10 rounded-xl border border-slate-300 px-3 text-sm disabled:bg-slate-50" />
              <input disabled={!editable} value={form.customerName} onChange={(e) => patch('customerName', e.target.value)} placeholder="ชื่อลูกค้า" className="h-10 rounded-xl border border-slate-300 px-3 text-sm disabled:bg-slate-50" />
              <input disabled={!editable} value={form.customerDepartment} onChange={(e) => patch('customerDepartment', e.target.value)} placeholder="แผนก" className="h-10 rounded-xl border border-slate-300 px-3 text-sm disabled:bg-slate-50" />
              <input disabled={!editable} value={form.customerContactName} onChange={(e) => patch('customerContactName', e.target.value)} placeholder="ชื่อผู้ติดต่อ" className="h-10 rounded-xl border border-slate-300 px-3 text-sm disabled:bg-slate-50" />
              <input disabled={!editable} value={form.customerPhone} onChange={(e) => patch('customerPhone', e.target.value)} placeholder="โทรศัพท์" className="h-10 rounded-xl border border-slate-300 px-3 text-sm disabled:bg-slate-50" />
              <input disabled={!editable} value={form.customerTaxId} onChange={(e) => patch('customerTaxId', e.target.value)} placeholder="เลขประจำตัวผู้เสียภาษี" className="h-10 rounded-xl border border-slate-300 px-3 text-sm disabled:bg-slate-50" />
              <textarea disabled={!editable} value={form.customerAddress} onChange={(e) => patch('customerAddress', e.target.value)} placeholder="ที่อยู่" rows="3" className="rounded-xl border border-slate-300 p-3 text-sm disabled:bg-slate-50 md:col-span-2" />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 font-bold text-slate-950">เนื้อหาเอกสาร</h2>
            <div className="space-y-3">
              <input disabled={!editable} value={form.subject} onChange={(e) => patch('subject', e.target.value)} placeholder="เรื่อง / หัวข้อใบเสนอราคา" className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm disabled:bg-slate-50" />
              <textarea disabled={!editable} value={form.introduction} onChange={(e) => patch('introduction', e.target.value)} placeholder="ข้อความนำ / รายละเอียดก่อนตารางรายการ" rows="4" className="w-full rounded-xl border border-slate-300 p-3 text-sm leading-6 disabled:bg-slate-50" />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 border-b border-slate-100 pb-3">
              <h2 className="font-bold text-slate-950">รายการและรายละเอียด</h2>
              <p className="text-xs text-slate-500">พิมพ์เองได้ทั้งหมด หรือค้นหาสินค้าเพื่อช่วยเติมชื่อ/ราคา โดยข้อมูลที่บันทึกเป็น snapshot ของเอกสาร</p>
            </div>

            {editable ? <div className="mb-4 rounded-xl border border-teal-100 bg-teal-50/40 p-3">
              <form onSubmit={handleProductSearch} className="flex gap-2">
                <label className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={productQuery} onChange={(e) => setProductQuery(e.target.value)} placeholder="ค้นหาสินค้าเพื่อช่วยกรอก (ไม่บังคับ)" className="h-10 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 text-sm" /></label>
                <button type="submit" disabled={productSearching} className="rounded-xl border border-teal-300 bg-white px-4 text-sm font-semibold text-teal-800 hover:bg-teal-50 disabled:opacity-50">{productSearching ? 'ค้นหา...' : 'ค้นหา'}</button>
              </form>
              {productResults.length ? <div className="mt-2 grid gap-2 md:grid-cols-2">{productResults.map((item) => <button key={Number(item?.productId ?? item?.product?.id)} type="button" onClick={() => useProductHelper(item)} className="rounded-xl border border-slate-200 bg-white p-3 text-left hover:border-teal-300"><p className="font-semibold text-slate-900">{item?.product?.name || 'สินค้า'}</p><p className="mt-1 text-xs text-slate-500">{item?.product?.codeType || ''} · ราคาแนะนำ {money(item?.prices?.retail || 0)} ฿</p></button>)}</div> : null}
            </div> : null}

            {editable ? <div className="mb-4 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 lg:grid-cols-12">
              <input value={lineForm.title} onChange={(e) => patchLine('title', e.target.value)} placeholder="ชื่อรายการ" className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm lg:col-span-8" />
              <input type="number" min="0.01" step="0.01" value={lineForm.quantity} onChange={(e) => patchLine('quantity', e.target.value)} placeholder="จำนวน" className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm lg:col-span-2" />
              <input value={lineForm.unitName} onChange={(e) => patchLine('unitName', e.target.value)} placeholder="หน่วย" className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm lg:col-span-2" />
              <textarea value={lineForm.description} onChange={(e) => patchLine('description', e.target.value)} placeholder="รายละเอียดหลายบรรทัด เช่น รุ่น สเปก ขอบเขตงาน รับประกัน หรือเงื่อนไขเฉพาะรายการ" rows="4" className="rounded-xl border border-slate-300 bg-white p-3 text-sm leading-6 lg:col-span-8" />
              <div className="space-y-2 lg:col-span-4">
                <input type="number" min="0" step="0.01" value={lineForm.unitPrice} onChange={(e) => patchLine('unitPrice', e.target.value)} placeholder="ราคาต่อหน่วย" className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm" />
                <input type="number" min="0" step="0.01" value={lineForm.discountAmount} onChange={(e) => patchLine('discountAmount', e.target.value)} placeholder="ส่วนลดรายการ" className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm" />
                <div className="flex gap-2">{lineForm.id ? <button type="button" onClick={resetLine} className="h-10 flex-1 rounded-xl border border-slate-300 bg-white text-sm font-semibold">ยกเลิกแก้ไข</button> : null}<button type="button" onClick={handleSaveLine} disabled={lineBusy} className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 text-sm font-semibold text-white disabled:opacity-50"><Plus className="h-4 w-4" />{lineForm.id ? 'บันทึกแก้ไข' : 'เพิ่มรายการ'}</button></div>
              </div>
            </div> : null}

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-[920px] w-full text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="w-14 px-3 py-3">#</th><th className="px-3 py-3 text-left">รายการ / รายละเอียด</th><th className="w-24 px-3 py-3 text-right">จำนวน</th><th className="w-24 px-3 py-3">หน่วย</th><th className="w-32 px-3 py-3 text-right">ราคา/หน่วย</th><th className="w-28 px-3 py-3 text-right">ส่วนลด</th><th className="w-32 px-3 py-3 text-right">จำนวนเงิน</th>{editable ? <th className="w-36 px-3 py-3">จัดการ</th> : null}</tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {(quotation.items || []).length === 0 ? <tr><td colSpan={editable ? 8 : 7} className="px-3 py-10 text-center text-slate-500">ยังไม่มีรายการ — สามารถเพิ่มรายการเองได้จากฟอร์มด้านบน</td></tr> : null}
                  {(quotation.items || []).map((line, index) => <tr key={line.id} className="align-top"><td className="px-3 py-3 text-center text-slate-500">{index + 1}</td><td className="px-3 py-3"><button type="button" onClick={() => editable && setLineForm(normalizeLine(line))} className="w-full text-left"><p className="font-semibold text-slate-950">{line.title}</p>{line.description ? <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-slate-600">{line.description}</p> : null}{line.sourceProductId ? <span className="mt-1 inline-block rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">ช่วยกรอกจากสินค้า #{line.sourceProductId}</span> : null}</button></td><td className="px-3 py-3 text-right">{Number(line.quantity)}</td><td className="px-3 py-3 text-center">{line.unitName || '-'}</td><td className="px-3 py-3 text-right">{money(line.unitPrice)}</td><td className="px-3 py-3 text-right">{money(line.discountAmount)}</td><td className="px-3 py-3 text-right font-semibold">{money(line.lineTotal)}</td>{editable ? <td className="px-3 py-3"><div className="flex justify-center gap-1"><button type="button" onClick={() => moveLine(line, -1)} className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50" aria-label="เลื่อนรายการขึ้น"><ArrowUp className="h-3.5 w-3.5" /></button><button type="button" onClick={() => moveLine(line, 1)} className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50" aria-label="เลื่อนรายการลง"><ArrowDown className="h-3.5 w-3.5" /></button><button type="button" onClick={() => setConfirmation({ kind: 'DELETE_LINE', lineId: line.id, title: line.title })} className="rounded-lg border border-rose-200 p-1.5 text-rose-700 hover:bg-rose-50" aria-label="ลบรายการ"><Trash2 className="h-3.5 w-3.5" /></button></div></td> : null}</tr>)}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 font-bold text-slate-950">ข้อความท้ายเอกสาร</h2>
            <div className="space-y-3"><textarea disabled={!editable} value={form.closingNote} onChange={(e) => patch('closingNote', e.target.value)} placeholder="เงื่อนไข รับประกัน หรือข้อความหลังตาราง" rows="4" className="w-full rounded-xl border border-slate-300 p-3 text-sm leading-6 disabled:bg-slate-50" /><textarea disabled={!editable} value={form.notes} onChange={(e) => patch('notes', e.target.value)} placeholder="หมายเหตุ" rows="3" className="w-full rounded-xl border border-slate-300 p-3 text-sm leading-6 disabled:bg-slate-50" /></div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 font-bold text-slate-950">เงื่อนไขเอกสาร</h2>
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-600">วันที่เสนอราคา<input type="date" disabled={!editable} value={form.issueDate} onChange={(e) => patch('issueDate', e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm disabled:bg-slate-50" /></label>
              <label className="block text-xs font-semibold text-slate-600">ยืนราคาถึง<input type="date" disabled={!editable} value={form.validUntil} onChange={(e) => patch('validUntil', e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm disabled:bg-slate-50" /></label>
              <label className="block text-xs font-semibold text-slate-600">เงื่อนไขการชำระเงิน<input disabled={!editable} value={form.paymentTerms} onChange={(e) => patch('paymentTerms', e.target.value)} placeholder="เช่น เครดิต 30 วัน" className="mt-1 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm disabled:bg-slate-50" /></label>
              <label className="block text-xs font-semibold text-slate-600">ส่วนลดท้ายบิล<input type="number" min="0" step="0.01" disabled={!editable} value={form.billDiscount} onChange={(e) => patch('billDiscount', e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm disabled:bg-slate-50" /></label>
              <div className="grid grid-cols-[auto_1fr] items-center gap-3 rounded-xl border border-slate-200 p-3"><input type="checkbox" disabled={!editable} checked={form.vatEnabled} onChange={(e) => patch('vatEnabled', e.target.checked)} /><label className="text-sm font-semibold text-slate-700">คิดภาษีมูลค่าเพิ่ม <input type="number" min="0" step="0.01" disabled={!editable || !form.vatEnabled} value={form.vatRate} onChange={(e) => patch('vatRate', e.target.value)} className="ml-2 h-8 w-20 rounded-lg border border-slate-300 px-2 text-right" /> %</label></div>
            </div>
          </section>

          <section className="rounded-2xl border border-teal-200 bg-teal-50/60 p-4 shadow-sm">
            <h2 className="font-bold text-slate-950">สรุปยอด</h2>
            <div className="mt-3 space-y-2 text-sm"><div className="flex justify-between"><span>ยอดรายการ</span><strong>{money(totals.subtotal)} ฿</strong></div><div className="flex justify-between"><span>ส่วนลดรายการ</span><span>- {money(totals.lineDiscount)} ฿</span></div><div className="flex justify-between"><span>ส่วนลดท้ายบิล</span><span>- {money(totals.billDiscount)} ฿</span></div><div className="flex justify-between"><span>ภาษีมูลค่าเพิ่ม</span><span>{money(totals.vat)} ฿</span></div><div className="mt-3 flex justify-between border-t border-teal-200 pt-3 text-lg"><span className="font-bold">ยอดสุทธิ</span><strong className="text-teal-800">{money(totals.grand)} ฿</strong></div></div>
            {editable ? <p className="mt-3 text-xs leading-5 text-slate-500">ยอดสรุปจะอัปเดตหลังบันทึกรายการหรือกดบันทึกเอกสาร</p> : null}
          </section>
        </aside>
      </div>

      <ConfirmActionDialog
        open={Boolean(confirmation)}
        title={confirmation?.kind === 'DELETE_LINE' ? 'ลบรายการออกจากใบเสนอราคา' : 'ออกใบเสนอราคา'}
        description={confirmation?.kind === 'DELETE_LINE'
          ? `ยืนยันลบรายการ “${confirmation?.title || ''}” ออกจากเอกสาร?`
          : 'หลังออกใบเสนอราคาแล้ว Draft จะถูกล็อกเพื่อรักษาข้อมูลและรูปแบบเอกสาร ณ เวลาที่ออกเอกสาร'}
        confirmLabel={confirmation?.kind === 'DELETE_LINE' ? 'ลบรายการ' : 'ยืนยันออกใบเสนอราคา'}
        intent={confirmation?.kind === 'DELETE_LINE' ? 'destructive' : 'warning'}
        loading={confirmBusy}
        loadingLabel={confirmation?.kind === 'DELETE_LINE' ? 'กำลังลบ...' : 'กำลังออกเอกสาร...'}
        onClose={() => !confirmBusy && setConfirmation(null)}
        onConfirm={() => {
          if (confirmation?.kind === 'DELETE_LINE') executeDeleteLine(confirmation.lineId);
          if (confirmation?.kind === 'ISSUE') executeIssue();
        }}
      />
    </div>
  );
};

export default QuotationEditorPage;
