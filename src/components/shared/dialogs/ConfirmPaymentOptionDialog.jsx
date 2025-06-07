// src/components/shared/dialogs/ConfirmPaymentOptionDialog.jsx
import React from 'react';

const ConfirmPaymentOptionDialog = ({ isOpen, onSelect, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white rounded p-6 w-[360px] space-y-4 shadow-lg">
        <h2 className="text-lg font-semibold">คุณต้องการทำรายการต่ออย่างไร?</h2>
        <div className="space-y-2">
          <button
            className="w-full bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() => onSelect('IN_PAGE')}
          >
            พิมพ์บิล / รับเงินทันที (หน้าเดียว)
          </button>
          <button
            className="w-full bg-yellow-600 text-white px-4 py-2 rounded"
            onClick={() => onSelect('GO_PAYMENT')}
          >
            ออกใบกำกับภาษี / ไปหน้าชำระเงินเต็ม
          </button>
          <button
            className="w-full bg-gray-300 text-black px-4 py-2 rounded"
            onClick={() => onSelect('SKIP')}
          >
            ยังไม่รับเงิน / ยืมสินค้าไว้ก่อน
          </button>
        </div>
        <button
          className="mt-2 text-sm text-gray-600 underline"
          onClick={onCancel}
        >
          ยกเลิก
        </button>
      </div>
    </div>
  );
};

export default ConfirmPaymentOptionDialog;
