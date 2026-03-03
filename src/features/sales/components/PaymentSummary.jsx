






// ------------------------------------------------------------
// 📁 FILE: src/features/sales/components/PaymentSummary.jsx

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  hasValidCustomerId,
}) => {
  const navigate = useNavigate();

  // ✅ Central print route for delivery note (adjust if your router uses a different path)
  const DELIVERY_NOTE_PRINT_ROUTE = '/pos/sales/delivery-note/print';
  const totalNum = Number(totalToPay) || 0;
  // paidNum = "ยอดชำระจริง" (applied) ที่ใช้ตัดบิล (ไม่รวมเงินทอน)
  const paidNum = Number(grandTotalPaid) || 0;
  // changeNum = เงินทอน (คำนวณจากยอดรับเงินจริงฝั่ง CASH)
  const changeNum = Number(safeChangeAmount) || 0;
  // ✅ UI ต้องแสดง "ยอดเงินที่รับจริง" (tendered) = ชำระจริง + เงินทอน
  const receivedNum = Number((paidNum + Math.max(0, changeNum)).toFixed(2));

  const isCash = currentSaleMode === SALE_MODE.CASH;
  const isCredit = currentSaleMode === SALE_MODE.CREDIT;

  // ✅ คุมตัวเลือกการพิมพ์ให้สอดคล้องกับโหมดขาย
  useEffect(() => {
    // ✅ CREDIT: บังคับให้เป็น DELIVERY_NOTE เสมอ (เอกสารให้เซ็นรับของ)
    if (isCredit && saleOption !== PRINT_OPTION.DELIVERY_NOTE) {
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
              <span className="text-2xl font-bold text-gray-900">ยอดที่ต้องชำระ</span>
              <span className="text-3xl font-extrabold text-blue-700">{fmt(totalNum)} ฿</span>
              <div className="text-xs text-gray-500">* รวม VAT แล้ว</div>
            </div>

            <div className="flex justify-between font-semibold text-xl py-2">
              <span className="font-bold text-gray-900">รวมยอดที่รับ</span>
              <span
                className={(receivedNum >= totalNum ? 'text-green-600' : 'text-red-600') + ' text-3xl font-extrabold'}
              >
                {fmt(receivedNum)} ฿
              </span>
            </div>

            <div className="flex justify-between font-semibold text-xl py-1 mt-0">
              <span className="font-bold text-gray-900">เงินทอน</span>
              <span className={`${changeClass} text-3xl font-extrabold`}>{fmt(changeNum)} ฿</span>
            </div>
          </div>
        ) : (
          <div className="text-gray-700">
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-700 mb-2">ยอดเครดิต/หน่วยงาน</p>
              <p className="text-sm text-gray-600">* โหมดเครดิตรับ “มัดจำ” ได้ แต่ไม่รับเงินสด/โอน/บัตรในหน้านี้</p>
            </div>

            <div className="mt-5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">ยอดรวม</span>
                <span className="text-2xl font-extrabold text-blue-700">{fmt(totalNum)} ฿</span>
                <div className="text-xs text-gray-500">* รวม VAT แล้ว</div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">มัดจำที่ใช้</span>
                <span className={(paidNum > 0 ? 'text-green-600' : 'text-gray-600') + ' text-2xl font-extrabold'}>
                  {fmt(paidNum)} ฿
                </span>
              </div>

              {(() => {
                const outstanding = Math.max(0, Number((totalNum - paidNum).toFixed(2)));
                const outstandingClass = outstanding > 0 ? 'text-red-600' : 'text-green-600';
                return (
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="text-lg font-bold text-gray-900">ยอดค้าง</span>
                    <span className={outstandingClass + ' text-3xl font-extrabold'}>
                      {fmt(outstanding)} ฿
                    </span>
                  </div>
                );
              })()}
            </div>

            <div className="py-4" />
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
          // CREDIT: บังคับใบส่งของ (ซ่อน option อื่นภายใน component)
        />
      </div>

      <div className="text-center mt-auto">
        <button
          type="button"
          onClick={async () => {
            // 🔒 Defensive: กัน click/enter ซ้ำตอน disabled (แม้ปกติ button จะกันอยู่แล้ว)
            if (!isConfirmEnabled || isSubmitting) return;

            try {
              const created = await onConfirm?.();

              // ✅ CREDIT is always DELIVERY_NOTE; CASH prints only when chosen
              const shouldPrintDeliveryNote = isCredit || saleOption === PRINT_OPTION.DELIVERY_NOTE;
              if (!shouldPrintDeliveryNote) return;

              const createdSale = created?.sale ?? created;
              const saleId = createdSale?.id ?? created?.saleId ?? created?.id;
              if (!saleId) return;

              navigate(`${DELIVERY_NOTE_PRINT_ROUTE}/${saleId}`, {
                state: { sale: createdSale },
              });
            } catch (err) {
              // NOTE: onConfirm already sets paymentError via parent; keep this for debug only
              console.error('[PaymentSummary] confirm sale error', err);
            }
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









