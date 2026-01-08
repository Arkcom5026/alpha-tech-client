




// ✅ src/features/product/components/FormFields.jsx
import React from 'react';
import { Controller, useWatch } from 'react-hook-form';
import PaymentInput from '@/components/shared/input/PaymentInput';

export default function FormFields({ register, errors, control, showInitialQty = false }) {
  // ตรวจสอบโหมดสินค้าแบบ Simple จากฟอร์ม
  const currentMode = useWatch({ control, name: 'mode' });
  const isSimple = currentMode === 'SIMPLE';

  return (
    <div>
      {/* ชื่อสินค้า */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block font-medium mb-1 text-gray-700">คำเรียกสินค้า (ชื่อเรียกสั้น)</label>
          <input
            id="name"
            type="text"
            placeholder="เช่น Y04, NV2, G102"
            {...register('name', { required: 'กรุณาระบุคำเรียกสินค้า' })}
            className="w-full p-2 border rounded-md focus:ring-blue-400 focus:border-blue-400 text-gray-800"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>

        {/* ซ่อน field `model` เพื่อป้องกันความสับสนกับ “รุ่น” (ProductProfile) ในลำดับขั้น แต่คง payload เดิมไว้ (ปล่อยว่างได้) */}
        <input type="hidden" {...register('model')} />
      </div>

      {/* ประเภทสินค้า: Simple / Template → map เป็น noSN (true/false) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        <div>
          <label htmlFor="product-mode" className="block font-medium mb-1 text-gray-700">ประเภทสินค้า</label>
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
                <option value="STRUCTURED">Template (มี SN รายชิ้น)</option>
                <option value="SIMPLE">Simple (นับสต๊อกตามจำนวน)</option>
              </select>
            )}
          />
          {/* ช่วยจำเงื่อนไขตามที่เราเพิ่งเพิ่มใน ProductForm */}
          
        </div>

        {/* จำนวนเริ่มต้น (เฉพาะ Simple) */}
        {showInitialQty && isSimple && (
          <div>
            <label htmlFor="initialQty" className="block font-medium mb-1 text-gray-700">จำนวนเริ่มต้น (รับเข้าคลัง)</label>
            <input
              id="initialQty"
              type="number"
              inputMode="numeric"
              className="w-full p-2 border rounded-md text-right focus:ring-blue-400 focus:border-blue-400 text-gray-800"
              placeholder="0"
              {...register('initialQty', { valueAsNumber: true, min: { value: 0, message: 'ต้องไม่ติดลบ' } })}
            />
            {errors.initialQty && <p className="text-red-500 text-sm mt-1">{errors.initialQty.message}</p>}
          </div>
        )}
      </div>

      {/* ราคาต่อสาขา (BranchPrice) */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mt-4 ">
        {/* ราคาทุน */}
        <div>
          <Controller
            name="branchPrice.costPrice"
            control={control}
            
            rules={{ valueAsNumber: true, min: { value: 0, message: 'ราคาทุนต้องไม่ติดลบ' } }}
            render={({ field }) => (
              <PaymentInput
                title="ราคาทุน"
                value={field.value === 0 ? '' : field.value}
                onChange={(val) => field.onChange(val === '' ? 0 : parseFloat(val))}
                color="blue"
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
            
            rules={{ valueAsNumber: true, min: { value: 0, message: 'ราคาขายส่งต้องไม่ติดลบ' } }}
            render={({ field }) => (
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
            
            rules={{ valueAsNumber: true, min: { value: 0, message: 'ราคาช่างต้องไม่ติดลบ' } }}
            render={({ field }) => (
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
            
            rules={{ valueAsNumber: true, min: { value: 0, message: 'ราคาขายปลีกต้องไม่ติดลบ' } }}
            render={({ field }) => (
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
            
            rules={{ valueAsNumber: true, min: { value: 0, message: 'ราคาออนไลน์ต้องไม่ติดลบ' } }}
            render={({ field }) => (
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
      {/* รายละเอียด */}
      <div className="mt-4">
        <label htmlFor="description" className="block font-medium mb-1 text-gray-700">รายละเอียดสินค้า</label>
        <textarea
          id="description"
          {...register('description')}
          rows={2}
          placeholder="แนะนำสินค้าโดยย่อ เช่น ขนาด น้ำหนัก ความสามารถ"
          className="w-full p-3 border rounded-md focus:ring-blue-400 focus:border-blue-400 text-gray-800"
        />
      </div>

      <div className="mt-4">
        <label htmlFor="spec" className="block font-medium mb-1 text-gray-700">รายละเอียดสเปก</label>
        <textarea
          id="spec"
          {...register('spec')}
          rows={3}
          placeholder={`รายละเอียดเชิงเทคนิค เช่น CPU, RAM, ความจุ, จอภาพ`}
          className="w-full p-3 border rounded-md font-mono focus:ring-blue-400 focus:border-blue-400 text-gray-800"
        />
      </div>

      {/* เปิดใช้งานสินค้า */}
      <div className="flex items-center space-x-2 p-2 mt-4">
        <input type="checkbox" {...register('active')} id="active" defaultChecked className="form-checkbox h-5 w-5 text-blue-600 rounded" />
        <label htmlFor="active" className="text-gray-700">เปิดใช้งานสินค้า</label>
      </div>
    </div>
  );
}



