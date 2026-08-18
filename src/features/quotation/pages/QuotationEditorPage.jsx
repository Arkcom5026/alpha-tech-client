import React, { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, FileText, PackagePlus, Search, UserRound } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { feedback } from '@/design-system';
import useCustomerStore from '@/features/customer/store/customerStore';
import { getCustomerDisplayName } from '@/features/customer/utils/customerDisplayName';
import { searchSaleItems } from '@/features/sales/item-search/api/saleItemSearchApi';
import { addQuotationLine, getQuotation, updateQuotation, updateQuotationLine } from '../api/quotationApi';

const STATUS_LABELS = {
  DRAFT: 'ร่าง',
  ISSUED: 'ออกเอกสารแล้ว',
  ACCEPTED: 'ลูกค้ายอมรับ',
  REJECTED: 'ลูกค้าปฏิเสธ',
  EXPIRED: 'หมดอายุ',
  CANCELLED: 'ยกเลิก',
  CONVERTED: 'สร้างการขายแล้ว',
};

const money = (value) => Number(value || 0).toLocaleString('th-TH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const buildPreservedDraftPayload = (quotation, customerId = quotation?.customerId ?? null) => ({
  customerId,
  subject: quotation?.subject || null,
  introduction: quotation?.introduction || null,
  closingNote: quotation?.closingNote || null,
  notes: quotation?.notes || null,
  paymentTerms: quotation?.paymentTerms || null,
  customerName: quotation?.customerName || null,
  customerCompany: quotation?.customerCompany || null,
  customerDepartment: quotation?.customerDepartment || null,
  customerContactName: quotation?.customerContactName || null,
  customerPhone: quotation?.customerPhone || null,
  customerTaxId: quotation?.customerTaxId || null,
  customerAddress: quotation?.customerAddress || null,
  issueDate: quotation?.issueDate || null,
  validUntil: quotation?.validUntil || null,
  billDiscount: 0,
  vatEnabled: quotation?.vatEnabled !== false,
  vatRate: Number(quotation?.vatRate ?? 7),
});

const resolveIdentifier = (item = {}) =>
  item?.serialNumber || item?.barcodeAuthority?.barcode || item?.barcode || '';

const groupProductSearchResults = (items = []) => {
  const groups = new Map();
  items.forEach((item) => {
    const productId = Number(item?.productId ?? item?.product?.id);
    if (!productId) return;
    if (!groups.has(productId)) {
      groups.set(productId, {
        productId,
        representative: item,
        product: item?.product || {},
        prices: item?.prices || {},
        availableQuantity: 0,
        hasAvailability: false,
        stockTypes: new Set(),
        identifiers: [],
        seenStockKeys: new Set(),
      });
    }

    const group = groups.get(productId);
    const type = String(item?.type || '').toUpperCase();
    if (type) group.stockTypes.add(type);
    const identifier = resolveIdentifier(item);
    const stockKey = type === 'STOCK'
      ? `STOCK:${item?.stockItemId || identifier}`
      : type === 'SIMPLE'
        ? `SIMPLE:${item?.simpleLotId || identifier}`
        : `${type || 'UNKNOWN'}:${item?.stockItemId || item?.simpleLotId || identifier}`;

    if (stockKey && !group.seenStockKeys.has(stockKey)) {
      group.seenStockKeys.add(stockKey);
      if (type === 'STOCK') {
        group.availableQuantity += 1;
        group.hasAvailability = true;
      } else if (type === 'SIMPLE') {
        const quantityAvailable = Number(item?.quantityAvailable ?? item?.qtyRemaining);
        if (Number.isFinite(quantityAvailable)) {
          group.availableQuantity += Math.max(0, quantityAvailable);
          group.hasAvailability = true;
        }
      }
    }

    if (identifier && !group.identifiers.includes(identifier) && group.identifiers.length < 4) {
      group.identifiers.push(identifier);
    }
  });

  return Array.from(groups.values()).map((group) => ({
    ...group,
    stockTypes: Array.from(group.stockTypes),
  }));
};

