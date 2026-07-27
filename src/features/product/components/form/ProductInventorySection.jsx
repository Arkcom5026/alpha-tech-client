import React from 'react';
import { Controller, useWatch } from 'react-hook-form';

const ProductInventorySection = ({ control, register, setValue, errors = {} }) => {
  const mode = useWatch({ control, name: 'mode' }) || 'STRUCTURED';
  const isSimple = mode === 'SIMPLE';

  const handleModeChange = (field, value) => {
    field.onChange(value);
    if (value === 'STRUCTURED') {
      setValue('inventoryBehavior', 'TRACKED', { shouldDirty: true, shouldValidate: true });
      setValue('saleBarcode', '', { shouldDirty: true, shouldValidate: true });
    }
  };

  return (
    <section className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-4">
        <div className="font-semibold text-gray-800">⚙️ <span>พฤติกรรมสินค้าและสต๊อก</span></div>
        <div className="text-sm text-gray-500">SIMPLE ใช้แบบนับสต๊อกหรือไม่ตัดสต๊อกได้ ส่วน STRUCTURED ติดตามรายชิ้นเสมอ</div>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <label className="block">
          <span className="mb-1 block font-medium text-gray-700">โหมดสินค้า</span>
          <Controller name="mode" control={control} defaultValue="STRUCTURED" render={({ field }) => (
            <select id="product-mode" className="w-full rounded-md border p-2" value={field.value || 'STRUCTURED'} onChange={(event) => handleModeChange(field, event.target.value)}>
              <option value="STRUCTURED">STRUCTURED / แยกรายชิ้น</option>
              <option value="SIMPLE">SIMPLE / นับจำนวนหรือค่าบริการ</option>
            </select>
          )} />
        </label>
        <label className="block">
          <span className="mb-1 block font-medium text-gray-700">การจัดการสต๊อก</span>
          <Controller name="inventoryBehavior" control={control} defaultValue="TRACKED" render={({ field }) => (
            <select className="w-full rounded-md border p-2 disabled:bg-gray-100" value={isSimple ? (field.value || 'TRACKED') : 'TRACKED'} disabled={!isSimple} onChange={field.onChange}>
              <option value="TRACKED">TRACKED / ตัดสต๊อก</option>
              <option value="NON_STOCK">NON_STOCK / ไม่ตัดสต๊อก</option>
            </select>
          )} />
        </label>
        <label className="block">
          <span className="mb-1 block font-medium text-gray-700">บาร์โค้ดขายซ้ำ</span>
          <input {...register('saleBarcode')} disabled={!isSimple} placeholder="เช่น SERVICE-001" className="w-full rounded-md border p-2 disabled:bg-gray-100" />
          {errors.saleBarcode ? <p className="mt-1 text-xs text-red-600">{errors.saleBarcode.message}</p> : null}
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-gray-700">
          <input id="active" type="checkbox" className="h-4 w-4" {...register('active')} /> เปิดใช้งานสินค้า
        </label>
      </div>
    </section>
  );
};

export default ProductInventorySection;
