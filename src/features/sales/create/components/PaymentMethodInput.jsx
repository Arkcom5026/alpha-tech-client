// src/features/sales/components/PaymentMethodInput.jsx
// 🏛️ Premium Next-Gen POS Payment Method Input: (Production Hardened & Fully Synchronized Edition)

import React from 'react';

const preventInvalidNumberKeys = (e) => {
  if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
};

const moneyValue = (v) => {
  if (v === null || v === undefined) return '';
  const s = String(v).trim();
  if (s === '' || s === '0' || s === '0.0' || s === '0.00') return '';
  return v;
};

const PaymentMethodInput = ({
  cash = '',
  transfer = '',
  credit = '',
  onCashChange,
  onTransferChange,
  onCreditChange,
  cardRef = '',
  onCardRefChange,
  disabled = false,
}) => {
  return (
    <div className="w-full grid grid-cols-1 gap-2.5 text-xs font-black text-slate-700 animate-fadeIn">
      
      {/* เลนเงินสดชำระหน้าร้าน */}
      <div className="grid grid-cols-12 items-center gap-2 border-b border-slate-100 pb-2">
        <label className="col-span-4 font-black text-slate-800 pl-1">💰 เงินสดรับมา</label>
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          className="col-span-8 h-8 border border-slate-200 rounded-lg px-2.5 text-right font-mono font-black text-emerald-700 bg-slate-50/50 focus:bg-white focus:border-slate-900 outline-none shadow-sm transition-all"
          placeholder="0.00"
          value={moneyValue(cash)}
          onChange={onCashChange}
          onFocus={(e) => e.target.select?.()}
          onKeyDown={preventInvalidNumberKeys}
          onWheel={(e) => e.currentTarget.blur()}
          disabled={disabled}
        />
      </div>

      {/* เลนเงินโอนธนาคารสแกน QR */}
      <div className="grid grid-cols-12 items-center gap-2 border-b border-slate-100 pb-2">
        <label className="col-span-4 font-black text-slate-800 pl-1">📱 ยอดเงินโอน</label>
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          className="col-span-8 h-8 border border-slate-200 rounded-lg px-2.5 text-right font-mono font-black text-sky-700 bg-slate-50/50 focus:bg-white focus:border-slate-900 outline-none shadow-sm transition-all"
          placeholder="0.00"
          value={moneyValue(transfer)}
          onChange={onTransferChange}
          onFocus={(e) => e.target.select()}
          onKeyDown={preventInvalidNumberKeys}
          onWheel={(e) => e.currentTarget.blur()}
          disabled={disabled}
        />
      </div>

      {/* เลนรูดตัดผ่านอุปกรณ์บัตรเครดิต */}
      <div className="grid grid-cols-12 items-center gap-2 border-b border-slate-100 pb-2">
        <label className="col-span-4 font-black text-slate-800 pl-1">💳 บัตรเครดิต</label>
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          className="col-span-8 h-8 border border-slate-200 rounded-lg px-2.5 text-right font-mono font-black text-amber-700 bg-slate-50/50 focus:bg-white focus:border-slate-900 outline-none shadow-sm transition-all"
          placeholder="0.00"
          value={moneyValue(credit)}
          onChange={onCreditChange}
          onFocus={(e) => e.target.select()}
          onKeyDown={preventInvalidNumberKeys}
          onWheel={(e) => e.currentTarget.blur()}
          disabled={disabled}
        />
      </div>

      {/* ฟิลด์เลขอ้างอิงสลิปที่จะกางออกเมื่อยอดเครดิตมากกว่าศูนย์ */}
      {(Number(credit) > 0 || String(cardRef).trim().length > 0) && (
        <div className="animate-fadeIn pt-0.5">
          <input
            type="text"
            className="w-full h-8 border border-amber-300 rounded-lg px-2.5 text-right font-mono font-black text-slate-900 bg-white focus:border-slate-900 outline-none shadow-sm text-xs"
            placeholder="กรอกเลขอ้างอิงสลิปรูดบัตร (EDC Ref)..."
            value={cardRef || ''}
            onChange={onCardRefChange}
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
};

export default PaymentMethodInput;