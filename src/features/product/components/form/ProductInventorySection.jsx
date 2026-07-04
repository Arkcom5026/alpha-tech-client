import React from 'react';
import { Controller } from 'react-hook-form';

const ProductInventorySection = ({ control, register }) => {
  return (
    <section className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-4">
        <div className="font-semibold text-gray-800 flex items-center gap-2">
          ⚙️ <span>Stock Behavior</span>
        </div>
        <div className="text-sm text-gray-500">
          กำหนดพฤติกรรมสต๊อกของสินค้า ไม่ใช่ตัวตนของสินค้า
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="product-mode" className="block font-medium mb-1 text-gray-700">
            โหมดสต๊อกสินค้า
          </label>
          <Controller
            name="mode"
            control={control}
            defaultValue="STRUCTURED"
            render={({ field }) => (
              <select
                id="product-mode"
                className="w-full p-2 border rounded-md focus:ring-blue-400 focus:border-blue-400 text-gray-800"
                value={field.value || 'STRUCTURED'}
                onChange={(e) => field.onChange(e.target.value)}
              >
                <option value="STRUCTURED">STRUCTURED / แยกรายชิ้น</option>
                <option value="SIMPLE">SIMPLE / นับจำนวน</option>
              </select>
            )}
          />
          <div className="mt-1 text-xs text-gray-500">
            * ค่าเริ่มต้นเป็น STRUCTURED ตามโครงสร้างสินค้าปัจจุบัน
          </div>
        </div>

        <div className="flex items-end">
          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input id="active" type="checkbox" className="h-4 w-4" {...register('active')} />
            เปิดใช้งานสินค้า
          </label>
        </div>
      </div>
    </section>
  );
};

export default ProductInventorySection;
