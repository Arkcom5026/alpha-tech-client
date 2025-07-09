// src/features/product/components/FormFields.jsx
import React from 'react';
import { Controller } from 'react-hook-form'; // Import Controller
import PaymentInput from '@/components/shared/input/PaymentInput'; // Import PaymentInput

export default function FormFields({ register, errors, dropdowns, control, setValue, isEditMode }) {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div>
          <label className="block font-medium mb-1 text-gray-700">ชื่อสินค้า</label>
          <input
            type="text"
            {...register('name', { required: 'กรุณาระบุชื่อสินค้า' })}
            className="w-full p-2 border rounded-md focus:ring-blue-400 focus:border-blue-400 text-gray-800"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block font-medium mb-1 text-gray-700">รุ่นสินค้า</label>
          <input
            type="text"
            {...register('model')}
            className="w-full p-2 border rounded-md focus:ring-blue-400 focus:border-blue-400 text-gray-800"
            placeholder="เช่น K617, NKM637, A32-B"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mt-4 ">

        {/* ราคาทุน */}
        <div>
          <Controller
            name="branchPrice.costPrice"
            control={control}
            defaultValue={0} // กำหนดค่าเริ่มต้น
            rules={{ valueAsNumber: true, min: { value: 0, message: 'ราคาทุนต้องไม่ติดลบ' } }}
            render={({ field, fieldState }) => (
              <PaymentInput
                title="ราคาทุน"
                value={field.value === 0 ? '' : field.value} // แสดงค่าว่างถ้าเป็น 0
                onChange={(val) => field.onChange(val === '' ? 0 : parseFloat(val))} // แปลงเป็นตัวเลขหรือ 0
                color="blue" // กำหนดสี
              />
            )}
          />
          {errors.branchPrice?.costPrice && <p className="text-red-500 text-sm mt-1">{errors.branchPrice.costPrice.message}</p>}
        </div>

        {/* ราคาขายส่ง (POS) */}
        <div>
          <Controller
            name="branchPrice.priceWholesale"
            control={control}
            defaultValue={0}
            rules={{ valueAsNumber: true, min: { value: 0, message: 'ราคาขายส่งต้องไม่ติดลบ' } }}
            render={({ field, fieldState }) => (
              <PaymentInput
                title="ราคาขายส่ง"
                value={field.value === 0 ? '' : field.value}
                onChange={(val) => field.onChange(val === '' ? 0 : parseFloat(val))}
                color="blue"
              />
            )}
          />
          {errors.branchPrice?.priceWholesale && <p className="text-red-500 text-sm mt-1">{errors.branchPrice.priceWholesale.message}</p>}
        </div>

        {/* ราคาช่าง (POS) */}
        <div>
          <Controller
            name="branchPrice.priceTechnician"
            control={control}
            defaultValue={0}
            rules={{ valueAsNumber: true, min: { value: 0, message: 'ราคาช่างต้องไม่ติดลบ' } }}
            render={({ field, fieldState }) => (
              <PaymentInput
                title="ราคาช่าง"
                value={field.value === 0 ? '' : field.value}
                onChange={(val) => field.onChange(val === '' ? 0 : parseFloat(val))}
                color="blue"
              />
            )}
          />
          {errors.branchPrice?.priceTechnician && <p className="text-red-500 text-sm mt-1">{errors.branchPrice.priceTechnician.message}</p>}
        </div>

        {/* ราคาขายปลีก (POS) */}
        <div>
          <Controller
            name="branchPrice.priceRetail"
            control={control}
            defaultValue={0}
            rules={{ valueAsNumber: true, min: { value: 0, message: 'ราคาขายปลีกต้องไม่ติดลบ' } }}
            render={({ field, fieldState }) => (
              <PaymentInput
                title="ราคาขายปลีก"
                value={field.value === 0 ? '' : field.value}
                onChange={(val) => field.onChange(val === '' ? 0 : parseFloat(val))}
                color="blue"
              />
            )}
          />
          {errors.branchPrice?.priceRetail && <p className="text-red-500 text-sm mt-1">{errors.branchPrice.priceRetail.message}</p>}
        </div>

        {/* ราคาออนไลน์ */}
        <div>
          <Controller
            name="branchPrice.priceOnline"
            control={control}
            defaultValue={0}
            rules={{ valueAsNumber: true, min: { value: 0, message: 'ราคาออนไลน์ต้องไม่ติดลบ' } }}
            render={({ field, fieldState }) => (
              <PaymentInput
                title="ราคาออนไลน์"
                value={field.value === 0 ? '' : field.value}
                onChange={(val) => field.onChange(val === '' ? 0 : parseFloat(val))}
                color="blue"
              />
            )}
          />
          {errors.branchPrice?.priceOnline && <p className="text-red-500 text-sm mt-1">{errors.branchPrice.priceOnline.message}</p>}
        </div>

      </div>

      <div className="mt-4">
        <label className="block font-medium mb-1 text-gray-700">รายละเอียดสินค้า</label>
        <textarea
          {...register('description')}
          rows={2}
          placeholder="แนะนำสินค้าโดยย่อ เช่น ขนาด น้ำหนัก ความสามารถ"
          className="w-full p-3 border rounded-md focus:ring-blue-400 focus:border-blue-400 text-gray-800"
        />
      </div>

      <div className="mt-4">
        <label className="block font-medium mb-1 text-gray-700">รายละเอียดสเปก</label>
        <textarea
          {...register('spec')}
          rows={3}
          placeholder={`รายละเอียดเชิงเทคนิค เช่น CPU, RAM, ความจุ, จอภาพ`}
          className="w-full p-3 border rounded-md font-mono focus:ring-blue-400 focus:border-blue-400 text-gray-800"
        />
      </div>
      <div className="flex items-center space-x-2 p-2 mt-4">
          <input type="checkbox" {...register('active')} id="active" defaultChecked className="form-checkbox h-5 w-5 text-blue-600 rounded" />
          <label htmlFor="active" className="text-gray-700">เปิดใช้งานสินค้า</label>          
        </div>

    </div>
  );
}
