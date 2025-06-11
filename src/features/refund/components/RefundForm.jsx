// refund/components/RefundForm.jsx
import React, { useState } from 'react';
import useRefundStore from '../store/refundStore';

const RefundForm = ({ saleReturn }) => {
  const remainingRefund = (saleReturn.totalRefund || 0) - (saleReturn.refundedAmount || 0) - (saleReturn.deductedAmount || 0);
  const [deductAmount, setDeductAmount] = useState(0);
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState('CASH');
  const [note, setNote] = useState('');

  const { createRefundAction, loading, error } = useRefundStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (amount + deductAmount > remainingRefund) {
      alert('ยอดคืนรวมกับยอดหัก เกินยอดคงเหลือที่สามารถคืนได้');
      return;
    }
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
    return <div className="text-green-600 font-semibold">✅ คืนเงินครบถ้วนแล้ว</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-semibold mb-1">ยอดที่ต้องการหักออก (บาท)</label>
        <input
          type="number"
          value={deductAmount}
          onChange={(e) => setDeductAmount(parseFloat(e.target.value) || 0)}
          max={remainingRefund}
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">ยอดเงินที่คืน (บาท)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
          max={remainingRefund}
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">วิธีการคืนเงิน</label>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="method"
              value="CASH"
              checked={method === 'CASH'}
              onChange={() => setMethod('CASH')}
            />
            เงินสด (CASH)
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="method"
              value="QR"
              checked={method === 'QR'}
              onChange={() => setMethod('QR')}
            />
            QR Code
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="method"
              value="TRANSFER"
              checked={method === 'TRANSFER'}
              onChange={() => setMethod('TRANSFER')}
            />
            โอนเงิน (TRANSFER)
          </label>
        </div>
      </div>

      <div>
        <label className="block font-semibold mb-1">หมายเหตุ</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          rows={3}
        />
      </div>

      {error && <p className="text-red-600">❌ {error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        ✅ ยืนยันการคืนเงิน
      </button>
    </form>
  );
};

export default RefundForm;