const QuotationEditorPage = () => {
  const { shopSlug, quotationId } = useParams();
  const navigate = useNavigate();
  const prefix = `/${shopSlug || 'advancetech'}/pos/sales/quotations`;
  const searchCustomers = useCustomerStore((state) => state.searchStoreCustomersAction);

  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customerQuery, setCustomerQuery] = useState('');
  const [customerResults, setCustomerResults] = useState([]);
  const [customerSearching, setCustomerSearching] = useState(false);
  const [customerSaving, setCustomerSaving] = useState(false);
  const [productQuery, setProductQuery] = useState('');
  const [productResults, setProductResults] = useState([]);
  const [productSearching, setProductSearching] = useState(false);
  const [productSavingId, setProductSavingId] = useState(null);
  const [lineDrafts, setLineDrafts] = useState({});
  const [lineSavingId, setLineSavingId] = useState(null);

  const editable = quotation?.status === 'DRAFT';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const next = await getQuotation(quotationId);
      setQuotation(next);
      setLineDrafts({});
    } catch (error) {
      feedback.actionError(error, 'โหลดใบเสนอราคาไม่สำเร็จ', `quotation:${quotationId}:intake:load:error`);
    } finally {
      setLoading(false);
    }
  }, [quotationId]);

  useEffect(() => { load(); }, [load]);

  const handleCustomerSearch = async (event) => {
    event?.preventDefault?.();
    const query = customerQuery.trim();
    if (!query) {
      setCustomerResults([]);
      return;
    }
    setCustomerSearching(true);
    try {
      const payload = await searchCustomers(query);
      setCustomerResults(Array.isArray(payload?.results) ? payload.results : []);
    } catch (error) {
      feedback.actionError(error, 'ค้นหาลูกค้าไม่สำเร็จ', `quotation:${quotationId}:customer-search:error`);
      setCustomerResults([]);
    } finally {
      setCustomerSearching(false);
    }
  };

  const chooseCustomer = async (customer) => {
    if (!editable || customerSaving || !customer?.id) return;
    setCustomerSaving(true);
    try {
      const updated = await updateQuotation(quotationId, buildPreservedDraftPayload(quotation, customer.id));
      setQuotation(updated);
      setCustomerResults([]);
      setCustomerQuery('');
      feedback.actionSuccess('เลือกผู้รับใบเสนอราคาแล้ว', `quotation:${quotationId}:customer:${customer.id}:select:success`);
    } catch (error) {
      feedback.actionError(error, 'เลือกผู้รับใบเสนอราคาไม่สำเร็จ', `quotation:${quotationId}:customer:select:error`);
    } finally {
      setCustomerSaving(false);
    }
  };

  const handleProductSearch = async (event) => {
    event?.preventDefault?.();
    const query = productQuery.trim();
    if (!query) {
      setProductResults([]);
      return;
    }
    setProductSearching(true);
    try {
      const result = await searchSaleItems(query);
      const grouped = groupProductSearchResults(result?.items || []);
      setProductResults(grouped);
      if (!grouped.length) feedback.info('ไม่พบสินค้าที่ตรงกับคำค้นหา');
    } catch (error) {
      feedback.actionError(error, 'ค้นหาสินค้าไม่สำเร็จ', `quotation:${quotationId}:product-search:error`);
    } finally {
      setProductSearching(false);
    }
  };

  const addProductHelper = async (group) => {
    if (!editable || productSavingId) return;
    const item = group?.representative || group;
    const productId = Number(group?.productId ?? item?.productId ?? item?.product?.id) || null;
    if (!productId) return;

    const title = item?.product?.name || group?.product?.name || 'สินค้า';
    const model = item?.product?.codeType || group?.product?.codeType || '';
    const unitName = item?.unit || item?.product?.unit || group?.product?.unit || '';
    const unitPrice = Number(item?.prices?.retail ?? group?.prices?.retail ?? 0) || 0;

    setProductSavingId(productId);
    try {
      await addQuotationLine(quotationId, {
        sourceProductId: productId,
        title,
        description: model ? `รุ่น/แบบ: ${model}` : '',
        quantity: 1,
        unitName,
        unitPrice,
        discountAmount: 0,
        sortOrder: quotation?.items?.length || 0,
      });
      await load();
      setProductResults([]);
      setProductQuery('');
      feedback.actionSuccess('เพิ่มสินค้าเป็นรายการตั้งต้นแล้ว', `quotation:${quotationId}:product:${productId}:add:success`);
    } catch (error) {
      feedback.actionError(error, 'เพิ่มสินค้าในใบเสนอราคาไม่สำเร็จ', `quotation:${quotationId}:product:${productId}:add:error`);
    } finally {
      setProductSavingId(null);
    }
  };

  const getLineDraft = (line) => lineDrafts[line.id] || {
    quantity: String(Number(line.quantity || 0)),
    adjustment: '0',
  };

  const changeLineDraft = (line, field, value) => {
    const current = getLineDraft(line);
    setLineDrafts((prev) => ({ ...prev, [line.id]: { ...current, [field]: value } }));
  };

  const saveLineQuickEdit = async (line) => {
    if (!editable || lineSavingId) return;
    const draft = getLineDraft(line);
    const quantity = Number(draft.quantity);
    const adjustment = Number(draft.adjustment || 0);
    const currentPrice = Number(line.unitPrice || 0);
    const adjustedPrice = currentPrice + adjustment;

    if (!Number.isFinite(quantity) || quantity <= 0) {
      feedback.info('จำนวนต้องมากกว่า 0');
      return;
    }
    if (!Number.isFinite(adjustment) || adjustedPrice < 0) {
      feedback.info('ราคาหลังปรับต้องไม่ต่ำกว่า 0');
      return;
    }

    setLineSavingId(line.id);
    try {
      await updateQuotationLine(quotationId, line.id, {
        sourceProductId: line.sourceProductId || null,
        title: line.title,
        description: line.description || '',
        quantity,
        unitName: line.unitName || '',
        unitPrice: adjustedPrice,
        discountAmount: 0,
        sortOrder: Number(line.sortOrder || 0),
      });
      await load();
      feedback.actionSuccess('อัปเดตจำนวนและราคาหลังปรับแล้ว', `quotation:${quotationId}:line:${line.id}:quick-edit:success`);
    } catch (error) {
      feedback.actionError(error, 'อัปเดตจำนวนหรือราคาไม่สำเร็จ', `quotation:${quotationId}:line:${line.id}:quick-edit:error`);
    } finally {
      setLineSavingId(null);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">กำลังโหลดใบเสนอราคา...</div>;
  if (!quotation) return <div className="p-8 text-center text-rose-700">ไม่พบใบเสนอราคา</div>;

  const recipientName = quotation.customerCompany || quotation.customerName || 'ยังไม่ระบุลูกค้า';
  const customerMeta = [
    quotation.customerContactName ? `ผู้ติดต่อ: ${quotation.customerContactName}` : '',
    quotation.customerPhone ? `โทร: ${quotation.customerPhone}` : '',
    quotation.customerTaxId ? `เลขผู้เสียภาษี: ${quotation.customerTaxId}` : '',
  ].filter(Boolean);
  const quotationItems = quotation.items || [];
  const adjustedTotal = quotationItems.reduce(
    (sum, line) => sum + Math.max(0, Number(line.quantity || 0)) * Math.max(0, Number(line.unitPrice || 0)),
    0,
  );
  const taxableBase = adjustedTotal;
  const vatRate = quotation.vatEnabled === false ? 0 : Math.max(0, Number(quotation.vatRate ?? 7));
  const vatAmount = taxableBase * vatRate / 100;
  const grandTotal = taxableBase + vatAmount;

  return (
    <div className="mx-auto w-full max-w-[1380px] space-y-4 p-4 text-slate-800">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate(prefix)} className="rounded-xl border border-slate-300 bg-white p-2 hover:bg-slate-50" aria-label="กลับไปหน้ารายการใบเสนอราคา"><ArrowLeft className="h-4 w-4" /></button>
          <div>
            <div className="flex flex-wrap items-center gap-2"><h1 className="text-xl font-bold text-slate-950">{quotation.code}</h1><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold">{STATUS_LABELS[quotation.status] || quotation.status}</span></div>
            <p className="mt-1 text-sm text-slate-500">หน้านี้ใช้สำหรับเลือกลูกค้าและสินค้าเท่านั้น รายละเอียดทั้งหมดจัดทำต่อบนหน้าเอกสาร</p>
          </div>
        </div>
        <button type="button" onClick={() => navigate(`${prefix}/${quotationId}/print`)} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 text-sm font-semibold text-white hover:bg-teal-800"><FileText className="h-4 w-4" /> เปิดหน้าเอกสาร</button>
      </div>

      {!editable ? <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">ใบเสนอราคานี้ออกเอกสารแล้ว การเลือกลูกค้าและเพิ่มสินค้าถูกล็อกเพื่อรักษา snapshot ของเอกสาร</div> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-start gap-3 border-b border-slate-100 pb-4">
            <div className="rounded-xl bg-amber-50 p-2.5 text-amber-700"><UserRound className="h-5 w-5" /></div>
            <div className="min-w-0 flex-1"><h2 className="font-bold text-slate-950">เลือกลูกค้า</h2><p className="mt-1 text-sm font-semibold text-slate-800">{recipientName}</p>{customerMeta.length ? <p className="mt-1 text-xs text-slate-500">{customerMeta.join(' · ')}</p> : null}{quotation.customerAddress ? <p className="mt-1 line-clamp-2 text-xs text-slate-500">ที่อยู่: {quotation.customerAddress}</p> : null}</div>
          </div>
          {editable ? <form onSubmit={handleCustomerSearch} className="space-y-3"><div className="flex gap-2"><label className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={customerQuery} onChange={(event) => setCustomerQuery(event.target.value)} placeholder="ค้นหาชื่อ เบอร์โทร หน่วยงาน หรือเลขผู้เสียภาษี" className="h-11 w-full rounded-xl border border-slate-300 pl-10 pr-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" /></label><button type="submit" disabled={customerSearching || customerSaving} className="rounded-xl bg-teal-700 px-5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50">{customerSearching ? 'กำลังค้นหา...' : 'ค้นหา'}</button></div>{customerResults.length ? <div className="max-h-80 space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-2">{customerResults.map((customer) => <button key={customer.id} type="button" disabled={customerSaving} onClick={() => chooseCustomer(customer)} className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-left hover:border-teal-300 hover:bg-teal-50 disabled:opacity-50"><p className="font-semibold text-slate-900">{getCustomerDisplayName(customer)}</p><p className="mt-1 text-xs text-slate-500">{[customer.phone, customer.email, customer.taxId].filter(Boolean).join(' · ') || 'ไม่มีข้อมูลติดต่อเพิ่มเติม'}</p></button>)}</div> : null}</form> : null}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-start gap-3 border-b border-slate-100 pb-4"><div className="rounded-xl bg-teal-50 p-2.5 text-teal-700"><PackagePlus className="h-5 w-5" /></div><div><h2 className="font-bold text-slate-950">เลือกสินค้า</h2><p className="mt-1 text-xs text-slate-500">เป็นตัวช่วยเท่านั้น — เพิ่มแล้วสามารถแก้รายละเอียดทั้งหมดต่อบนหน้าเอกสาร</p></div></div>
          {editable ? <form onSubmit={handleProductSearch} className="space-y-3"><div className="flex gap-2"><label className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={productQuery} onChange={(event) => setProductQuery(event.target.value)} placeholder="ค้นหาสินค้าเพื่อช่วยสร้างรายการ" className="h-11 w-full rounded-xl border border-slate-300 pl-10 pr-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" /></label><button type="submit" disabled={productSearching || Boolean(productSavingId)} className="rounded-xl bg-teal-700 px-5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50">{productSearching ? 'กำลังค้นหา...' : 'ค้นหา'}</button></div>{productResults.length ? <div className="max-h-[360px] space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-2">{productResults.map((group) => { const product = group.product || group.representative?.product || {}; const brand = product.brandName || product.brand?.name || ''; const model = product.codeType || ''; const retail = Number(group.prices?.retail ?? group.representative?.prices?.retail ?? 0) || 0; return <button key={group.productId} type="button" disabled={Boolean(productSavingId)} onClick={() => addProductHelper(group)} className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-left hover:border-teal-300 hover:bg-teal-50 disabled:opacity-50"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="font-semibold text-slate-900">{product.name || 'สินค้า'}</p><p className="mt-1 text-xs text-slate-500">{[brand, model].filter(Boolean).join(' · ') || 'ไม่มีข้อมูลรุ่น/แบรนด์'}</p></div><div className="shrink-0 text-right"><p className="text-xs text-slate-500">ราคาปลีก</p><p className="font-bold text-teal-800">{money(retail)} ฿</p></div></div><div className="mt-2 flex flex-wrap gap-2 text-[11px]"><span className="rounded-full bg-emerald-50 px-2 py-1 font-semibold text-emerald-800">พร้อมขาย: {group.hasAvailability ? `${group.availableQuantity} ชิ้น` : 'ไม่พบจำนวนจากผลค้นหา'}</span>{group.stockTypes.length ? <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">{group.stockTypes.join(' / ')}</span> : null}</div>{group.identifiers.length ? <p className="mt-2 truncate text-[11px] text-slate-500">Barcode/SN: {group.identifiers.join(' · ')}</p> : null}<p className="mt-2 text-[11px] text-slate-400">คลิกเพื่อเพิ่มเป็นรายการตั้งต้น</p></button>; })}</div> : null}<p className="rounded-xl border border-teal-100 bg-teal-50/50 px-3 py-2 text-[11px] leading-5 text-teal-900">ข้อมูลสต๊อกเป็นข้อมูลประกอบการเสนอราคา ไม่ใช่การจองสต๊อก</p></form> : null}
        </section>
      </div>

      <section data-testid="quotation-intake-overview" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-2 border-b border-slate-100 pb-3 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="font-bold text-slate-950">รายการเบื้องต้นในใบเสนอราคา</h2><p className="mt-1 text-xs text-slate-500">ปรับจำนวนและราคาเพื่อประเมินยอดได้ทันที ส่วนรายละเอียดข้อความและ Manual ได้จากหน้าเอกสารโดยตรง</p></div><p className="text-xs text-slate-500">ทั้งหมด <strong className="text-slate-800">{quotationItems.length}</strong> รายการ</p></div>

        <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-[1120px] w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="w-12 px-3 py-2.5 text-center">#</th><th className="px-3 py-2.5 text-left">รายการ / รายละเอียด</th><th className="w-28 px-3 py-2.5 text-left">แหล่งที่มา</th><th className="w-24 px-3 py-2.5 text-center">จำนวน</th><th className="w-20 px-3 py-2.5 text-center">หน่วย</th><th className="w-28 px-3 py-2.5 text-right">ราคาปัจจุบัน</th><th className="w-32 px-3 py-2.5 text-center">ปรับราคา (+/-)</th><th className="w-28 px-3 py-2.5 text-right">ราคาหลังปรับ</th><th className="w-28 px-3 py-2.5 text-right">จำนวนเงิน</th><th className="w-24 px-3 py-2.5 text-center">บันทึก</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {!quotationItems.length ? <tr><td colSpan="10" className="px-3 py-8 text-center text-sm text-slate-500">ยังไม่มีรายการ — จะเลือกสินค้าจากด้านบน หรือเพิ่ม Manual บนหน้าเอกสารก็ได้</td></tr> : quotationItems.map((line, index) => {
                const draft = getLineDraft(line);
                const qty = Math.max(0, Number(draft.quantity || 0));
                const adjustment = Number(draft.adjustment || 0);
                const adjustedPrice = Math.max(0, Number(line.unitPrice || 0) + (Number.isFinite(adjustment) ? adjustment : 0));
                const previewAmount = Math.max(0, qty * adjustedPrice);
                return <tr key={line.id} className="align-top"><td className="px-3 py-3 text-center text-slate-500">{index + 1}</td><td className="px-3 py-3"><p className="font-semibold text-slate-900">{line.title}</p>{line.description ? <p className="mt-1 line-clamp-2 whitespace-pre-line text-xs text-slate-500">{line.description}</p> : null}</td><td className="px-3 py-3"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${line.sourceProductId ? 'bg-teal-50 text-teal-800' : 'bg-slate-100 text-slate-600'}`}>{line.sourceProductId ? 'สินค้าในระบบ' : 'Manual'}</span></td><td className="px-2 py-2 text-center"><input data-testid={`quotation-intake-quantity-${line.id}`} type="number" min="0.01" step="0.01" disabled={!editable || lineSavingId === line.id} value={draft.quantity} onChange={(event) => changeLineDraft(line, 'quantity', event.target.value)} className="h-9 w-20 rounded-lg border border-slate-300 px-2 text-right tabular-nums outline-none focus:border-teal-500" /></td><td className="px-3 py-3 text-center">{line.unitName || '-'}</td><td className="px-3 py-3 text-right tabular-nums">{money(line.unitPrice)}</td><td className="px-2 py-2 text-center"><input data-testid={`quotation-intake-adjustment-${line.id}`} type="number" step="0.01" disabled={!editable || lineSavingId === line.id} value={draft.adjustment} onChange={(event) => changeLineDraft(line, 'adjustment', event.target.value)} className="h-9 w-28 rounded-lg border border-slate-300 px-2 text-right tabular-nums outline-none focus:border-teal-500" /></td><td className="px-3 py-3 text-right font-semibold tabular-nums text-teal-800">{money(adjustedPrice)}</td><td className="px-3 py-3 text-right font-semibold tabular-nums">{money(previewAmount)}</td><td className="px-2 py-2 text-center"><button data-testid={`quotation-intake-save-${line.id}`} type="button" disabled={!editable || Boolean(lineSavingId)} onClick={() => saveLineQuickEdit(line)} className="h-9 rounded-lg bg-teal-700 px-3 text-xs font-semibold text-white hover:bg-teal-800 disabled:opacity-50">{lineSavingId === line.id ? 'กำลังบันทึก' : 'บันทึก'}</button></td></tr>;
              })}
            </tbody>
          </table>
        </div>

        <div data-testid="quotation-intake-totals" className="mt-4 grid gap-4 lg:grid-cols-[1fr_380px]">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-600">ยอดด้านขวาเป็นยอดประมาณการจากราคาหลังปรับในใบเสนอราคาปัจจุบัน การปรับจำนวนหรือราคาบนหน้านี้จะบันทึกลง Draft Quotation เท่านั้น และไม่ตัดหรือจองสต๊อกสินค้า</div>
          <div className="rounded-xl border border-slate-200 bg-white p-4"><div className="space-y-2 text-sm"><div className="flex items-center justify-between"><span className="text-slate-600">ยอดรวมราคาหลังปรับ</span><strong className="tabular-nums">{money(adjustedTotal)} ฿</strong></div><div className="flex items-center justify-between border-t border-slate-200 pt-2"><span className="text-slate-600">มูลค่าก่อนภาษี</span><strong className="tabular-nums">{money(taxableBase)} ฿</strong></div><div className="flex items-center justify-between"><span className="text-slate-600">VAT {money(vatRate).replace('.00', '')}%</span><strong className="tabular-nums">{money(vatAmount)} ฿</strong></div><div className="flex items-center justify-between rounded-lg bg-teal-50 px-3 py-2 text-base"><span className="font-bold text-slate-900">ยอดสุทธิประมาณการ</span><strong className="text-lg tabular-nums text-teal-800">{money(grandTotal)} ฿</strong></div></div></div>
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-teal-200 bg-teal-50/50 p-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-bold text-slate-950">พร้อมจัดทำใบเสนอราคา</h2><p className="mt-1 text-sm text-slate-600">ปรับจำนวนและราคาเบื้องต้นได้จากหน้านี้ ส่วนรายละเอียดเอกสารจัดทำต่อบน Document Workspace โดยตรง</p></div><button type="button" onClick={() => navigate(`${prefix}/${quotationId}/print`)} className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 text-sm font-semibold text-white hover:bg-teal-800"><FileText className="h-4 w-4" /> ไปหน้าเอกสาร</button></section>
    </div>
  );
};

export default QuotationEditorPage;