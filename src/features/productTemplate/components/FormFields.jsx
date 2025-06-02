// ✅ src/features/productTemplate/components/FormFields.jsx
import React from 'react';
import { useFormContext } from 'react-hook-form';

const FormFields = ({ profiles, units }) => {
  const { register } = useFormContext();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <label className="font-medium md:col-span-1">ชื่อสินค้า</label>
        <input {...register('name')} className="input md:col-span-3 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-zinc-800 text-black dark:text-white" placeholder="เช่น Asus Vivobook" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <label className="font-medium md:col-span-1">รายละเอียดสินค้า</label>
        <textarea {...register('description')} rows={3} className="input md:col-span-3 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-zinc-800 text-black dark:text-white" placeholder="รายละเอียดสินค้าทั่วไป เช่น ขนาด น้ำหนัก ความสามารถ" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <label className="font-medium md:col-span-1">หน่วย</label>
        <select {...register('unitId')} className="form-select md:col-span-3 w-full border px-3 py-2 rounded">
          <option value="">-- เลือกหน่วยนับ --</option>
          {units.map((u) => (
            <option key={u.id} value={String(u.id)}>{u.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <label className="font-medium md:col-span-1">สเปค (Spec)</label>
        <textarea {...register('spec')} rows={3} className="input md:col-span-3 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-zinc-800 text-black dark:text-white" placeholder="รายละเอียดทางเทคนิค เช่น CPU, RAM, ความจุ, จอภาพ" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <label className="font-medium md:col-span-1">ลักษณะสินค้า</label>
        <select {...register('productProfileId')} className="form-select md:col-span-3 w-full border px-3 py-2 rounded">
          <option value="">-- เลือกลักษณะสินค้า --</option>
          {profiles.map((p) => (
            <option key={p.id} value={String(p.id)}>{p.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <label className="font-medium md:col-span-1">มี Serial Number หรือไม่</label>
        <div className="md:col-span-3">
          <input type="checkbox" {...register('noSN')} className="h-5 w-5" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <label className="font-medium md:col-span-1">ประเภทโค้ดสินค้า</label>
        <select {...register('codeType')} className="form-select md:col-span-3 w-full border px-3 py-2 rounded">
          <option value="D">Default</option>
          <option value="S">Serial</option>
          <option value="C">Custom</option>
        </select>
      </div>
    </div>
  );
};

export default FormFields;
