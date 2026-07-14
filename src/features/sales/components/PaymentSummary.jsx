// src/features/sales/components/PaymentSummary.jsx
// 🏛️ Premium Next-Gen POS Payment Summary: (Pure High-Contrast & Premium Dark Layout Center)

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import BillPrintOptions, { PRINT_OPTION, SALE_MODE } from './BillPrintOptions';

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
  saleOption,
  setSaleOption,
  currentSaleMode,
  setCurrentSaleMode,
  hasValidCustomerId = false,
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

  return (
    /* 🟢 [THEME UNIFICATION]: โยกสีมะนาวสว่างออก คุมด้วยฟอนต์ขวาสีเข้มพรีเมียม บอกยอดสุทธิชัดเจนระดับสากล */
    <div className="flex-1 w-full flex flex-col justify-between gap-3 text-xs font-bold text-slate-600">
      <div className="space-y-2">
        {isCash ? (
          <div className="space-y-1.5 border-b border-slate-100 pb-2">
            <div className="flex justify-between items-center bg-slate-900 text-white p-2 rounded-xl shadow-inner select-none">
              <span className="text-[11px] font-black tracking-wide uppercase opacity-70">ยอดสุทธิที่ต้องชำระ</span>
              <span className="font-mono text-lg font-black text-teal-400">฿{fmt(totalNum)}</span>
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

      {paymentError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 p-2.5 rounded-xl text-[11px] font-black animate-slideUp">
          ⚠️ {paymentError}
        </div>
      )}

      {/* สวิตช์สลับโหมดขายเครดิต */}
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
        <span>เปิดเลนขายแบบ เครดิต/หน่วยงาน</span>
        {!hasValidCustomerId && isCredit && (
          <span className="text-[10px] text-rose-500 font-medium">(กรุณาเลือกชื่อลูกค้าก่อน)</span>
        )}
      </label>

      {/* แผงตัวเลือกการพิมพ์แบบเรียงแถวคลีนตา */}
      <div className="py-0.5">
        <BillPrintOptions
          saleOption={saleOption}
          setSaleOption={setSaleOption}
          currentSaleMode={currentSaleMode}
          hideNoneOption={isCash}
        />
      </div>

      {/* ปุ่มสั่งการกดยืนยันการขายพรีเมียมสีเข้มองค์กร */}
      <div className="pt-1 select-none">
        <button
          type="button"
          onClick={async () => {
            if (!isConfirmEnabled || isSubmitting) return;

            // Reserve the print tab while this click is still a direct user gesture.
            // Reusing it after async sale/payment completion avoids browser popup blocking.
            const shouldOpenDocument =
              isCredit ||
              saleOption === PRINT_OPTION.RECEIPT ||
              saleOption === PRINT_OPTION.TAX_INVOICE ||
              saleOption === PRINT_OPTION.DELIVERY_NOTE;

            const printWindow = shouldOpenDocument
              ? window.open('', '_blank')
              : null;

            if (printWindow) {
              printWindow.document.title = 'กำลังเตรียมเอกสาร...';
              printWindow.document.body.innerHTML =
                '<div style="font-family:Tahoma,Arial,sans-serif;padding:24px;text-align:center">กำลังบันทึกการขายและเตรียมเอกสาร...</div>';
            }

            try {
              const created = await onConfirm?.({ printWindow });

              if (!created && printWindow && !printWindow.closed) {
                printWindow.close();
              }
            } catch (err) {
              if (printWindow && !printWindow.closed) {
                printWindow.close();
              }
              console.error('[PaymentSummary] confirm sale error', err);
            }
          }}
          disabled={!isConfirmEnabled || isSubmitting}
          className="w-full h-9 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl active:scale-[0.99] transition-all shadow-md disabled:opacity-40 disabled:transform-none disabled:shadow-none"
        >
          {isSubmitting ? '⏳ กำลังประมวลผลตัดคลังสินค้า...' : '🛒 ยืนยันปิดยอดการขายสินค้า'}
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
};

export default PaymentSummary;