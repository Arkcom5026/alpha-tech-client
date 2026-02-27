// CreatePurchaseOrderReceiptPage.jsx

import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import POItemListForReceipt from '@/features/purchaseOrderReceipt/components/POItemListForReceipt';
import usePurchaseOrderReceiptStore from '@/features/purchaseOrderReceipt/store/purchaseOrderReceiptStore';

import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

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

  const { poId } = useParams();

  const {
    currentOrder,
    loading,
    error,
    loadOrderByIdAction,
    loadOrderById,
    clearErrorAction, // (ถ้ามีใน store จะใช้, ถ้าไม่มีไม่พัง)
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

  // ✅ Keep formData reactive (avoid passing a stale snapshot)
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
      fn?.(Number(poId));
    } catch (err) {
      console.error('📛 loadOrderById error:', err);
    }
  };

  useEffect(() => {
    if (poId) {
      doLoadOrder();
      // ✅ reset receiptId when switching PO
      setReceiptId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poId, loadOrderByIdAction, loadOrderById]);

  if (loading && !currentOrder) {
    return <p className="p-4">📭 กำลังโหลดข้อมูลใบสั่งซื้อ...</p>;
  }

  if (error && !currentOrder) {
    return (
      <div className="p-4 space-y-3">
        <div className="border border-red-200 bg-red-50 text-red-700 rounded p-3">
          <div className="font-semibold">โหลดข้อมูลใบสั่งซื้อไม่สำเร็จ</div>
          <div className="text-sm break-words">{getErrorMessage(error)}</div>

          <div className="mt-3 flex gap-2">
            <Button type="button" variant="default" size="sm" onClick={doLoadOrder}>
              ลองโหลดใหม่
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => clearErrorAction?.()}>
              ปิดข้อความ
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentOrder) {
    return <p className="p-4">📭 ไม่พบข้อมูลใบสั่งซื้อ</p>;
  }

  return (
    <div className="p-4 w-full mx-auto">
      <h1 className="text-2xl font-bold mb-4">สร้างใบรับสินค้าจากใบสั่งซื้อ</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(() => {})}>
          <div className="bg-gray-50 border rounded p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p>
                  <strong>รหัสใบสั่งซื้อ:</strong> {currentOrder.code}
                </p>
                <p>
                  <strong>Supplier:</strong> {currentOrder.supplier?.name || '-'}
                </p>
                <p>
                  <strong>วันที่สั่งซื้อ:</strong> {formatDateTh(currentOrder.createdAt)}
                </p>
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="supplierTaxInvoiceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>เลขที่ใบกำกับภาษี</FormLabel>
                      <Input {...field} placeholder="กรอกเลขที่ใบกำกับภาษี" className="bg-white" />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="supplierTaxInvoiceDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>วันที่ในใบกำกับภาษี</FormLabel>
                      <Input {...field} type="date" className="bg-white" />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <FormField
                control={form.control}
                name="receivedAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>วันที่รับของจริง</FormLabel>
                    <Input {...field} type="date" className="bg-white" />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>หมายเหตุ</FormLabel>
                    <Textarea {...field} placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)" className="bg-white" />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="mt-8">
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







