// CalculationDetails.jsx (New Component)
import PaymentInput from '@/components/shared/input/PaymentInput';
import React from 'react';

const CalculationDetails = ({
  totalOriginalPrice,
  totalDiscountOnly,
  billDiscount,
  setBillDiscount, // นี่คือ handleBillDiscountChange ที่ถูกส่งมา
  totalDiscount,
  priceBeforeVat,
  vatAmount,
  customerDepositAmount,
  depositUsed,
  handleDepositUsedChange, // นี่คือ handleDepositUsedChange ที่ถูกส่งมา
}) => {
  const safeBillDiscount = typeof billDiscount === 'number' && !isNaN(billDiscount) ? billDiscount : 0;

  return (
    <div className="flex-1 min-w-[350px] max-w-[400px] bg-slate-50 p-4 rounded-xl space-y-2 shadow-sm border border-slate-100">
      <h2 className="text-xl font-bold text-gray-800 mb-3">รายละเอียดการคำนวณ</h2>
      <hr className="border-gray-200" />
      <div className="flex justify-between px-2 py-1 text-lg text-gray-700">
        <span>ยอดรวมราคาสินค้า</span>
        <span className="font-semibold">{totalOriginalPrice.toLocaleString()} ฿</span>
      </div>
      <div className="flex justify-between px-4 text-base text-orange-700">
        <span>ส่วนลดต่อรายการ</span>
        <span className="font-medium">{totalDiscountOnly.toLocaleString()} ฿</span>
      </div>

      <div className="flex justify-between items-center gap-2 px-4 text-base text-orange-700">
        <span>ส่วนลดท้ายบิล</span>
        <input
          type="number"
          className={`w-[120px] h-[45px] border rounded-md px-2 text-lg text-right focus:ring-2 shadow-sm ${safeBillDiscount > totalOriginalPrice ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-orange-400'}`}
          placeholder="0.00"
          value={safeBillDiscount === 0 ? '' : safeBillDiscount}
          onChange={setBillDiscount} // Pass event directly
        />
      </div>

      {safeBillDiscount > totalOriginalPrice && (
        <div className="text-red-600 text-sm mt-1 text-right px-2">
          ⚠️ ส่วนลดท้ายบิลห้ามเกินยอดรวมสินค้า ({totalOriginalPrice.toLocaleString()} ฿)
        </div>
      )}

      <div className="flex justify-between px-4 text-base text-orange-700">
        <span>รวมส่วนลดทั้งหมด</span>
        <span className="font-medium">{totalDiscount.toLocaleString()} ฿</span>
      </div>
      <hr className="border-gray-200" />
      <div className="flex justify-between text-lg px-2 py-2 text-gray-700">
        <span>ยอดก่อนภาษี (Net)</span>
        <span className="font-semibold">{priceBeforeVat.toLocaleString(undefined, { maximumFractionDigits: 2 })} ฿</span>
      </div>
      <div className="flex justify-between text-base px-2 text-red-600">
        <span>Vat 7%</span>
        <span className="font-medium">{vatAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} ฿</span>
      </div>
      <hr className="border-gray-200" />

      {customerDepositAmount > 0 && (
        <div className="flex justify-between items-center px-2 py-1">
          {/* เปลี่ยน input สำหรับ "ใช้มัดจำ" เป็น PaymentInput */}
          <PaymentInput
            title="ใช้มัดจำ"
            value={depositUsed}
            onChange={handleDepositUsedChange} // PaymentInput's onChange expects value directly
            placeholder="0.00"
            color="blue" // กำหนดสีให้เข้ากับธีม
          />
        </div>
      )}

      <div className="flex justify-between px-2 pt-1 text-blue-700 text-lg">
        <span>มัดจำคงเหลือ:</span>
        <span className="font-bold text-blue-600">{customerDepositAmount.toLocaleString()} ฿</span>
      </div>
      <hr className="border-gray-200" />
    </div>
  );
};

export default CalculationDetails;
