// refund/components/RefundForm.jsx
import React, { useState } from 'react';
import { FieldMessage, feedback } from '@/design-system/feedback';
import useRefundStore from '../store/refundStore';

const RefundForm = ({ saleReturn }) => {
  const remainingRefund = (saleReturn.totalRefund || 0) - (saleReturn.refundedAmount || 0) - (saleReturn.deductedAmount || 0);
  const [deductAmount, setDeductAmount] = useState(0);
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState('CASH');
  const [note, setNote] = useState('');
  const [validationError, setValidationError] = useState('');

  const { createRefundAction, loading, error, clearErrorAction } = useRefundStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (amount < 0 || deductAmount < 0) {
      setValidationError('ยอดคืนและยอดหักต้องไม่ติดลบ');
      return;
    }
    if (amount + deductAmount <= 0) {
      setValidationError('กรุณาระบุยอดคืนหรือยอดหักอย่างน้อย 1 รายการ');
      return;
    }
    if (amount + deductAmount > remainingRefund) {
      setValidationError('ยอดคืนรวมกับยอดหัก เกินยอดคงเหลือที่สามารถคืนได้');
      return;
    }

    setValidationError('');
    clearErrorAction?.();

    const refundData = {
      saleReturnId: saleReturn.id,
      amount,
      method,
      note,
      deducted: deductAmount,
    };

    try {
      const result = await createRefundAction(refundData);
      if (!result) return;
      feedback.actionSuccess(
        'บันทึกการคืนเงินเรียบร้อยแล้ว',
        `refund:${saleReturn.id}:create:success`,
      );
      setDeductAmount(0);
      setAmount(0);
      setNote('');
    } catch (err) {
      feedback.actionError(
        err,
        'บันทึกการคืนเงินไม่สำเร็จ',
        `refund:${saleReturn.id}:create:error`,
      );
    }
  };

  if (remainingRefund <= 0) {
    return <div className="font-semibold text-green-600">✅ คืนเงินครบถ้วนแล้ว</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block font-semibold">ยอดที่ต้องการหักออก (บาท)</label>
        <input
          type="number"
          value={deductAmount}
          onChange={(e) => {
            setDeductAmount(parseFloat(e.target.value) || 0);
            if (validationError) setValidationError('');
          }}
          max={remainingRefund}
          disabled={loading}
          className="w-full rounded border px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100"
          aria-invalid={Boolean(validationError)}
          aria-describedby={validationError ? 'refund-amount-error' : undefined}
        />
      </div>

      <div>
        <label className="mb-1 block font-semibold">ยอดเงินที่คืน (บาท)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => {
            setAmount(parseFloat(e.target.value) || 0);
            if (validationError) setValidationError('');
          }}
          max={remainingRefund}
          disabled={loading}
          className="w-full rounded border px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100"
          aria-invalid={Boolean(validationError)}
          aria-describedby={validationError ? 'refund-amount-error' : undefined}
        />
        <FieldMessage id="refund-amount-error">{validationError}</FieldMessage>
      </div>

      <div>
        <label className="mb-1 block font-semibold">วิธีการคืนเงิน</label>
        <div className="space-y-2">
          {['CASH', 'QR', 'TRANSFER'].map((value) => (
            <label key={value} className="flex items-center gap-2">
              <input
                type="radio"
                name="method"
                value={value}
                checked={method === value}
                disabled={loading}
                onChange={() => setMethod(value)}
              />
              {value === 'CASH' ? 'เงินสด (CASH)' : value === 'QR' ? 'QR Code' : 'โอนเงิน (TRANSFER)'}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block font-semibold">หมายเหตุ</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={loading}
          className="w-full rounded border px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100"
          rows={3}
        />
      </div>

      {error && <p className="text-red-600">❌ {error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'กำลังคืนเงิน...' : '✅ ยืนยันการคืนเงิน'}
      </button>
    </form>
  );
};

export default RefundForm;
