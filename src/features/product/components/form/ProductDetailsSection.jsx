import React from 'react';

const ProductDetailsSection = ({ register, errors = {} }) => {
  return (
    <section className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-4">
        <div className="font-semibold text-gray-800 flex items-center gap-2">
          📝 <span>รายละเอียดเพิ่มเติม</span>
        </div>
        <div className="text-sm text-gray-500">
          ไม่บังคับ ใช้สำหรับข้อมูลสินค้า รายละเอียดเชิงเทคนิค และเงื่อนไขรับประกัน
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="warrantyDays" className="block font-medium mb-1 text-gray-700">
            ระยะรับประกัน (วัน)
          </label>
          <input
            id="warrantyDays"
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            {...register('warrantyDays', {
              validate: (value) => {
                if (value === '' || value === null || value === undefined) return true;
                const n = Number(value);
                if (!Number.isInteger(n)) return 'ระยะรับประกันต้องเป็นจำนวนเต็ม';
                if (n < 0) return 'ระยะรับประกันต้องไม่น้อยกว่า 0 วัน';
                return true;
              },
            })}
            placeholder="เช่น 365"
            className="w-full p-3 border rounded-md focus:ring-blue-400 focus:border-blue-400 text-gray-800"
          />
          {errors?.warrantyDays && (
            <div className="mt-1 text-sm text-red-600">{errors.warrantyDays.message}</div>
          )}
          <div className="mt-1 text-xs text-gray-500">
            เว้นว่างได้ หากสินค้าไม่มีการกำหนดระยะรับประกัน
          </div>
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="description" className="block font-medium mb-1 text-gray-700">
          รายละเอียดสินค้า
        </label>
        <textarea
          id="description"
          {...register('description')}
          rows={2}
          placeholder="แนะนำสินค้าโดยย่อ เช่น ขนาด น้ำหนัก ความสามารถ"
          className="w-full p-3 border rounded-md focus:ring-blue-400 focus:border-blue-400 text-gray-800"
        />
      </div>

      <div className="mt-4">
        <label htmlFor="spec" className="block font-medium mb-1 text-gray-700">
          รายละเอียดสเปก
        </label>
        <textarea
          id="spec"
          {...register('spec')}
          rows={3}
          placeholder="รายละเอียดเชิงเทคนิค เช่น CPU, RAM, ความจุ, จอภาพ"
          className="w-full p-3 border rounded-md font-mono focus:ring-blue-400 focus:border-blue-400 text-gray-800"
        />
      </div>
    </section>
  );
};

export default ProductDetailsSection;
