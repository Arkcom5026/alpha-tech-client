// PaymentSectionDeposit.jsx

import React, { useState } from 'react';
import useCustomerDepositStore from '../store/customerDepositStore';
import useCustomerStore from '@/features/customer/store/customerStore';

const PaymentSectionDeposit = () => {
  const [cashAmount, setCashAmount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [cardAmount, setCardAmount] = useState('');

  const { customer } = useCustomerStore();
  const { createCustomerDepositAction, isSubmitting } = useCustomerDepositStore();

  const total = (Number(cashAmount) || 0) + (Number(transferAmount) || 0) + (Number(cardAmount) || 0);
  const isSubmitDisabled = !customer || total <= 0 || isSubmitting;

  const handleSubmit = async () => {
    if (isSubmitDisabled) return;
    try {
      console.log('📤 Deposit Submit:', {
        customerId: customer?.id,
        cashAmount: Number(cashAmount || 0),
        transferAmount: Number(transferAmount || 0),
        cardAmount: Number(cardAmount || 0),
        totalAmount: total,
      });

      await createCustomerDepositAction({
        customerId: customer.id,
        cashAmount: Number(cashAmount || 0),
        transferAmount: Number(transferAmount || 0),
        cardAmount: Number(cardAmount || 0),
        totalAmount: total,
      });

      setCashAmount('');
      setTransferAmount('');
      setCardAmount('');
    } catch (error) {
      console.error('Failed to submit deposit:', error);
    }
  };

  const formatNumber = (num) => {
    const number = parseFloat(num);
    if (isNaN(number)) return '0';
    return number.toLocaleString(undefined, { minimumFractionDigits: 0 });
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow min-w-[1080px] flex flex-col-4 justify-center gap-4">
      {/* เงินสด */}
      <div className="mb-4 min-w-[250px] bg-green-100 p-4 rounded-md">
        <h2 className="text-lg font-semibold mb-2">เงินสด</h2>
        <hr />
        <label className="block text-sm font-bold text-gray-700">ยอดที่รับ (เงินสด):</label>
        <input
          type="number"
          className="mt-1 w-full border rounded px-4 py-2"
          placeholder="0.00"
          value={cashAmount}
          onChange={(e) => setCashAmount(e.target.value)}
        />
      </div>

      {/* เงินโอน */}
      <div className="mb-4 min-w-[250px] bg-sky-200 p-4 rounded-md">
        <input
          type="number"
          className="mt-1 w-full border rounded px-3 py-2"
          placeholder="0.00"
          value={transferAmount}
          onChange={(e) => setTransferAmount(e.target.value)}
        />
      </div>

      {/* บัตรเครดิต */}
      <div className="mb-4 min-w-[250px] bg-yellow-100 p-4 rounded-md">
        <h2 className="text-lg font-semibold mb-2">บัตรเครดิต</h2>
        <hr />
        <label className="block text-sm font-bold text-gray-700">ยอดรวมบัตรเครดิต:</label>
        <input
          type="number"
          className="mt-1 w-full border rounded px-3 py-2"
          placeholder="0.00"
          value={cardAmount}
          onChange={(e) => setCardAmount(e.target.value)}
        />
      </div>

      {/* สรุปยอด */}
      <div className="mb-4 min-w-[250px] max-h-[220px] bg-lime-100 p-2 rounded flex flex-col justify-between h-full">
        <div>
          <h2 className="text-lg font-semibold mb-2">สรุปยอด</h2>
          <hr />
          <div className="text-sm text-gray-700 mt-2">
            <div className="flex justify-between">
              <span className='font-bold'>เงินสด:</span>
              <span className='text-green-600'>{formatNumber(cashAmount)} ฿</span>
            </div>
            <div className="flex justify-between">
              <span className='font-bold'>เงินโอน:</span>
              <span>{formatNumber(transferAmount)} ฿</span>
            </div>
            <div className="flex justify-between">
              <span className='font-bold'>บัตรเครดิต:</span>
              <span>{formatNumber(cardAmount)} ฿</span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between font-semibold text-base">
              <span className='font-bold'>รวมยอดทั้งหมด:</span>
              <span className='text-blue-600'>{formatNumber(total)} ฿</span>
            </div>
          </div>

          <div className="text-center pt-3 mt-auto">
            <button
              disabled={isSubmitDisabled}
              onClick={handleSubmit}
              className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {isSubmitting ? '⏳ กำลังบันทึก...' : '💾 บันทึกเงินมัดจำ'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSectionDeposit;
