import React, { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, FileText, PackagePlus, Search, UserRound } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { feedback } from '@/design-system';
import useCustomerStore from '@/features/customer/store/customerStore';
import { getCustomerDisplayName } from '@/features/customer/utils/customerDisplayName';
import { searchSaleItems } from '@/features/sales/item-search/api/saleItemSearchApi';
import { addQuotationLine, getQuotation, updateQuotation } from '../api/quotationApi';

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
  billDiscount: Number(quotation?.billDiscount || 0),
  vatEnabled: quotation?.vatEnabled !== false,
  vatRate: Number(quotation?.vatRate ?? 7),
});

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

  const editable = quotation?.status === 'DRAFT';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setQuotation(await getQuotation(quotationId));
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
      const updated = await updateQuotation(
        quotationId,
        buildPreservedDraftPayload(quotation, customer.id),
      );
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
      const seen = new Set();
      const deduped = (result?.items || []).filter((item) => {
        const productId = Number(item?.productId ?? item?.product?.id);
        if (!productId || seen.has(productId)) return false;
        seen.add(productId);
        return true;
      });
      setProductResults(deduped);
      if (!deduped.length) feedback.info('ไม่พบสินค้าที่ตรงกับคำค้นหา');
    } catch (error) {
      feedback.actionError(error, 'ค้นหาสินค้าไม่สำเร็จ', `quotation:${quotationId}:product-search:error`);
    } finally {
      setProductSearching(false);
    }
  };

  const addProductHelper = async (item) => {
    if (!editable || productSavingId) return;
    const productId = Number(item?.productId ?? item?.product?.id) || null;
    if (!productId) return;

    const title = item?.product?.name || 'สินค้า';
    const model = item?.product?.codeType || '';
    const unitName = item?.unit || item?.product?.unit || '';
    const unitPrice = Number(item?.prices?.retail ?? 0) || 0;

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

  if (loading) return <div className="p-8 text-center text-slate-500">กำลังโหลดใบเสนอราคา...</div>;
  if (!quotation) return <div className="p-8 text-center text-rose-700">ไม่พบใบเสนอราคา</div>;

  const recipientName = quotation.customerCompany || quotation.customerName || 'ยังไม่ระบุลูกค้า';

  return (
    <div className="mx-auto w-full max-w-[1380px] space-y-4 p-4 text-slate-800">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate(prefix)} className="rounded-xl border border-slate-300 bg-white p-2 hover:bg-slate-50" aria-label="กลับไปหน้ารายการใบเสนอราคา">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-slate-950">{quotation.code}</h1>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold">{STATUS_LABELS[quotation.status] || quotation.status}</span>
            </div>
            <p className="mt-1 text-sm text-slate-500">หน้านี้ใช้สำหรับเลือกลูกค้าและสินค้าเท่านั้น รายละเอียดทั้งหมดจัดทำต่อบนหน้าเอกสาร</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate(`${prefix}/${quotationId}/print`)}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 text-sm font-semibold text-white hover:bg-teal-800"
        >
          <FileText className="h-4 w-4" /> เปิดหน้าเอกสาร
        </button>
      </div>

      {!editable ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          ใบเสนอราคานี้ออกเอกสารแล้ว การเลือกลูกค้าและเพิ่มสินค้าถูกล็อกเพื่อรักษา snapshot ของเอกสาร
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-start gap-3 border-b border-slate-100 pb-4">
            <div className="rounded-xl bg-amber-50 p-2.5 text-amber-700"><UserRound className="h-5 w-5" /></div>
            <div className="min-w-0">
              <h2 className="font-bold text-slate-950">เลือกลูกค้า</h2>
              <p className="mt-1 text-xs text-slate-500">ลูกค้าปัจจุบัน: <strong className="text-slate-800">{recipientName}</strong></p>
            </div>
          </div>

          {editable ? (
            <form onSubmit={handleCustomerSearch} className="space-y-3">
              <div className="flex gap-2">
                <label className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={customerQuery}
                    onChange={(event) => setCustomerQuery(event.target.value)}
                    placeholder="ค้นหาชื่อ เบอร์โทร หน่วยงาน หรือเลขผู้เสียภาษี"
                    className="h-11 w-full rounded-xl border border-slate-300 pl-10 pr-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  />
                </label>
                <button type="submit" disabled={customerSearching || customerSaving} className="rounded-xl bg-teal-700 px-5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50">
                  {customerSearching ? 'กำลังค้นหา...' : 'ค้นหา'}
                </button>
              </div>

              {customerResults.length ? (
                <div className="max-h-80 space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-2">
                  {customerResults.map((customer) => (
                    <button
                      key={customer.id}
                      type="button"
                      disabled={customerSaving}
                      onClick={() => chooseCustomer(customer)}
                      className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-left hover:border-teal-300 hover:bg-teal-50 disabled:opacity-50"
                    >
                      <p className="font-semibold text-slate-900">{getCustomerDisplayName(customer)}</p>
                      <p className="mt-1 text-xs text-slate-500">{[customer.phone, customer.email, customer.taxId].filter(Boolean).join(' · ') || 'ไม่มีข้อมูลติดต่อเพิ่มเติม'}</p>
                    </button>
                  ))}
                </div>
              ) : null}
            </form>
          ) : null}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-start gap-3 border-b border-slate-100 pb-4">
            <div className="rounded-xl bg-teal-50 p-2.5 text-teal-700"><PackagePlus className="h-5 w-5" /></div>
            <div>
              <h2 className="font-bold text-slate-950">เลือกสินค้า</h2>
              <p className="mt-1 text-xs text-slate-500">เป็นตัวช่วยเท่านั้น — เพิ่มแล้วสามารถแก้รายละเอียดทั้งหมดต่อบนหน้าเอกสาร</p>
            </div>
          </div>

          {editable ? (
            <form onSubmit={handleProductSearch} className="space-y-3">
              <div className="flex gap-2">
                <label className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={productQuery}
                    onChange={(event) => setProductQuery(event.target.value)}
                    placeholder="ค้นหาสินค้าเพื่อช่วยสร้างรายการ"
                    className="h-11 w-full rounded-xl border border-slate-300 pl-10 pr-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  />
                </label>
                <button type="submit" disabled={productSearching || Boolean(productSavingId)} className="rounded-xl bg-teal-700 px-5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50">
                  {productSearching ? 'กำลังค้นหา...' : 'ค้นหา'}
                </button>
              </div>

              {productResults.length ? (
                <div className="max-h-80 space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-2">
                  {productResults.map((item) => {
                    const productId = Number(item?.productId ?? item?.product?.id);
                    const adding = productSavingId === productId;
                    return (
                      <button
                        key={productId}
                        type="button"
                        disabled={Boolean(productSavingId)}
                        onClick={() => addProductHelper(item)}
                        className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-left hover:border-teal-300 hover:bg-teal-50 disabled:opacity-50"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">{item?.product?.name || 'สินค้า'}</p>
                          <p className="mt-1 text-xs text-slate-500">{[item?.product?.codeType, `ราคาแนะนำ ${money(item?.prices?.retail || 0)} ฿`].filter(Boolean).join(' · ')}</p>
                        </div>
                        <span className="shrink-0 rounded-lg border border-teal-200 bg-teal-50 px-2.5 py-1.5 text-xs font-bold text-teal-800">
                          {adding ? 'กำลังเพิ่ม...' : 'เพิ่ม'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </form>
          ) : null}

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-600">
            รายการในเอกสารปัจจุบัน <strong className="text-slate-900">{quotation.items?.length || 0}</strong> รายการ — สามารถเพิ่มรายการ Manual ได้จากหน้าเอกสารโดยตรง
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-50 to-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold text-slate-950">พร้อมจัดทำใบเสนอราคา</h2>
            <p className="mt-1 text-sm text-slate-600">เพิ่ม/แก้รายการ ราคา จำนวน รายละเอียด และพิมพ์เอกสารจาก Document Workspace โดยตรง</p>
          </div>
          <button
            type="button"
            onClick={() => navigate(`${prefix}/${quotationId}/print`)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 text-sm font-semibold text-white hover:bg-teal-800"
          >
            <FileText className="h-4 w-4" /> ไปที่หน้าเอกสาร
          </button>
        </div>
      </section>
    </div>
  );
};

export default QuotationEditorPage;
