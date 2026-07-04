import React from 'react';
import { Controller } from 'react-hook-form';

const PaymentInput = ({ title, value, onChange, disabled = false, required = false }) => {
  return (
    <div>
      <label className="block font-medium mb-1 text-gray-700">
        {title} {required ? <span className="text-red-500">*</span> : null}
      </label>
      <input
        type="number"
        className="w-full p-2 border rounded-md focus:ring-blue-400 focus:border-blue-400 text-gray-800 text-right"
        placeholder="0.00"
        step="0.01"
        min="0"
        value={value === 0 ? '' : value ?? ''}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
      />
    </div>
  );
};

const validateOptionalMoney = (value, message) => {
  if (value === '' || value == null) return true;
  const n = Number(value);
  if (!Number.isFinite(n)) return 'รูปแบบตัวเลขไม่ถูกต้อง';
  return n >= 0 || message;
};

const ProductPriceSection = ({ control, errors = {} }) => {
  return (
    <section className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-4">
        <div className="font-semibold text-gray-800 flex items-center gap-2">
          💰 <span>ราคามาตรฐาน</span>
        </div>
        <div className="text-sm text-gray-500">
          ใช้เป็นราคาเริ่มต้นของสินค้า ส่วนต้นทุนจริงรายชิ้นจะถูก Fix ตอนรับสินค้าเข้า
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div>
          <Controller
            name="branchPrice.costPrice"
            control={control}
            rules={{
              validate: (value) => validateOptionalMoney(value, 'ราคาทุนต้องไม่ติดลบ'),
            }}
            render={({ field }) => (
              <PaymentInput title="ราคาทุนอ้างอิง" value={field.value ?? ''} onChange={(value) => field.onChange(value)} />
            )}
          />
          {errors.branchPrice?.costPrice && (
            <p className="text-red-500 text-sm mt-1">{String(errors.branchPrice.costPrice.message)}</p>
          )}
        </div>

        <div>
          <Controller
            name="branchPrice.priceRetail"
            control={control}
            rules={{
              validate: (value) => {
                const n = Number(value);
                if (!Number.isFinite(n)) return 'กรุณาระบุราคาขายปลีก';
                return n > 0 || 'ราคาขายปลีกต้องมากกว่า 0';
              },
            }}
            render={({ field }) => (
              <PaymentInput title="ราคาขายปลีก" required value={field.value ?? ''} onChange={(value) => field.onChange(value)} />
            )}
          />
          {errors.branchPrice?.priceRetail && (
            <p className="text-red-500 text-sm mt-1">{String(errors.branchPrice.priceRetail.message)}</p>
          )}
        </div>

        <div>
          <Controller
            name="branchPrice.priceTechnician"
            control={control}
            rules={{
              validate: (value) => validateOptionalMoney(value, 'ราคาช่างต้องไม่ติดลบ'),
            }}
            render={({ field }) => (
              <PaymentInput title="ราคาช่าง" value={field.value ?? ''} onChange={(value) => field.onChange(value)} />
            )}
          />
          {errors.branchPrice?.priceTechnician && (
            <p className="text-red-500 text-sm mt-1">{String(errors.branchPrice.priceTechnician.message)}</p>
          )}
        </div>

        <div>
          <Controller
            name="branchPrice.priceOnline"
            control={control}
            rules={{
              validate: (value) => validateOptionalMoney(value, 'ราคาออนไลน์ต้องไม่ติดลบ'),
            }}
            render={({ field }) => (
              <PaymentInput title="ราคาออนไลน์" value={field.value ?? ''} onChange={(value) => field.onChange(value)} />
            )}
          />
          {errors.branchPrice?.priceOnline && (
            <p className="text-red-500 text-sm mt-1">{String(errors.branchPrice.priceOnline.message)}</p>
          )}
        </div>

        <div>
          <Controller
            name="branchPrice.priceWholesale"
            control={control}
            rules={{
              validate: (value) => validateOptionalMoney(value, 'ราคาขายส่งต้องไม่ติดลบ'),
            }}
            render={({ field }) => (
              <PaymentInput title="ราคาขายส่ง" value={field.value ?? ''} onChange={(value) => field.onChange(value)} />
            )}
          />
          {errors.branchPrice?.priceWholesale && (
            <p className="text-red-500 text-sm mt-1">{String(errors.branchPrice.priceWholesale.message)}</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductPriceSection;
