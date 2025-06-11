// pages/pos/sales/FullSalePaymentPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useSalesStore from '@/features/sales/store/salesStore';
import usePaymentStore from '@/features/payment/store/paymentStore';

const FullSalePaymentPage = () => {
  const { saleId } = useParams();
  const navigate = useNavigate();

  const { getSaleByIdAction } = useSalesStore();
  const { createPaymentAction } = usePaymentStore();

  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState('CASH');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [label, setLabel] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const result = await getSaleByIdAction(saleId);
        setAmount(result.totalAmount);
        setLabel(`ใบขาย #${saleId}`);
      } catch (err) {
        setError('ไม่พบข้อมูลใบขายนี้');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [saleId, getSaleByIdAction]);

  const handleConfirmPayment = async () => {
    try {
      setError('');
      await createPaymentAction({
        saleId: Number(saleId),
        amount,
        paymentMethod: method,
        note,
      });
      navigate('/pos/sales');
    } catch (err) {
      console.error('❌ ชำระเงินล้มเหลว:', err);
      setError('เกิดข้อผิดพลาดในการบันทึกการชำระเงิน');
    }
  };

  if (loading) return <div className="p-4">⏳ กำลังโหลดข้อมูล...</div>;

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">💳 ชำระเงิน: {label}</h1>

      <div className="mb-4">
        <label className="block font-semibold mb-1">จำนวนเงินที่ต้องชำระ (บาท)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(parseFloat(e.target.value))}
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">วิธีชำระเงิน</label>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="CASH">เงินสด</option>
          <option value="QR">QR Code</option>
          <option value="TRANSFER">โอนเงิน</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">หมายเหตุ</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      {error && <p className="text-red-600 mb-4">❌ {error}</p>}

      <div className="text-right">
        <button
          onClick={handleConfirmPayment}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          ✅ ยืนยันรับชำระเงิน
        </button>
      </div>
    </div>
  );
};

export default FullSalePaymentPage;
