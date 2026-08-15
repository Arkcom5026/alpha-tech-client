// refund/components/RefundForm.jsx
import React, { useState } from 'react';
import { FieldMessage } from '@/design-system/feedback';
import useRefundStore from '../store/refundStore';

const RefundForm = ({ saleReturn }) => {
  const remainingRefund = (saleReturn.totalRefund || 0) - (saleReturn.refundedAmount || 0) - (saleReturn.deductedAmount || 0);
  const [deductAmount, setDeductAmount] = useState(0);
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState('CASH');
  const [note, setNote] = useState('');
  const [validationError, setValidationError] = useState('');

  const { createRefundAction, loading, error } = useRefundStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (amount + deductAmount > remainingRefund) {
      setValidationError('ยอดคืนรวมกับยอดหัก เกินยอดคงเหลือที่สามารถคืนได้');
      return;
    }
    setValidationError('');
    try {
      const refundData = {
        saleReturnId: saleReturn.id,
        amount,
        method,
        note,
        deducted: deductAmount,
      };
      const result = await createRefundAction(refundData);
      console.log('✅ Refund created:', result);
    } catch (err) {
      console.error('❌ Refund failed:', err);
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
          className="w-full rounded border px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
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
          className="w-full rounded border px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          aria-invalid={Boolean(validationError)}
          aria-describedby={validationError ? 'refund-amount-error' : undefined}
        />
        <FieldMessage id="refund-amount-error">{validationError}</FieldMessage>
      </div>

      <div>
        <label className="mb-1 block font-semibold">วิธีการคืนเงิน</label>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input type="radio" name="method" value="CASH" checked={method === 'CASH'} onChange={() => setMethod('CASH')} />
            เงินสด (CASH)
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="method" value="QR" checked={method === 'QR'} onChange={() => setMethod('QR')} />
            QR Code
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="method" value="TRANSFER" checked={method === 'TRANSFER'} onChange={() => setMethod('TRANSFER')} />
            โอนเงิน (TRANSFER)
          </label>
        </div>
      </div>

      <div>
        <label className="mb-1 block font-semibold">หมายเหตุ</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full rounded border px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          rows={3}
        />
      </div>

      {error && <p className="text-red-600">❌ {error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        ✅ ยืนยันการคืนเงิน
      </button>
    </form>
  );
};

export default RefundForm;