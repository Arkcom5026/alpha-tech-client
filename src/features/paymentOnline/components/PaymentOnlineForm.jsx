// src/features/paymentOnline/components/PaymentOnlineForm.jsx

import React, { useState } from 'react';

const PaymentOnlineForm = ({ orderId, uploadSlipAction, submitPaymentSlipAction }) => {
  const [file, setFile] = useState(null);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append('slip', file);
      const url = await uploadSlipAction(orderId, formData);

      await submitPaymentSlipAction(orderId, { note, slipUrl: url });

      alert('ส่งข้อมูลการชำระเงินเรียบร้อยแล้ว');
      setFile(null);
      setNote('');
    } catch (err) {
      console.error('submit error:', err);
      alert('เกิดข้อผิดพลาดในการส่งข้อมูล');
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
          className="border rounded px-3 py-2 w-full"
        />
      </div>

      <div>
        <label className="block font-medium mb-1">หมายเหตุ (ถ้ามี)</label>
        <textarea
          className="border rounded px-3 py-2 w-full"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {isSubmitting ? 'กำลังส่งข้อมูล...' : 'ยืนยันการชำระเงิน'}
      </button>
    </form>
  );
};

export default PaymentOnlineForm;
