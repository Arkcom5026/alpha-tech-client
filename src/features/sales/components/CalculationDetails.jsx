// CalculationDetails.jsx (New Component)
import PaymentInput from '@/components/shared/input/PaymentInput';
import React from 'react';
import PropTypes from 'prop-types';

const fmt = (n) => Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const preventInvalidNumberKeys = (e) => { if (["e","E","+","-"].includes(e.key)) e.preventDefault(); };

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
  disabled = false,
}) => {
  // normalize numbers
  const totalOriginal = Number(totalOriginalPrice) || 0;
  const totalDiscOnly = Number(totalDiscountOnly) || 0;
  const billDisc = Number(billDiscount) || 0;
  const totalDisc = Number(totalDiscount) || 0;
  const net = Number(priceBeforeVat) || 0;
  const vat = Number(vatAmount) || 0;
  const depositTotal = Number(customerDepositAmount) || 0;
  const depositVal = Number(depositUsed) || 0;
  const remainDeposit = Math.max(0, depositTotal - depositVal);
  const billOver = billDisc > totalOriginal;

  return (
    <div className="flex-1 min-w-[350px] max-w-[400px] bg-slate-50 p-4 rounded-xl space-y-2 shadow-sm border border-slate-100">    
     
      <div className="flex justify-between px-2 py-1 text-lg text-gray-700">
        <span>ยอดรวมราคาสินค้า</span>
        <span className="font-semibold">{fmt(totalOriginal)} ฿</span>
      </div>
      <div className="flex justify-between px-4 text-base text-orange-700">
        <span>ส่วนลดต่อรายการ</span>
        <span className="font-medium">{fmt(totalDiscOnly)} ฿</span>
      </div>

      <div className="flex justify-between items-center gap-2 px-4 text-base text-orange-700">
        <span>ส่วนลดท้ายบิล</span>
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          className={`w-[120px] h-[45px] border rounded-md px-2 text-lg text-right focus:ring-2 shadow-sm ${billOver ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-orange-400'}`}
          placeholder="0.00"
          value={billDisc === 0 ? '' : (Number.isFinite(billDisc) ? billDisc : '')}
          onChange={(e) => setBillDiscount(e)}
          onKeyDown={preventInvalidNumberKeys}
          onWheel={(e) => e.currentTarget.blur()}
          disabled={disabled}
        />
      </div>

      {billOver && (
        <div className="text-red-600 text-sm mt-1 text-right px-2">
          ⚠️ ส่วนลดท้ายบิลห้ามเกินยอดรวมสินค้า ({fmt(totalOriginal)} ฿)
        </div>
      )}

      <div className="flex justify-between px-4 text-base text-orange-700">
        <span>รวมส่วนลดทั้งหมด</span>
        <span className="font-medium">{fmt(totalDisc)} ฿</span>
      </div>
      <hr className="border-gray-200" />
      <div className="flex justify-between text-lg px-2 py-2 text-gray-700">
        <span>ยอดก่อนภาษี (Net)</span>
        <span className="font-semibold">{fmt(net)} ฿</span>
      </div>
      <div className="flex justify-between text-base px-2 text-red-600">
        <span>Vat 7%</span>
        <span className="font-medium">{fmt(vat)} ฿</span>
      </div>
      <hr className="border-gray-200" />

      {depositTotal > 0 && (
        <>
          <div className="flex justify-between items-center px-2 py-1">
            {/* เปลี่ยน input สำหรับ "ใช้มัดจำ" เป็น PaymentInput */}
            <PaymentInput
              title="ใช้มัดจำ"
              value={depositUsed}
              onChange={(val) => handleDepositUsedChange(Math.max(0, Math.min(Number(val) || 0, depositTotal)))}
              placeholder="0.00"
              color="blue"
            />
          </div>

          <div className="flex justify-between px-2 pt-1 text-blue-700 text-lg">
            <span>มัดจำคงเหลือ:</span>
            <span className="font-bold text-blue-600">{fmt(remainDeposit)} ฿</span>
          </div>
          <hr className="border-gray-200" />
        </>
      )}
    </div>
  );
};

CalculationDetails.propTypes = {
  totalOriginalPrice: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  totalDiscountOnly: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  billDiscount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  setBillDiscount: PropTypes.func.isRequired,
  totalDiscount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  priceBeforeVat: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  vatAmount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  customerDepositAmount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  depositUsed: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  handleDepositUsedChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default CalculationDetails;




