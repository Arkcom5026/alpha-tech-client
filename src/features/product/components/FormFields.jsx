// ✅ src/features/product/components/FormFields.jsx

import { useFormContext } from 'react-hook-form';

export default function FormFields({ register, errors, dropdowns, control, setValue, isEditMode = false, productPrices = [], defaultValues }) {
  const { watch } = useFormContext();

  const unitId = String(watch('unitId') ?? '');

  return (
    <div className="space-y-8 w-full">
      {/* ข้อมูลทั่วไป */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-blue-700 border-b pb-1">ข้อมูลทั่วไป</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-medium mb-1">ชื่อสินค้า <span className="text-red-500">*</span></label>
            <input
              type="text"
              {...register('title', { required: 'กรุณาระบุชื่อสินค้า' })}
              className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-blue-400"
              placeholder="กรอกชื่อสินค้า"
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block font-medium mb-1">รายละเอียดสินค้า</label>
            <textarea
              {...register('description')}
              className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-blue-400"
              rows={3}
              placeholder="ระบุรายละเอียดสั้น ๆ เช่น สี น้ำหนัก"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-medium mb-1">รายละเอียดสเปก</label>
            <textarea
              {...register('spec')}
              className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-blue-400"
              rows={3}
              placeholder="รายละเอียดสเปก เช่น CPU, RAM, ความละเอียดจอ ฯลฯ"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">หน่วยนับ</label>
            <select
              {...register('unitId')}
              defaultValue={unitId}
              className="w-full p-2 border rounded bg-white focus:outline-none focus:ring focus:border-blue-400"
            >
              <option value="">-- เลือกหน่วยนับ --</option>
              {dropdowns.units.map((unit) => (
                <option key={unit.id} value={String(unit.id)}>
                  {unit.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* การตั้งค่าและสถานะ */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-blue-700 border-b pb-1">การตั้งค่าและสถานะ</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-medium mb-1">รับประกัน (เดือน)</label>
            <input
              type="number"
              {...register('warranty', { valueAsNumber: true })}
              className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-blue-400"
              placeholder="ระบุจำนวนเดือน"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">ราคาทุน</label>
            <input
              type="number"
              step="0.01"
              {...register('cost', { valueAsNumber: true })}
              className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-blue-400"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">จำนวนเริ่มต้น</label>
            <input
              type="number"
              {...register('quantity', { valueAsNumber: true })}
              className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-blue-400"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">ประเภทบาร์โค้ด</label>
            <select
              {...register('codeType')}
              className="w-full p-2 border rounded bg-white focus:outline-none focus:ring focus:border-blue-400"
            >
              <option value="D">D - Default</option>
              <option value="S">S - Serial-based</option>
            </select>
          </div>

          <div className="flex items-center pt-2">
            <input type="checkbox" {...register('noSN')} id="noSN" className="mr-2" />
            <label htmlFor="noSN" className="select-none">ไม่มี Serial Number</label>
          </div>

          <div className="flex items-center pt-2">
            <input type="checkbox" {...register('active')} id="active" defaultChecked className="mr-2" />
            <label htmlFor="active" className="select-none">เปิดใช้งานสินค้า</label>
          </div>
        </div>
      </div>
    </div>
  );
}
