// src/features/paymentOnline/components/PaymentOnlineForm.jsx

import React, { useRef, useState } from 'react';

const PaymentOnlineForm = ({ orderId, submitPaymentSlipAction }) => {
  const [file, setFile] = useState(null);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || isSubmitting || submittingRef.current) return;

    const orderIdSnapshot = orderId;
    const fileSnapshot = file;
    const noteSnapshot = note;
    const formData = new FormData();
    formData.append('slip', fileSnapshot);

    submittingRef.current = true;
    setIsSubmitting(true);

    try {
      await submitPaymentSlipAction(orderIdSnapshot, formData, { note: noteSnapshot });
      setFile(null);
      setNote('');
    } catch {
      // Persistent outcome feedback is owned by paymentOnlineStore.
    } finally {
      submittingRef.current = false;
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
          onChange={(e) => {
            if (submittingRef.current) return;
            setFile(e.target.files[0]);
          }}
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
          onChange={(e) => {
            if (submittingRef.current) return;
            setNote(e.target.value);
          }}
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
