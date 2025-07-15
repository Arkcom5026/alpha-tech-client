// PaymentSummary.jsx (New Component - Updated to include BillPrintOptions)
import React from 'react';
import BillPrintOptions from './BillPrintOptions'; // Import BillPrintOptions

// ✨ รับ currentSaleMode เข้ามา
const PaymentSummary = ({ totalToPay, grandTotalPaid, safeChangeAmount, isConfirmEnabled, isSubmitting, onConfirm, paymentError, saleOption, setSaleOption, currentSaleMode }) => {
  return (
    <div className="flex-1 min-w-[300px] max-w-[400px] bg-lime-50 p-6 rounded-xl flex flex-col justify-between shadow-lg border border-lime-100">
      <div>                
        {/* ✨ แสดงสรุปยอดตาม Sale Mode */}
        {currentSaleMode === 'CASH' ? (
            <>
                <div className="text-lg text-gray-700 mt-4">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-2xl font-bold text-gray-900">ยอดสุทธิที่ต้องชำระ</span>
                        <span className="text-3xl font-extrabold text-blue-700">{totalToPay.toLocaleString(undefined, { maximumFractionDigits: 2 })} ฿</span>
                    </div>
                    <hr className="border-gray-200 my-3" />

                    <div className="flex justify-between font-semibold text-xl py-2">
                        <span className="font-bold text-gray-900">รวมยอดที่รับ</span>
                        <span className={grandTotalPaid >= totalToPay ? 'text-green-600 text-3xl font-extrabold' : 'text-red-600 text-3xl font-extrabold'}>
                            {grandTotalPaid.toLocaleString(undefined, { maximumFractionDigits: 2 })} ฿
                        </span>
                    </div>
                    <div className="flex justify-between font-semibold text-xl py-2 mt-2">
                        <span className="font-bold text-gray-900">เงินทอน</span>
                        <span className="text-red-600 text-3xl font-extrabold">
                            {safeChangeAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} ฿
                        </span>
                    </div>
                </div>
            </>
        ) : (
            <div className="text-center py-8">
                <p className="text-3xl font-bold text-purple-700 mb-4">ยอดเครดิต/หน่วยงาน</p>
                <p className="text-xl text-gray-600">ยอดรวม: {totalToPay.toLocaleString(undefined, { maximumFractionDigits: 2 })} ฿</p>
                <p className="text-md text-gray-500 mt-2">จะถูกบันทึกเป็นยอดค้างชำระ</p>
            </div>
        )}
      </div>

      {paymentError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative text-base mb-4 mt-auto" role="alert">
          <strong className="font-bold">ข้อผิดพลาด!</strong>
          <span className="block sm:inline"> {paymentError}</span>
        </div>
      )}

      {/* ย้าย BillPrintOptions มาไว้ที่นี่ */}
      <div className="mt-auto pt-4"> {/* เพิ่ม padding-top เพื่อแยกจากส่วนสรุปยอด */}
        {currentSaleMode === 'CASH' && ( // ✨ ซ่อน BillPrintOptions เมื่อเป็น CREDIT
          <BillPrintOptions saleOption={saleOption} setSaleOption={setSaleOption} />
        )}
        {currentSaleMode === 'CREDIT' && ( // ✨ แสดงตัวเลือกการพิมพ์สำหรับ CREDIT
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-3">ตัวเลือกการพิมพ์เอกสาร:</h3>
            <div className="space-y-2 text-gray-700">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="saleOptionCredit"
                  value="NONE"
                  checked={saleOption === 'NONE'}
                  onChange={() => setSaleOption('NONE')}
                  className="form-radio text-gray-600"
                />
                <span>ไม่พิมพ์เอกสาร</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="saleOptionCredit"
                  value="DELIVERY_NOTE" // ✨ เพิ่มตัวเลือกใบส่งสินค้า
                  checked={saleOption === 'DELIVERY_NOTE'}
                  onChange={() => setSaleOption('DELIVERY_NOTE')}
                  className="form-radio text-blue-600"
                />
                <span>พิมพ์ใบส่งสินค้า</span>
              </label>
            </div>
          </div>
        )}
      </div>

      <div className="text-center py-4 mt-auto">
        <button
          onClick={onConfirm}
          disabled={!isConfirmEnabled || isSubmitting}
          className="px-8 py-5 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-3xl font-bold transition-colors duration-200 shadow-lg flex items-center justify-center w-full"
        >
          {isSubmitting ? (
            <svg className="animate-spin h-8 w-8 text-white mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
          ยืนยันการขาย
        </button>
      </div>
    </div>
  );
};

export default PaymentSummary;