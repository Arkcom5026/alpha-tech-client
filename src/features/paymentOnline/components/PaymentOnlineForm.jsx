// src/features/paymentOnline/components/PaymentOnlineForm.jsx

import React, { useState } from 'react';

const PaymentOnlineForm = ({ orderId, uploadSlipAction, submitPaymentSlipAction }) => {
  const [file, setFile] = useState(null);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || isSubmitting) return;

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append('slip', file);
      const url = await uploadSlipAction(orderId, formData);

      await submitPaymentSlipAction(orderId, { note, slipUrl: url });

      setFile(null);
      setNote('');
    } catch (err) {
      console.error('submit error:', err);
      // Persistent mutation feedback is owned by paymentOnlineStore.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-medium mb-1">แนบสลิปการชำระเงิน</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          required
          disabled={isSubmitting}
          className="border rounded px-3 py-2 w-full disabled:opacity-60"
        />
      </div>

      <div>
        <label className="block font-medium mb-1">หมายเหตุ (ถ้ามี)</label>
        <textarea
          className="border rounded px-3 py-2 w-full disabled:opacity-60"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !file}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {isSubmitting ? 'กำลังส่งข้อมูล...' : 'ยืนยันการชำระเงิน'}
      </button>
    </form>
  );
};

export default PaymentOnlineForm;
