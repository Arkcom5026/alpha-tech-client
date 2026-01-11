
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import POItemListForReceipt from '@/features/purchaseOrderReceipt/components/POItemListForReceipt';
import usePurchaseOrderReceiptStore from '@/features/purchaseOrderReceipt/store/purchaseOrderReceiptStore';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const createReceiptSchema = z.object({
  supplierTaxInvoiceNumber: z.string().optional().nullable(),
  supplierTaxInvoiceDate: z.string().optional().nullable(),
  receivedAt: z.string().nonempty({ message: 'กรุณาระบุวันที่รับของ' }),
  note: z.string().optional().nullable(),
});

const CreatePurchaseOrderReceiptPage = () => {
  const { poId } = useParams();
  const { currentOrder, loadOrderById } = usePurchaseOrderReceiptStore();

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

  useEffect(() => {
    if (poId) {
      loadOrderById(poId);
    }
  }, [poId, loadOrderById]);

  if (!currentOrder) {
    return <p className="p-4">📭 กำลังโหลดข้อมูลใบสั่งซื้อ...</p>;
  }

  return (
    <div className="p-4 w-full mx-auto">
      <h1 className="text-2xl font-bold mb-4">สร้างใบรับสินค้าจากใบสั่งซื้อ</h1>

      <Form {...form}>
        <div className="bg-gray-50 border rounded p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p><strong>รหัสใบสั่งซื้อ:</strong> {currentOrder.code}</p>
              <p><strong>Supplier:</strong> {currentOrder.supplier?.name || '-'}</p>
              <p><strong>วันที่สั่งซื้อ:</strong> {new Date(currentOrder.createdAt).toLocaleDateString('th-TH')}</p>
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
            poId={poId}
            receiptId={receiptId}
            setReceiptId={setReceiptId}
            formData={form.getValues()}
            items={currentOrder.items} // ✨ ส่ง items มาด้วยเพื่อแสดงในตาราง
          />
        </div>
      </Form>
    </div>
  );
};

export default CreatePurchaseOrderReceiptPage;

