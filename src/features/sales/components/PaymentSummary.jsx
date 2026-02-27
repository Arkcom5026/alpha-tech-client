

// ------------------------------------------------------------
// 📁 FILE: src/features/sales/components/PaymentSummary.jsx

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import BillPrintOptions from './BillPrintOptions';

const fmt = (n) =>
  Number(n || 0).toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const SALE_MODE = { CASH: 'CASH', CREDIT: 'CREDIT' };

// ✅ รองรับทั้งหมด (แก้ warning: TAX_INVOICE / RECEIPT)
const PRINT_OPTION = {
  NONE: 'NONE',
  RECEIPT: 'RECEIPT',
  TAX_INVOICE: 'TAX_INVOICE',
  DELIVERY_NOTE: 'DELIVERY_NOTE',
};

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
  hasValidCustomerId,
}) => {
  const totalNum = Number(totalToPay) || 0;
  const paidNum = Number(grandTotalPaid) || 0;
  const changeNum = Number(safeChangeAmount) || 0;

  const isCash = currentSaleMode === SALE_MODE.CASH;
  const isCredit = currentSaleMode === SALE_MODE.CREDIT;

  // ✅ คุมตัวเลือกการพิมพ์ให้สอดคล้องกับโหมดขาย
  useEffect(() => {
    // CREDIT: จำกัดให้เลือกได้แค่ NONE / DELIVERY_NOTE
    if (isCredit && ![PRINT_OPTION.NONE, PRINT_OPTION.DELIVERY_NOTE].includes(saleOption)) {
      setSaleOption(PRINT_OPTION.DELIVERY_NOTE);
      return;
    }

    // CASH: ถ้าซ่อน NONE ให้ default เป็น RECEIPT เพื่อไม่ให้ radio “ว่าง”
    if (isCash && saleOption === PRINT_OPTION.NONE) {
      setSaleOption(PRINT_OPTION.RECEIPT);
    }
  }, [isCredit, isCash, saleOption, setSaleOption]);

  const changeClass =
    changeNum > 0 ? 'text-green-600' : changeNum < 0 ? 'text-red-600' : 'text-gray-600';

  return (
    <div className="flex-1 min-w-[300px] max-w-[420px] bg-lime-50 p-6 rounded-xl flex flex-col justify-between shadow-lg border border-lime-100">
      <div>
        {isCash ? (
          <div className="text-lg text-gray-700">
            <div className="flex justify-between items-center mb-3">
              <span className="text-2xl font-bold text-gray-900">ยอดสุทธิที่ต้องชำระ</span>
              <span className="text-3xl font-extrabold text-blue-700">{fmt(totalNum)} ฿</span>
            </div>

            <div className="flex justify-between font-semibold text-xl py-2">
              <span className="font-bold text-gray-900">รวมยอดที่รับ</span>
              <span
                className={(paidNum >= totalNum ? 'text-green-600' : 'text-red-600') + ' text-3xl font-extrabold'}
              >
                {fmt(paidNum)} ฿
              </span>
            </div>

            <div className="flex justify-between font-semibold text-xl py-1 mt-0">
              <span className="font-bold text-gray-900">เงินทอน</span>
              <span className={`${changeClass} text-3xl font-extrabold`}>{fmt(changeNum)} ฿</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-0">
            <p className="text-3xl font-bold text-purple-700 mb-4">ยอดเครดิต/หน่วยงาน</p>
            <p className="text-xl text-gray-600">ยอดรวม: {fmt(totalNum)} ฿</p>
            <p className="py-8" />
          </div>
        )}
      </div>

      {paymentError && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md relative text-base mb-4 mt-auto"
          role="alert"
        >
          <strong className="font-bold">ข้อผิดพลาด!</strong>
          <span className="block sm:inline"> {paymentError}</span>
        </div>
      )}

      <label className="inline-flex items-center gap-2 text-gray-700 text-lg py-2">
        <input
          type="checkbox"
          checked={isCredit}
          onChange={(e) => {
            const next = e.target.checked ? SALE_MODE.CREDIT : SALE_MODE.CASH;
            // ✅ ถ้าเลือกเครดิต แต่ยังไม่ได้เลือกลูกค้า → ปล่อยให้ PaymentSection เป็นคน guard
            setCurrentSaleMode(next);
          }}
          disabled={isSubmitting}
          className="form-checkbox h-4 w-4 text-purple-600 rounded"
        />
        เครดิต/หน่วยงาน
        {!hasValidCustomerId && isCredit && (
          <span className="text-sm text-red-600">(ต้องเลือกลูกค้าก่อน)</span>
        )}
      </label>

      <div className="mt-auto">
        <BillPrintOptions
          saleOption={saleOption}
          setSaleOption={setSaleOption}
          currentSaleMode={currentSaleMode}
          // CASH: ซ่อน NONE (ตาม UX ที่เลือก)
          hideNoneOption={isCash}
        />
      </div>

      <div className="text-center mt-auto">
        <button
          type="button"
          onClick={() => {
            // 🔒 Defensive: กัน click/enter ซ้ำตอน disabled (แม้ปกติ button จะกันอยู่แล้ว)
            if (!isConfirmEnabled || isSubmitting) return;
            onConfirm?.();
          }}
          disabled={!isConfirmEnabled || isSubmitting}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-xl font-semibold transition-colors duration-200 shadow-md w-full"
        >
          {isSubmitting ? 'กำลังดำเนินการ...' : 'ยืนยันการขาย'}
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

PaymentSummary.defaultProps = {
  hasValidCustomerId: false,
};

export default PaymentSummary;



