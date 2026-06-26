// src/features/purchaseOrderReceipt/pages/CreatePurchaseOrderReceiptPage.jsx
// 🏛️ Tenant-Safe Procurement Form: (Dual-Param Guard Activated, Store Sync & Glassmorphic Pack)

import React, { useEffect, useMemo, useState } from 'react';
// 🟢 [IMPORT FIXED] ดึง useParams มาเพื่อแกะรอยค่าพารามิเตอร์คั่น URL ป้องกันระบบดีดหนีกลับหน้าแรก
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import POItemListForReceipt from '@/features/purchaseOrderReceipt/components/POItemListForReceipt';
import usePurchaseOrderReceiptStore from '@/features/purchaseOrderReceipt/store/purchaseOrderReceiptStore';

import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileSpreadsheet, Calendar, User, FileText, Loader2, AlertCircle } from 'lucide-react';

const createReceiptSchema = z.object({
  supplierTaxInvoiceNumber: z.string().optional().nullable(),
  supplierTaxInvoiceDate: z.string().optional().nullable(),
  receivedAt: z.string().nonempty({ message: 'กรุณาระบุวันที่รับของ' }),
  note: z.string().optional().nullable(),
});

const formatDateTh = (value) => {
  try {
    if (!value) return '-';
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return '-';
    return new Intl.DateTimeFormat('th-TH', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
  } catch {
    return '-';
  }
};

const getErrorMessage = (err) => {
  if (!err) return null;
  if (typeof err === 'string') return err;
  return err?.message || err?.response?.data?.message || 'กรุณาลองใหม่อีกครั้ง';
};

const CreatePurchaseOrderReceiptPage = () => {
  // Normalize PO item display fields for table columns (category/type/brand/profile/template)
  const normalizePOItem = (it) => {
    const p = it?.product || it?.purchaseOrderItem?.product || null;
    const getName = (obj) => (obj && typeof obj === 'object' ? (obj.name ?? obj.label ?? obj.title ?? null) : null);

    const categoryName = getName(p?.category) || getName(p?.productCategory) || it?.categoryName || null;
    const productTypeName = getName(p?.productType) || it?.productTypeName || null;
    const brandName = getName(p?.brand) || it?.brandName || null;
    const profileName = getName(p?.productProfile) || getName(p?.profile) || it?.profileName || null;
    const templateName = getName(p?.template) || it?.templateName || null;

    const productName = p?.name || it?.productName || it?.name || null;
    const unitName = getName(p?.unit) || getName(p?.template?.unit) || it?.unitName || null;

    return {
      ...it,
      product: p || it?.product,
      productName,
      unitName,
      categoryName,
      productTypeName,
      brandName,
      profileName,
      templateName,
    };
  };

  // 🟢 [SLUG & DUAL-PARAM GUARD ACTIVATED] ดักจับพารามิเตอร์คู่ขนาน (รองรับทั้งระบบจัดเส้นทางแบบ :poId และ :id)
  const params = useParams();
  const shopSlug = params.shopSlug;
  const poId = params.poId || params.id; // หากฝั่งตารางส่ง id หรือ poId มา ตัวแปรจะจับคู่ล็อกเข้าฟังก์ชันได้ทันทีกระชับ 100%
  
  const navigate = useNavigate();

  const {
    currentOrder,
    loading,
    error,
    loadOrderByIdAction,
    loadOrderById,
    clearErrorAction,
  } = usePurchaseOrderReceiptStore();

  const normalizedItems = useMemo(() => {
    const items = Array.isArray(currentOrder?.items) ? currentOrder.items : [];
    return items.map(normalizePOItem);
  }, [currentOrder?.items]);

  const [receiptId, setReceiptId] = useState(null);

  const form = useForm({
    resolver: zodResolver(createReceiptSchema),
    defaultValues: {
      supplierTaxInvoiceNumber: '',
      supplierTaxInvoiceDate: new Date().toISOString().split('T')[0],
      receivedAt: new Date().toISOString().split('T')[0],
      note: '',
    },
  });

  // Keep formData reactive
  const formValues = useWatch({ control: form.control });
  const formData = useMemo(
    () => ({
      supplierTaxInvoiceNumber: formValues?.supplierTaxInvoiceNumber ?? '',
      supplierTaxInvoiceDate: formValues?.supplierTaxInvoiceDate ?? '',
      receivedAt: formValues?.receivedAt ?? '',
      note: formValues?.note ?? '',
    }),
    [formValues]
  );

  const doLoadOrder = () => {
    const fn = loadOrderByIdAction || loadOrderById;
    try {
      clearErrorAction?.();
      if (poId) {
        fn?.(Number(poId));
      }
    } catch (err) {
      console.error('📛 loadOrderById error:', err);
    }
  };

  useEffect(() => {
    if (poId) {
      doLoadOrder();
      setReceiptId(null);
    }
  }, [poId, loadOrderByIdAction, loadOrderById]);

  // 📦 LOADING FALLBACK STATE
  if (loading && !currentOrder) {
    return (
      <div className="w-full py-16 flex flex-col items-center justify-center gap-3 text-slate-400 font-bold select-none animate-fadeIn font-sans">
        <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
        <p className="text-sm">กำลังสกัดค้นโครงสร้างเอกสารใบสั่งซื้อพอร์ต Live API...</p>
      </div>
    );
  }

  // 📦 ERROR FALLBACK STATE
  if (error && !currentOrder) {
    return (
      <div className="max-w-xl mx-auto mt-8 p-6 bg-white border border-rose-200 text-center rounded-3xl shadow-sm space-y-4 animate-fadeIn font-sans">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 border border-rose-100">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-black text-slate-900 tracking-tight">โหลดข้อมูลใบสั่งซื้อไม่สำเร็จ</h2>
          <p className="text-xs font-bold text-rose-600 mt-1 break-words">{getErrorMessage(error)}</p>
        </div>
        <div className="flex gap-2 justify-center pt-2">
          <button type="button" onClick={doLoadOrder} className="px-4 py-2 bg-slate-800 text-white font-black text-xs rounded-xl shadow-sm active:scale-95 transition-all">ลองโหลดใหม่</button>
          <button type="button" onClick={() => clearErrorAction?.()} className="px-4 py-2 bg-slate-100 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-200 transition-all">ปิดข้อความ</button>
        </div>
      </div>
    );
  }

  // 📦 EMPTY FALLBACK STATE
  if (!currentOrder) {
    return (
      <div className="max-w-xl mx-auto mt-8 p-6 bg-white border border-slate-200 text-center rounded-3xl shadow-sm space-y-3 animate-fadeIn font-sans">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-400 border border-slate-200/60">
          <AlertCircle className="w-5 h-5" />
        </div>
        <p className="text-sm font-black text-slate-500">ไม่พบข้อมูลพิกัดใบสั่งซื้อฉบับนี้ในคลังสาขา</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-4 md:p-6 space-y-6 max-w-[1400px] mx-auto text-slate-800 selection:bg-orange-500 selection:text-white animate-fadeIn font-sans">
      
      {/* 🟦 1. ส่วนหัวบาร์ควบคุมคุมสิทธิ์สไตล์ Glassmorphism ผสานปุ่มถอยกลับเสถียร 100% */}
      <div className="bg-white/80 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800 p-6 rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.01)] backdrop-blur-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 transition-all duration-300">
        <div className="min-w-0">
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 select-none">
            <FileSpreadsheet className="w-5 h-5 text-orange-500" /> สร้างใบรับสินค้าจากใบสั่งซื้อ
          </h1>
          <p className="text-xs font-bold text-slate-400 dark:text-zinc-400 mt-1">
            Goods Receipt Processing Center • บันทึกหลักฐานเลขใบกำกับภาษีคู่ค้าและตรวจนับจำนวนรับของเข้าคลังพัสดุสาขา
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            const targetSlug = shopSlug || 'advancetech';
            navigate(`/${targetSlug}/pos/purchases/receipt`);
          }}
          className="flex items-center gap-1.5 h-10 px-4 text-xs font-black bg-white hover:bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded-xl transform active:scale-95 transition-all shadow-sm shrink-0 self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>กลับหน้ารายการตรวจรับ</span>
        </button>
      </div>

      {/* 🟦 2. แผงกรอกข้อมูลเอกสารและสรุป Profile ใบสั่งซื้อแบบกล่องโค้งพรีเมียม */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(() => {})} className="space-y-6">
          
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-[0_4px_25px_rgba(0,0,0,0.01)]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              
              {/* ข้อมูลดิบฝั่งซ้ายสรุปใบสั่งซื้อ */}
              <div className="space-y-3 bg-slate-50/60 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-800/60 p-5 rounded-2xl text-xs sm:text-sm font-bold text-slate-600 dark:text-zinc-300 shadow-inner">
                <div className="text-slate-400 uppercase text-[10px] tracking-wider font-black select-none mb-1">รายละเอียดใบสั่งซื้อหลักฐาน</div>
                <div className="flex justify-between items-center py-0.5">
                  <span>รหัสใบสั่งซื้อระบบ:</span>
                  <span className="font-mono font-black text-slate-900 dark:text-white bg-white dark:bg-zinc-800 border border-slate-200/60 dark:border-zinc-700/60 px-2 py-0.5 rounded-md text-xs">{currentOrder.code}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span><User className="w-3.5 h-3.5 inline mr-1 text-slate-400" /> ชื่อคู่ค้า Supplier:</span>
                  <span className="font-black text-slate-900 dark:text-white max-w-[240px] text-right truncate" title={currentOrder.supplier?.name}>{currentOrder.supplier?.name || '-'}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span><Calendar className="w-3.5 h-3.5 inline mr-1 text-slate-400" /> วันที่ออกบิลสั่งซื้อ:</span>
                  <span className="font-semibold text-slate-500 dark:text-zinc-400 font-sans">{formatDateTh(currentOrder.createdAt)}</span>
                </div>
              </div>

              {/* ส่วน Input รับค่าเลขที่ใบกำกับภาษีฝั่งขวา */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="supplierTaxInvoiceNumber"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs font-black text-slate-500"><FileText className="w-3.5 h-3.5 inline mr-1" /> เลขที่ใบกำกับภาษี</FormLabel>
                      <Input {...field} placeholder="กรอกรหัสเลขบิลภาษีคู่ค้า" className="h-10 text-sm font-bold px-3 bg-white border border-slate-200 rounded-xl focus:border-orange-500 outline-none transition-all shadow-sm" />
                      <FormMessage className="text-[11px] font-black text-rose-500" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="supplierTaxInvoiceDate"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs font-black text-slate-500"><Calendar className="w-3.5 h-3.5 inline mr-1" /> วันที่ในใบกำกับภาษี</FormLabel>
                      <Input {...field} type="date" className="h-10 text-sm font-bold px-3 bg-white border border-slate-200 rounded-xl focus:border-orange-500 outline-none transition-all shadow-sm cursor-pointer font-sans" />
                      <FormMessage className="text-[11px] font-black text-rose-500" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* กล่องกรอกวันที่รับของจริงและหมายเหตุเพิ่มเติมด้านล่าง */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-5 pt-4 border-t border-slate-100 dark:border-zinc-800">
              <FormField
                control={form.control}
                name="receivedAt"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-black text-slate-500"><Calendar className="w-3.5 h-3.5 inline mr-1" /> วันที่รับเข้าคลังจริง</FormLabel>
                    <Input {...field} type="date" className="h-10 text-sm font-bold px-3 bg-white border border-slate-200 rounded-xl focus:border-orange-500 outline-none transition-all shadow-sm cursor-pointer font-sans" />
                    <FormMessage className="text-[11px] font-black text-rose-500" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-black text-slate-500">หมายเหตุบันทึกจัดซื้อ</FormLabel>
                    <Textarea {...field} placeholder="พิมพ์หมายเหตุหรือข้อมูลกำกับเพิ่มเติม (ถ้ามี)..." className="text-sm font-medium p-3 bg-white border border-slate-200 rounded-xl focus:border-orange-500 outline-none transition-all shadow-sm h-10 min-h-[40px] resize-none" />
                    <FormMessage className="text-[11px] font-black text-rose-500" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* 📊 3. ตารางแจกแจงรายการสินค้าดีไซน์ใหม่สลักส่งค่า Reactive */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.01)] overflow-hidden">
            <POItemListForReceipt
              key={currentOrder.id}
              poId={Number(poId)}
              receiptId={receiptId}
              setReceiptId={setReceiptId}
              formData={formData}
              items={normalizedItems}
            />
          </div>

        </form>
      </Form>
    </div>
  );
};

export default CreatePurchaseOrderReceiptPage;