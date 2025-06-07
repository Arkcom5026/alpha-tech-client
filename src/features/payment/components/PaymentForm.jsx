import { useEffect, useState } from 'react';
import usePaymentStore from '../store/paymentStore';

const PaymentForm = ({ saleOrder }) => {
  const {
    paymentData,
    setPaymentField,
    submitPaymentAction,
    isSubmitting,
    error,
  } = usePaymentStore();

  const [maxAmount, setMaxAmount] = useState(0);

  useEffect(() => {
    const paidAmount = saleOrder.payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
    const dueAmount = Number(saleOrder.totalAmount) - paidAmount;
    setMaxAmount(dueAmount);
    setPaymentField('amount', dueAmount);
  }, [saleOrder, setPaymentField]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaymentField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitPaymentAction(saleOrder.id);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label className="block font-medium">ช่องทางชำระ</label>
        <select
          name="paymentMethod"
          value={paymentData.paymentMethod || ''}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        >
          <option value="">-- เลือกช่องทาง --</option>
          <option value="CASH">เงินสด</option>
          <option value="TRANSFER">โอน</option>
          <option value="QR">QR Code</option>
          <option value="CREDIT">บัตรเครดิต</option>
          <option value="OTHER">อื่น ๆ</option>
        </select>
      </div>

      <div>
        <label className="block font-medium">ยอดที่รับ</label>
        <input
          type="number"
          name="amount"
          value={paymentData.amount || ''}
          onChange={handleChange}
          max={maxAmount}
          min={0.01}
          step="0.01"
          className="w-full border p-2 rounded"
          required
        />
        <small className="text-gray-500">ยอดค้าง: {maxAmount.toFixed(2)} บาท</small>
      </div>

      <div>
        <label className="block font-medium">หมายเหตุ (ถ้ามี)</label>
        <textarea
          name="note"
          value={paymentData.note || ''}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          rows={2}
        />
      </div>

      {error && <div className="text-red-600">{error}</div>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        บันทึกการชำระเงิน
      </button>
    </form>
  );
};

export default PaymentForm;







