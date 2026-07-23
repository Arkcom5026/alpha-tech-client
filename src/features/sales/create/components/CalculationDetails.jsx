// src/features/sales/components/CalculationDetails.jsx
// 🏛️ Premium Next-Gen POS Calculation Details: (Lean Data Hierarchy Edition)

import PaymentInput from '@/components/shared/input/PaymentInput';
import React from 'react';
import PropTypes from 'prop-types';

const fmt = (n) => Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const preventInvalidNumberKeys = (e) => { if (["e","E","+","-"].includes(e.key)) e.preventDefault(); };

const CalculationDetails = ({
  totalOriginalPrice,
  totalDiscountOnly,
  billDiscount,
  setBillDiscount,
  totalDiscount,
  priceBeforeVat,
  vatAmount,
  customerDepositAmount,
  depositUsed,
  handleDepositUsedChange,
  disabled = false,
}) => {
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
    /* 🟢 [VISUAL FIXED]: ปรับเปลี่ยนสีพื้นหลังหลวม ๆ ออก และคุมโทนด้วยกรอบสีขาวพรีเมียมลีนตาความสูงสมดุล */
    <div className="flex-1 w-full space-y-2 font-semibold text-slate-600 text-[11px] sm:text-xs">
      <div className="flex justify-between items-center px-1">
        <span className="font-bold text-slate-800">ยอดรวมราคาสินค้าดิบ</span>
        <span className="font-mono font-black text-slate-900">{fmt(totalOriginal)} ฿</span>
      </div>
      <div className="flex justify-between items-center px-2 text-orange-600">
        <span>ส่วนลดสะสมต่อรายการ</span>
        <span className="font-mono font-bold">- {fmt(totalDiscOnly)} ฿</span>
      </div>

      <div className="flex justify-between items-center gap-2 px-2 text-orange-600">
        <span>ส่วนลดท้ายบิลลดหนี้</span>
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          className={`w-24 h-7 border rounded-lg px-2 text-right font-mono font-black text-slate-900 focus:border-slate-900 outline-none shadow-sm ${billOver ? 'border-rose-500 focus:ring-rose-400' : 'border-slate-200 focus:ring-slate-900'}`}
          placeholder="0.00"
          value={billDisc === 0 ? '' : (Number.isFinite(billDisc) ? billDisc : '')}
          onChange={(e) => setBillDiscount(e)}
          onKeyDown={preventInvalidNumberKeys}
          onWheel={(e) => e.currentTarget.blur()}
          disabled={disabled}
        />
      </div>

      {billOver && (
        <div className="text-rose-600 text-[10px] font-black text-right px-2 animate-pulse">
          ⚠️ ห้ามกรอกส่วนลดเกินยอดรวมสินค้า ({fmt(totalOriginal)} ฿)
        </div>
      )}

      <div className="flex justify-between items-center px-2 text-orange-700 font-bold border-b border-slate-100 pb-1.5">
        <span>รวมสิทธิ์ส่วนลดทั้งสิ้น</span>
        <span className="font-mono">- {fmt(totalDisc)} ฿</span>
      </div>
      
      <div className="flex justify-between items-center px-1 text-slate-700">
        <span>มูลค่าก่อนคิดภาษี (Net)</span>
        <span className="font-mono font-black">{fmt(net)} ฿</span>
      </div>
      <div className="flex justify-between items-center px-1 text-rose-500">
        <span>ภาษีมูลค่าเพิ่ม Vat 7%</span>
        <span className="font-mono font-bold">{fmt(vat)} ฿</span>
      </div>

      {depositTotal > 0 && (
        <div className="pt-1.5 border-t border-slate-100 space-y-1.5">
          <div className="flex justify-between items-center gap-2 px-1">
            <span className="text-blue-700 font-black">สิทธิ์หักลบเงินมัดจำ</span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              className="w-24 h-7 border border-blue-200 rounded-lg px-2 text-right font-mono font-black text-blue-900 bg-white focus:border-blue-500 outline-none text-xs shadow-sm"
              placeholder="0.00"
              value={depositVal === 0 ? '' : depositVal}
              onChange={(e) => handleDepositUsedChange(e)}
              onKeyDown={preventInvalidNumberKeys}
              onWheel={(e) => e.currentTarget.blur()}
              disabled={disabled}
            />
          </div>

          <div className="flex justify-between px-2 text-blue-700 font-bold bg-blue-50/50 p-1 rounded-md border border-blue-100/30">
            <span>วงเงินมัดจำคงเหลือประจำตัว:</span>
            <span className="font-mono font-black text-blue-600">{fmt(remainDeposit)} ฿</span>
          </div>
        </div>
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