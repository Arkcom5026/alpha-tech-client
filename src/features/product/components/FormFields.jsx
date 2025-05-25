// src/features/product/components/FormFields.jsx

import CascadingDropdownGroup from '@/components/shared/form/CascadingDropdownGroup';

export default function FormFields({ register, errors, dropdowns, control, setValue, isEditMode = false }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <CascadingDropdownGroup
        control={control}
        register={register}
        errors={errors}
        setValue={setValue}
        dropdowns={dropdowns}
        isEditMode={isEditMode}
        onSelectionChange={(data) => console.log('🧩 selection changed:', data)}
      />

      <div>
        <label className="block font-medium mb-1">ชื่อสินค้า</label>
        <input
          type="text"
          {...register('title', { required: 'กรุณาระบุชื่อสินค้า' })}
          className="w-full p-2 border rounded"
        />
        {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
      </div>

      <div>
        <label className="block font-medium mb-1">รายละเอียดสินค้า</label>
        <textarea
          {...register('description')}
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block font-medium mb-1">รายละเอียดสเปก</label>
        <textarea
          {...register('spec')}
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block font-medium mb-1">ระยะเวลารับประกัน (เดือน)</label>
        <input
          type="number"
          {...register('warranty', { valueAsNumber: true })}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="flex items-center space-x-2">
        <input type="checkbox" {...register('noSN')} id="noSN" />
        <label htmlFor="noSN">ไม่มี Serial Number</label>
      </div>

      <div>
        <label className="block font-medium mb-1">ประเภทบาร์โค้ด</label>
        <select
          {...register('codeType')}
          className="w-full p-2 border rounded"
        >
          <option value="D">D - Default</option>
          <option value="S">S - Serial-based</option>
        </select>
      </div>

      <div className="flex items-center space-x-2">
        <input type="checkbox" {...register('active')} id="active" defaultChecked />
        <label htmlFor="active">เปิดใช้งานสินค้า</label>
      </div>

      <div>
        <label className="block font-medium mb-1">ราคาทุน</label>
        <input
          type="number"
          step="0.01"
          {...register('cost', { valueAsNumber: true })}
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block font-medium mb-1">จำนวนเริ่มต้น</label>
        <input
          type="number"
          {...register('quantity', { valueAsNumber: true })}
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block font-medium mb-1">หน่วยนับ</label>
        <select
          {...register('unit')}
          className="w-full p-2 border rounded"
        >
          <option value="">-- เลือกหน่วยนับ --</option>
          {dropdowns.units.map((unit) => (
            <option key={unit.id} value={unit.name}>
              {unit.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block font-medium mb-1">ราคาขายปลีก (ระดับ 1)</label>
        <input
          type="number"
          step="0.01"
          {...register('priceLevel1', { valueAsNumber: true })}
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block font-medium mb-1">ราคาขายส่ง (ระดับ 2)</label>
        <input
          type="number"
          step="0.01"
          {...register('priceLevel2', { valueAsNumber: true })}
          className="w-full p-2 border rounded"
        />
      </div>
    </div>
  );
}
