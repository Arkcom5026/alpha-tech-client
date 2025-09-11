// PaymentSummary.jsx (New Component - Updated to include BillPrintOptions + PropTypes)
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import BillPrintOptions from './BillPrintOptions';

// Utils
const fmt = (n) => Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Enums (avoid magic strings)
const SALE_MODE = { CASH: 'CASH', CREDIT: 'CREDIT' };
const PRINT_OPTION = { NONE: 'NONE', DELIVERY_NOTE: 'DELIVERY_NOTE' };

// ✨ รับ currentSaleMode เข้ามา พร้อม setCurrentSaleMode
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
}) => {
  // Coerce to numbers to avoid string comparison issues
  const totalNum = Number(totalToPay) || 0;
  const paidNum = Number(grandTotalPaid) || 0;
  const changeNum = Number(safeChangeAmount) || 0;

  const isCash = currentSaleMode === SALE_MODE.CASH;
  const isCredit = currentSaleMode === SALE_MODE.CREDIT;

  // Ensure a valid default print option when switching to CREDIT
  useEffect(() => {
    if (isCredit && ![PRINT_OPTION.NONE, PRINT_OPTION.DELIVERY_NOTE].includes(saleOption)) {
      setSaleOption(PRINT_OPTION.DELIVERY_NOTE);
    }
  }, [isCredit, saleOption, setSaleOption]);

  const changeClass = changeNum > 0
    ? 'text-green-600'
    : changeNum < 0
      ? 'text-red-600'
      : 'text-gray-600';

  return (
    <div className="flex-1 min-w-[300px] max-w-[420px] bg-lime-50 p-6 rounded-xl flex flex-col justify-between shadow-lg border border-lime-100">
      <div>
        {/* ✨ แสดงสรุปยอดตาม Sale Mode */}
        {isCash ? (
          <>
            <div className="text-lg text-gray-700 ">
              <div className="flex justify-between items-center mb-3">
                <span className="text-2xl font-bold text-gray-900">ยอดสุทธิที่ต้องชำระ</span>
                <span className="text-3xl font-extrabold text-blue-700">{fmt(totalNum)} ฿</span>
              </div>

              <div className="flex justify-between font-semibold text-xl py-2">
                <span className="font-bold text-gray-900">รวมยอดที่รับ</span>
                <span className={(paidNum >= totalNum ? 'text-green-600' : 'text-red-600') + ' text-3xl font-extrabold'}>
                  {fmt(paidNum)} ฿
                </span>
              </div>
              <div className="flex justify-between font-semibold text-xl py-1 mt-0">
                <span className="font-bold text-gray-900">เงินทอน</span>
                <span className={`${changeClass} text-3xl font-extrabold`}>
                  {fmt(changeNum)} ฿
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-0">
            <p className="text-3xl font-bold text-purple-700 mb-4">ยอดเครดิต/หน่วยงาน</p>
            <p className="text-xl text-gray-600">ยอดรวม: {fmt(totalNum)} ฿</p>
            <p className="py-8"></p>
          </div>
        )}
      </div>

      {paymentError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md relative text-base mb-4 mt-auto" role="alert">
          <strong className="font-bold">ข้อผิดพลาด!</strong>
          <span className="block sm:inline"> {paymentError}</span>
        </div>
      )}

      <label className="inline-flex items-center gap-2 text-gray-700 text-lg py-2">
        <input
          type="checkbox"
          checked={isCredit}
          onChange={(e) => setCurrentSaleMode(e.target.checked ? SALE_MODE.CREDIT : SALE_MODE.CASH)}
          disabled={isSubmitting}
          className="form-checkbox h-4 w-4 text-purple-600 rounded"
        />
        เครดิต/หน่วยงาน
      </label>

      {/* ย้าย BillPrintOptions มาไว้ที่นี่ */}
      <div className="mt-auto">
        {isCash && (
          // ✨ ซ่อน BillPrintOptions เมื่อเป็น CREDIT
          <BillPrintOptions saleOption={saleOption} setSaleOption={setSaleOption} hideNoneOption={true} />
        )}
  {isCredit && (
          // ✨ แสดงตัวเลือกการพิมพ์สำหรับ CREDIT
          <fieldset aria-labelledby="print-credit-label" className="flex justify-center space-x-6">
            <span id="print-credit-label" className="sr-only">ตัวเลือกการพิมพ์สำหรับเครดิต</span>

            <label className="flex items-center space-x-2 ">
              <input
                type="radio"
                name="saleOptionCredit"
                value={PRINT_OPTION.NONE}
                checked={saleOption === PRINT_OPTION.NONE}
                onChange={() => setSaleOption(PRINT_OPTION.NONE)}
                className="form-radio text-gray-600 w-4 h-4"
              />
              <span>ไม่พิมพ์เอกสาร</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="saleOptionCredit"
                value={PRINT_OPTION.DELIVERY_NOTE}
                checked={saleOption === PRINT_OPTION.DELIVERY_NOTE}
                onChange={() => setSaleOption(PRINT_OPTION.DELIVERY_NOTE)}
                className="form-radio text-blue-600 w-4 h-4"
              />
              <span>พิมพ์ใบส่งสินค้า</span>
            </label>
          </fieldset>
        )}
      </div>

      <div className="text-center mt-auto">
        <button
          onClick={onConfirm}
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
  saleOption: PropTypes.oneOf([PRINT_OPTION.NONE, PRINT_OPTION.DELIVERY_NOTE]).isRequired,
  setSaleOption: PropTypes.func.isRequired,
  currentSaleMode: PropTypes.oneOf([SALE_MODE.CASH, SALE_MODE.CREDIT]).isRequired,
  setCurrentSaleMode: PropTypes.func.isRequired,
};

export default PaymentSummary;



  

