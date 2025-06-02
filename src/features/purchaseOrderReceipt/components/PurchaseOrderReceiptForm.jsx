import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { purchaseOrderReceiptSchema } from '../schema/poReceiptSchema';

const PurchaseOrderReceiptForm = ({ onSubmit, defaultValues = {}, poOptions = [] }) => {
  const today = new Date().toISOString().split('T')[0];

  const form = useForm({
    resolver: zodResolver(purchaseOrderReceiptSchema),
    defaultValues: {
      purchaseOrderId: defaultValues.purchaseOrderId || '',
      receivedAt: defaultValues.receivedAt || '',
      note: defaultValues.note || '',
    },
  });

  // ตั้งค่า receivedAt เป็นวันปัจจุบันเมื่อโหลดครั้งแรก (ถ้าไม่มี)
  useEffect(() => {
    if (!form.getValues('receivedAt')) {
      form.setValue('receivedAt', today);
    }
  }, [form, today]);

  const handleSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="purchaseOrderId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>เลือกใบสั่งซื้อ (PO)</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ''}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกใบสั่งซื้อ" />
                </SelectTrigger>
                <SelectContent>
                  {poOptions.map((po) => (
                    <SelectItem key={po.id} value={String(po.id)}>
                      #{po.id} - {po.supplier?.name || 'ไม่มีชื่อผู้ขาย'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="receivedAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>วันที่รับของ</FormLabel>
              <Input type="date" {...field} />
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
              <Textarea placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)" {...field} />
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-4">
          <Button type="submit">บันทึกใบรับสินค้า</Button>
        </div>
      </form>
    </Form>
  );
};

export default PurchaseOrderReceiptForm;
