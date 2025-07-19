
// PaymentSummary.jsx (New Component - Updated to include BillPrintOptions)
import React from 'react';
import BillPrintOptions from './BillPrintOptions'; // Import BillPrintOptions

// ✨ รับ currentSaleMode เข้ามา พร้อม setCurrentSaleMode
const PaymentSummary = ({ totalToPay, grandTotalPaid, safeChangeAmount, isConfirmEnabled, isSubmitting, onConfirm, paymentError, saleOption, setSaleOption, currentSaleMode, setCurrentSaleMode }) => {
  return (
    <div className="flex-1 min-w-[300px] max-w-[420px] bg-lime-50 p-6 rounded-xl flex flex-col justify-between shadow-lg border border-lime-100">
      <div >
        {/* ✨ แสดงสรุปยอดตาม Sale Mode */}
        {currentSaleMode === 'CASH' ? (
          <>
            <div className="text-lg text-gray-700 ">
              <div className="flex justify-between items-center mb-3">
                <span className="text-2xl font-bold text-gray-900">ยอดสุทธิที่ต้องชำระ</span>
                <span className="text-3xl font-extrabold text-blue-700">{totalToPay.toLocaleString(undefined, { maximumFractionDigits: 2 })} ฿</span>
              </div>

              <div className="flex justify-between font-semibold text-xl py-2">
                <span className="font-bold text-gray-900">รวมยอดที่รับ</span>
                <span className={grandTotalPaid >= totalToPay ? 'text-green-600 text-3xl font-extrabold' : 'text-red-600 text-3xl font-extrabold'}>
                  {grandTotalPaid.toLocaleString(undefined, { maximumFractionDigits: 2 })} ฿
                </span>
              </div>
              <div className="flex justify-between font-semibold text-xl py-1 mt-0">
                <span className="font-bold text-gray-900">เงินทอน</span>
                <span className="text-red-600 text-3xl font-extrabold">
                  {safeChangeAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} ฿
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-0">
            <p className="text-3xl font-bold text-purple-700 mb-4">ยอดเครดิต/หน่วยงาน</p>
            <p className="text-xl text-gray-600">ยอดรวม: {totalToPay.toLocaleString(undefined, { maximumFractionDigits: 2 })} ฿</p>
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
          checked={currentSaleMode === 'CREDIT'}
          onChange={(e) => setCurrentSaleMode(e.target.checked ? 'CREDIT' : 'CASH')}
          className="form-checkbox h-5 w-5 text-purple-600 rounded"
        />
        เครดิต/หน่วยงาน
      </label>

      {/* ย้าย BillPrintOptions มาไว้ที่นี่ */}
      <div className="mt-auto "> {/* เพิ่ม padding-top เพื่อแยกจากส่วนสรุปยอด */}
        {currentSaleMode === 'CASH' && ( // ✨ ซ่อน BillPrintOptions เมื่อเป็น CREDIT
          <BillPrintOptions saleOption={saleOption} setSaleOption={setSaleOption} hideNoneOption={true} />
        )}
        {currentSaleMode === 'CREDIT' && ( // ✨ แสดงตัวเลือกการพิมพ์สำหรับ CREDIT

          <div className="p-0 rounded-xl shadow-sm flex items-center space-x-6">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="saleOptionCredit"
                value="NONE"
                checked={saleOption === 'NONE'}
                onChange={() => setSaleOption('NONE')}
                className="form-radio text-gray-600 w-5 h-5"
              />
              <span>ไม่พิมพ์เอกสาร</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="saleOptionCredit"
                value="DELIVERY_NOTE"
                checked={saleOption === 'DELIVERY_NOTE'}
                onChange={() => setSaleOption('DELIVERY_NOTE')}
                className="form-radio text-blue-600 w-5 h-5"
              />
              <span>พิมพ์ใบส่งสินค้า</span>
            </label>
          </div>


        )}
      </div>

      <div className="text-center  mt-auto">
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

export default PaymentSummary;

