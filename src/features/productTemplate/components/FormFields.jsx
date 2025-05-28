// ✅ src/features/productTemplate/components/FormFields.jsx
import React from 'react';
import { useFormContext } from 'react-hook-form';

const FormFields = ({ profiles, units }) => {
  const { register } = useFormContext();

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <label className="font-medium md:col-span-1">ชื่อสินค้า</label>
        <input {...register('name')} className="input md:col-span-3 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-zinc-800 text-black dark:text-white" placeholder="เช่น Asus Vivobook" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <label className="font-medium md:col-span-1">รายละเอียดสินค้า</label>
        <input {...register('description')} className="input md:col-span-3 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-zinc-800 text-black dark:text-white" placeholder="เช่น รายละเอียดสินค้าทั่วไป" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <label className="font-medium md:col-span-1">หน่วย</label>
        <select {...register('unitId')} className="form-select w-full border px-3 py-2 rounded">
          <option value="">-- เลือกหน่วยนับ --</option>
          {units.map((u) => (
            <option key={u.id} value={String(u.id)}>{u.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <label className="font-medium md:col-span-1">สเปค</label>
        <input {...register('spec')} className="input md:col-span-3 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-zinc-800 text-black dark:text-white" placeholder="รายละเอียดทางเทคนิค" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <label className="font-medium md:col-span-1">ลักษณะสินค้า</label>
        <select {...register('productProfileId')} className="form-select w-full border px-3 py-2 rounded">
          <option value="">-- เลือกคุณสมบัติ --</option>
          {profiles.map((p) => (
            <option key={p.id} value={String(p.id)}>{p.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <label className="font-medium md:col-span-1">มี Serial Number หรือไม่</label>
        <input type="checkbox" {...register('noSN')} className="md:col-span-3 h-5 w-5" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <label className="font-medium md:col-span-1">ประเภทโค้ดสินค้า</label>
        <select {...register('codeType')} className="input md:col-span-3 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-zinc-800 text-black dark:text-white">
          <option value="D">Default</option>
          <option value="S">Serial</option>
          <option value="C">Custom</option>
        </select>
      </div>
    </>
  );
};

export default FormFields;

