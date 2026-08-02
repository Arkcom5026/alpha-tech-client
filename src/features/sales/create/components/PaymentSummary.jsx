// src/features/sales/components/PaymentSummary.jsx
// 🏛️ Premium Next-Gen POS Payment Summary: (Pure High-Contrast & Premium Dark Layout Center)

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import BillPrintOptions from './BillPrintOptions';
import { PRINT_OPTION, SALE_MODE } from '../contracts/salePrintOptions';

const fmt = (n) =>
  Number(n || 0).toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const PaymentSummary = ({
  totalToPay,
  grandTotalPaid,
  safeChangeAmount,
  isConfirmEnabled,
  isSubmitting,
  onConfirm,
  paymentError,
  recovery,
  retryingExistingCommand = false,
  saleOption,
  setSaleOption,
  currentSaleMode,
  setCurrentSaleMode,
  hasValidCustomerId = false,
  onSaveHeldCart,
}) => {
  const totalNum = Number(totalToPay) || 0;
  const paidNum = Number(grandTotalPaid) || 0;
  const changeNum = Number(safeChangeAmount) || 0;
  const receivedNum = Number((paidNum + Math.max(0, changeNum)).toFixed(2));

  const isCash = currentSaleMode === SALE_MODE.CASH;
  const isCredit = currentSaleMode === SALE_MODE.CREDIT;

  useEffect(() => {
    if (isCredit && saleOption !== PRINT_OPTION.DELIVERY_NOTE) {
      setSaleOption(PRINT_OPTION.DELIVERY_NOTE);
      return;
    }
    if (isCash && saleOption === PRINT_OPTION.NONE) {
      setSaleOption(PRINT_OPTION.RECEIPT);
    }
  }, [isCredit, isCash, saleOption, setSaleOption]);

  const changeClass =
    changeNum > 0 ? 'text-emerald-600 font-black' : changeNum < 0 ? 'text-rose-600 font-black' : 'text-slate-600 font-bold';

  const commandSuffix = recovery?.commandId ? recovery.commandId.slice(-8) : '';

  return (
    <div className="flex-1 w-full flex flex-col justify-between gap-3 text-xs font-bold text-slate-600">
      <div className="space-y-2">
        {isCash ? (
          <div className="space-y-1.5 border-b border-slate-100 pb-2">
            <div className="flex justify-between items-center bg-slate-900 text-white p-2 rounded-xl shadow-inner select-none">
              <span className="text-[11px] font-black tracking-wide uppercase opacity-70">ยอดสุทธิที่ต้องชำระ</span>
              <span data-testid="pos-sale-total-due" className="font-mono text-lg font-black text-teal-400">฿{fmt(totalNum)}</span>
            </div>

            <div className="flex justify-between items-center px-1 pt-1">
              <span className="text-slate-800 font-black">รวมยอดเงินที่รับจริง</span>
              <span className={`font-mono font-black ${receivedNum >= totalNum ? 'text-emerald-600' : 'text-rose-600'}`}>
                ฿{fmt(receivedNum)}
              </span>
            </div>

            <div className="flex justify-between items-center px-1">
              <span className="text-slate-800 font-black">มูลค่าเงินทอนหน้าร้าน</span>
              <span className={`font-mono ${changeClass}`}>฿{fmt(changeNum)}</span>
            </div>
          </div>
        ) : (
          <div className="space-y-1.5 border-b border-slate-100 pb-2">
            <div className="bg-slate-950 text-white p-2 rounded-xl text-center shadow-inner select-none">
              <p className="text-[11px] font-black tracking-wide uppercase text-amber-400">โหมดเครดิตค้างชำระ / หน่วยงาน</p>
            </div>

            <div className="space-y-1 pt-1 text-[11px]">
              <div className="flex justify-between items-center px-1">
                <span>ยอดมูลค่ารวมบิล (รวม VAT):</span>
                <span className="font-mono font-bold text-slate-900">฿{fmt(totalNum)}</span>
              </div>
              <div className="flex justify-between items-center px-1 text-emerald-600">
                <span>ยอดเงินมัดจำล่วงหน้าที่ใช้หักลอย:</span>
                <span className="font-mono font-bold">฿{fmt(paidNum)}</span>
              </div>
              {(() => {
                const outstanding = Math.max(0, Number((totalNum - paidNum).toFixed(2)));
                return (
                  <div className="flex justify-between items-center pt-1.5 border-t border-dashed border-slate-100 px-1 font-black text-xs">
                    <span className="text-slate-900">ยอดค้างบัญชีเครดิตยกยอด:</span>
                    <span className={`font-mono ${outstanding > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>฿{fmt(outstanding)}</span>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>

      {recovery?.state === 'UNCERTAIN' && (
        <div className="bg-amber-50 border border-amber-300 text-amber-800 p-2.5 rounded-xl text-[11px] font-black animate-slideUp space-y-1">
          <div>⏳ ผลการบันทึกยังไม่แน่นอน ระบบจะตรวจสอบด้วยคำสั่งเดิม</div>
          {commandSuffix && <div className="font-mono text-[10px] opacity-75">คำสั่ง …{commandSuffix}</div>}
          <div className="text-[10px] font-bold">ห้ามล้างตะกร้าหรือสร้างรายการใหม่จนกว่าจะยืนยันผลสำเร็จ</div>
        </div>
      )}

      {paymentError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 p-2.5 rounded-xl text-[11px] font-black animate-slideUp">
          ⚠️ {paymentError}
        </div>
      )}

      <label className="inline-flex items-center gap-2 text-[11px] font-black text-slate-700 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={isCredit}
          onChange={(e) => {
            const next = e.target.checked ? SALE_MODE.CREDIT : SALE_MODE.CASH;
            setCurrentSaleMode(next);
          }}
          disabled={isSubmitting}
          className="accent-slate-900 h-3.5 w-3.5"
        />
        <span>เครดิต/หน่วยงาน</span>
        {!hasValidCustomerId && isCredit && (
          <span className="text-[10px] text-rose-500 font-medium">(กรุณาเลือกชื่อลูกค้าก่อน)</span>
        )}
      </label>

      <div className="py-0.5">
        <BillPrintOptions
          saleOption={saleOption}
          setSaleOption={setSaleOption}
          currentSaleMode={currentSaleMode}
          hideNoneOption={isCash}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1 select-none">
        <button
          type="button"
          onClick={onSaveHeldCart}
          disabled={isSubmitting || recovery?.state === 'UNCERTAIN'}
          className="h-9 border border-orange-300 bg-orange-50 hover:bg-orange-100 text-orange-700 font-black text-xs rounded-xl active:scale-[0.99] transition-all disabled:opacity-40 disabled:transform-none"
        >
          บันทึกการจอง
        </button>
        <button
          type="button"
          onClick={async () => {
            if (!isConfirmEnabled || isSubmitting) return;

            try {
              await onConfirm?.();
            } catch (err) {
              console.error('[PaymentSummary] confirm sale error', err);
            }
          }}
          disabled={!isConfirmEnabled || isSubmitting}
          data-testid="pos-sale-confirm-button"
          className="h-9 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl active:scale-[0.99] transition-all shadow-md disabled:opacity-40 disabled:transform-none disabled:shadow-none"
        >
          {isSubmitting
            ? '⏳ กำลังบันทึก...'
            : retryingExistingCommand
              ? 'ตรวจสอบคำสั่งเดิมอีกครั้ง'
              : 'บันทึกการขาย'}
        </button>
      </div>
    </div>
  );
};

PaymentSummary.propTypes = {
  totalToPay: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  grandTotalPaid: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  safeChangeAmount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  isConfirmEnabled: PropTypes.bool.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  onConfirm: PropTypes.func.isRequired,
  paymentError: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  recovery: PropTypes.shape({
    state: PropTypes.string,
    commandId: PropTypes.string,
    retryable: PropTypes.bool,
    message: PropTypes.string,
  }),
  retryingExistingCommand: PropTypes.bool,
  saleOption: PropTypes.oneOf([
    PRINT_OPTION.NONE,
    PRINT_OPTION.RECEIPT,
    PRINT_OPTION.TAX_INVOICE,
    PRINT_OPTION.DELIVERY_NOTE,
  ]).isRequired,
  setSaleOption: PropTypes.func.isRequired,
  currentSaleMode: PropTypes.oneOf([SALE_MODE.CASH, SALE_MODE.CREDIT]).isRequired,
  setCurrentSaleMode: PropTypes.func.isRequired,
  hasValidCustomerId: PropTypes.bool,
  onSaveHeldCart: PropTypes.func.isRequired,
};

export default PaymentSummary;
