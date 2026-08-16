import React, { useState } from 'react';
import { feedback } from '@/design-system';
import useCustomerDepositStore from '../store/customerDepositStore';

const PaymentMethodInput = ({ title, value, onChange, placeholder, disabled }) => (
  <div>
    <label className="block text-lg font-semibold text-gray-700">{title}</label>
    <input
      type="number"
      min="0"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="mt-1 w-full border rounded-md px-4 py-3 text-2xl text-right font-bold text-gray-800 disabled:bg-gray-100 disabled:cursor-not-allowed"
      onFocus={(event) => event.target.select()}
    />
  </div>
);

const PaymentSectionDeposit = () => {
  const [cashAmount, setCashAmount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [cardAmount, setCardAmount] = useState('');
  const [isCashEnabled, setIsCashEnabled] = useState(true);
  const [isTransferEnabled, setIsTransferEnabled] = useState(false);
  const [isCardEnabled, setIsCardEnabled] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const customer = useCustomerDepositStore((state) => state.selectedCustomer);
  const createCustomerDepositAction = useCustomerDepositStore((state) => state.createCustomerDepositAction);
  const isSubmitting = useCustomerDepositStore((state) => state.isSubmitting);

  const total = (Number(cashAmount) || 0) + (Number(transferAmount) || 0) + (Number(cardAmount) || 0);
  const isSubmitDisabled = !customer || total <= 0 || isSubmitting;

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setSubmitError('');

    if (!customer) {
      setSubmitError('กรุณาเลือกลูกค้าก่อนบันทึกเงินมัดจำ');
      return;
    }
    if (total <= 0) {
      setSubmitError('ยอดรวมเงินมัดจำต้องมากกว่า 0');
      return;
    }

    try {
      const created = await createCustomerDepositAction({
        paymentMethod: {
          cash: isCashEnabled,
          transfer: isTransferEnabled,
          card: isCardEnabled,
        },
        customerId: customer.id,
        cashAmount: isCashEnabled ? (Number(cashAmount) || 0) : 0,
        transferAmount: isTransferEnabled ? (Number(transferAmount) || 0) : 0,
        cardAmount: isCardEnabled ? (Number(cardAmount) || 0) : 0,
        totalAmount: total,
      });

      feedback.actionSuccess(
        'บันทึกเงินมัดจำเรียบร้อยแล้ว',
        `customer-deposit:${created?.id || customer.id}:create:success`,
      );

      setCashAmount('');
      setTransferAmount('');
      setCardAmount('');
      setIsCashEnabled(true);
      setIsTransferEnabled(false);
      setIsCardEnabled(false);

      if (customer.phone) {
        const { loadCustomerDepositByPhoneAction } = useCustomerDepositStore.getState();
        await loadCustomerDepositByPhoneAction(customer.phone);
        const refreshError = useCustomerDepositStore.getState().error;
        if (refreshError) {
          feedback.actionError(
            refreshError,
            'บันทึกเงินมัดจำสำเร็จแล้ว แต่โหลดยอดล่าสุดไม่สำเร็จ กรุณารีเฟรชอีกครั้ง',
            `customer-deposit:${customer.id}:refresh-after-create:error`,
          );
        }
      }
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'เกิดข้อผิดพลาดในการบันทึกเงินมัดจำ กรุณาลองอีกครั้ง';
      setSubmitError(message);
      feedback.actionError(error, message, 'customer-deposit:create:error');
    }
  };

  const formatNumber = (numStr) => {
    const number = parseFloat(numStr);
    return Number.isNaN(number)
      ? '0.00'
      : number.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-4">
          <PaymentMethodInput title="เงินสด" value={cashAmount} onChange={setCashAmount} placeholder="0.00" disabled={isSubmitting} />
          <PaymentMethodInput title="เงินโอน" value={transferAmount} onChange={setTransferAmount} placeholder="0.00" disabled={isSubmitting} />
          <PaymentMethodInput title="บัตรเครดิต" value={cardAmount} onChange={setCardAmount} placeholder="0.00" disabled={isSubmitting} />
        </div>

        <div className="md:col-span-2 bg-slate-50 p-4 rounded-lg flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">สรุปยอด</h3>
            <div className="space-y-2 text-gray-700 text-lg">
              <div className="flex justify-between"><span>เงินสด:</span> <span className="font-semibold">{formatNumber(cashAmount)}</span></div>
              <div className="flex justify-between"><span>เงินโอน:</span> <span className="font-semibold">{formatNumber(transferAmount)}</span></div>
              <div className="flex justify-between"><span>บัตรเครดิต:</span> <span className="font-semibold">{formatNumber(cardAmount)}</span></div>
            </div>
            <hr className="my-4" />
            <div className="flex justify-between items-center text-2xl font-bold text-blue-600">
              <span>รวมทั้งหมด:</span>
              <span>{formatNumber(total)}</span>
            </div>
          </div>

          {submitError && (
            <div className="bg-red-100 text-red-700 border border-red-300 px-4 py-2 rounded text-lg mt-4">
              ⚠️ {submitError}
            </div>
          )}

          <button
            type="button"
            disabled={isSubmitDisabled}
            onClick={handleSubmit}
            className="w-full mt-6 px-4 py-4 bg-blue-600 text-white font-bold text-lg rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all"
          >
            {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกเงินมัดจำ'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSectionDeposit;
