// ✅ StockItemForm.jsx — ฟอร์มสำหรับยิง SN เข้าสต๊อก

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const StockItemForm = ({ onSubmit, defaultValues = {} }) => {
  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues,
  });

  const [barcodeGenerated, setBarcodeGenerated] = useState('');

  const generateBarcode = () => {
    const timestamp = Date.now();
    const random = Math.floor(1000 + Math.random() * 9000);
    const barcode = `B${timestamp}${random}`;
    setValue('barcode', barcode);
    setBarcodeGenerated(barcode);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="barcode">บาร์โค้ด</Label>
        <div className="flex gap-2">
          <Input id="barcode" {...register('barcode', { required: true })} readOnly />
          <Button type="button" onClick={generateBarcode} variant="outline">
            สร้างบาร์โค้ดใหม่
          </Button>
        </div>
        {errors.barcode && <p className="text-red-500 text-sm">จำเป็นต้องใส่บาร์โค้ด</p>}
        {barcodeGenerated && <p className="text-sm text-green-600">✅ สร้างแล้ว: {barcodeGenerated}</p>}
      </div>

      <div>
        <Label htmlFor="serialNumber">Serial Number</Label>
        <Input id="serialNumber" {...register('serialNumber')} />
      </div>

      <div>
        <Label htmlFor="buyPrice">ราคาทุน</Label>
        <Input
          id="buyPrice"
          type="number"
          step="0.01"
          {...register('buyPrice', { required: true })}
        />
        {errors.buyPrice && <p className="text-red-500 text-sm">ต้องระบุราคาทุน</p>}
      </div>

      <div>
        <Label htmlFor="sellPrice">ราคาขาย (เริ่มต้น)</Label>
        <Input id="sellPrice" type="number" step="0.01" {...register('sellPrice')} />
      </div>

      <div>
        <Label htmlFor="warrantyDays">ประกัน (วัน)</Label>
        <Input id="warrantyDays" type="number" {...register('warrantyDays')} />
      </div>

      <div>
        <Label htmlFor="remark">หมายเหตุ</Label>
        <Input id="remark" {...register('remark')} />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก SN เข้าสต๊อก'}
      </Button>
    </form>
  );
};

export default StockItemForm;
