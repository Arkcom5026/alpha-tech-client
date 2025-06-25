// src/features/product/components/FormFields.jsx

export default function FormFields({ register, errors, dropdowns, control, setValue, isEditMode }) {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div>
          <label className="block font-medium mb-1">ชื่อสินค้า</label>
          <input
            type="text"
            {...register('name', { required: 'กรุณาระบุชื่อสินค้า' })}
            className="w-full p-2 border rounded"
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block font-medium mb-1">รุ่นสินค้า</label>
          <input
            type="text"
            {...register('model')}
            className="w-full p-2 border rounded"
            placeholder="เช่น K617, NKM637, A32-B"
          />
        </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mt-4 ">

        <div>
          <label className="block font-medium mb-1">ราคาทุน</label>
          <input
            type="number"
            step="0.01"
            {...register('branchPrice.costPrice', { valueAsNumber: true })}
            className="w-full p-2 border rounded text-right"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">ราคาขายส่ง (POS)</label>
          <input
            type="number"
            step="0.01"
            {...register('branchPrice.priceWholesale', { valueAsNumber: true })}
            className="w-full p-2 border rounded text-right"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">ราคาช่าง (POS)</label>
          <input
            type="number"
            step="0.01"
            {...register('branchPrice.priceTechnician', { valueAsNumber: true })}
            className="w-full p-2 border rounded text-right"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">ราคาขายปลีก (POS)</label>
          <input
            type="number"
            step="0.01"
            {...register('branchPrice.priceRetail', { valueAsNumber: true })}
            className="w-full p-2 border rounded text-right"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">ราคาออนไลน์</label>
          <input
            type="number"
            step="0.01"
            {...register('branchPrice.priceOnline', { valueAsNumber: true })}
            className="w-full p-2 border rounded text-right"
          />
        </div>



      </div>

      <div className="mt-4">
        <label className="block font-medium mb-1">รายละเอียดสินค้า</label>
        <textarea
          {...register('description')}
          rows={2}
          placeholder="แนะนำสินค้าโดยย่อ เช่น ขนาด น้ำหนัก ความสามารถ"
          className="w-full p-3 border rounded"
        />
      </div>

      <div className="mt-4">
        <label className="block font-medium mb-1">รายละเอียดสเปก</label>
        <textarea
          {...register('spec')}
          rows={3}
          placeholder={`รายละเอียดเชิงเทคนิค เช่น CPU, RAM, ความจุ, จอภาพ`}
          className="w-full p-3 border rounded font-mono"
        />
      </div>
      <div className="flex items-center space-x-2  p-2">
          <input type="checkbox" {...register('active')} id="active" defaultChecked />
          <label htmlFor="active"> เปิดใช้งานสินค้า</label>          
        </div>

    </div>
  );
}
