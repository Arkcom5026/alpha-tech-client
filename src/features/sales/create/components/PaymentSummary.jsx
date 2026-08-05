import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import BillPrintOptions from './BillPrintOptions';
import { PRINT_OPTION, SALE_MODE } from '../contracts/salePrintOptions';

const fmt = (value) =>
  Number(value || 0).toLocaleString('th-TH', {
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
  heldCartDisabled = false,
  saleExecutionDisabled = false,
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

  const outstanding = Math.max(0, Number((totalNum - paidNum).toFixed(2)));
  const commandSuffix = recovery?.commandId ? recovery.commandId.slice(-8) : '';

  return (
    <div className="flex flex-1 flex-col justify-between gap-4 text-sm text-slate-700">
      <div className="space-y-3">
        <div className="rounded-xl border border-teal-200 bg-teal-50 p-3">
          <div className="flex items-center justify-between gap-4">
            <span className="font-medium text-teal-900">ยอดสุทธิที่ต้องชำระ</span>
            <span data-testid="pos-sale-total-due" className="font-mono text-xl font-semibold text-teal-900">฿{fmt(totalNum)}</span>
          </div>
        </div>

        {isCash ? (
          <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3">
            <div className="flex items-center justify-between gap-4">
              <span>ยอดเงินที่รับ</span>
              <span className={receivedNum >= totalNum ? 'font-mono font-semibold text-emerald-700' : 'font-mono font-semibold text-rose-700'}>฿{fmt(receivedNum)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>เงินทอน</span>
              <span className={changeNum >= 0 ? 'font-mono font-semibold text-emerald-700' : 'font-mono font-semibold text-rose-700'}>฿{fmt(changeNum)}</span>
            </div>
          </div>
        ) : (
          <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-900">
            <div className="flex items-center justify-between gap-4">
              <span>ยอดใช้มัดจำ</span>
              <span className="font-mono font-semibold">฿{fmt(paidNum)}</span>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-amber-200 pt-2">
              <span className="font-medium">ยอดค้างชำระ</span>
              <span className="font-mono font-semibold">฿{fmt(outstanding)}</span>
            </div>
          </div>
        )}
      </div>

      {saleExecutionDisabled ? (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
          รายการจากใบจองพร้อมตรวจสอบแล้ว แต่ยังไม่เปิดการบันทึกการขายจนกว่าการเชื่อมต่อขั้นสุดท้ายจะพร้อม
        </div>
      ) : null}

      {recovery?.state === 'UNCERTAIN' ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          <p className="font-semibold">ผลการบันทึกยังไม่แน่นอน ระบบจะตรวจสอบคำสั่งเดิม</p>
          {commandSuffix ? <p className="mt-1 font-mono text-xs">คำสั่ง …{commandSuffix}</p> : null}
          <p className="mt-1 text-xs">กรุณาอย่าล้างตะกร้าหรือสร้างรายการใหม่จนกว่าจะทราบผล</p>
        </div>
      ) : null}

      {paymentError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{paymentError}</div>
      ) : null}

      <label className="flex min-h-11 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-800">
        <input
          type="checkbox"
          checked={isCredit}
          onChange={(event) => setCurrentSaleMode(event.target.checked ? SALE_MODE.CREDIT : SALE_MODE.CASH)}
          disabled={isSubmitting || saleExecutionDisabled}
          className="h-4 w-4 accent-teal-700"
        />
        <span>ขายแบบเครดิต/หน่วยงาน</span>
        {!hasValidCustomerId && isCredit ? <span className="text-xs text-rose-600">กรุณาเลือกลูกค้า</span> : null}
      </label>

      <BillPrintOptions
        saleOption={saleOption}
        setSaleOption={setSaleOption}
        currentSaleMode={currentSaleMode}
        hideNoneOption={isCash}
      />

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={onSaveHeldCart}
          disabled={heldCartDisabled || isSubmitting || recovery?.state === 'UNCERTAIN'}
          className="min-h-11 rounded-xl border border-teal-200 bg-teal-50 px-4 text-sm font-semibold text-teal-900 hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {heldCartDisabled ? 'ใช้ใบจองออนไลน์เดิม' : 'พักรายการขาย'}
        </button>
        <button
          type="button"
          onClick={async () => {
            if (!isConfirmEnabled || isSubmitting) return;
            try {
              await onConfirm?.();
            } catch (error) {
              console.error('[PaymentSummary] confirm sale error', error);
            }
          }}
          disabled={!isConfirmEnabled || isSubmitting || saleExecutionDisabled}
          data-testid="pos-sale-confirm-button"
          className="min-h-11 rounded-xl bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saleExecutionDisabled
            ? 'ยังไม่พร้อมบันทึก'
            : isSubmitting
              ? 'กำลังบันทึก...'
              : retryingExistingCommand
                ? 'ตรวจสอบคำสั่งเดิม'
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
  heldCartDisabled: PropTypes.bool,
  saleExecutionDisabled: PropTypes.bool,
};

export default PaymentSummary;
