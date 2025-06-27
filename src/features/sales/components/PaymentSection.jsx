import React, { useState } from 'react';

const PaymentSection = ({ netTotal, onConfirm, isSubmitting }) => {
  const [receivedAmount, setReceivedAmount] = useState(0);
  const change = receivedAmount - netTotal;

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h2 className="text-lg font-semibold mb-2">การชำระเงิน</h2>
      <div className="mb-2">
        <p>ยอดรวมสินค้า: <strong>{netTotal} ฿</strong></p>
        <p>ส่วนลด: <strong>0 ฿</strong></p>
      </div>
      <input
        type="number"
        placeholder="จำนวนเงินที่รับมา"
        value={receivedAmount}
        onChange={(e) => setReceivedAmount(parseFloat(e.target.value) || 0)}
        className="w-full border border-gray-300 focus:ring-2 focus:ring-blue-500 text-lg px-3 py-2 mb-2 rounded"
      />
      <p className="text-blue-600 mb-2">เงินทอน: <strong>{change > 0 ? change : 0} ฿</strong></p>
      <div className="mb-2">
        <label className="block mb-1">วิธีชำระเงิน:</label>
        <select className="w-full border border-gray-300 rounded px-3 py-2">
          <option>เงินสด</option>
          <option>โอนเงิน</option>
          <option>บัตรเครดิต</option>
        </select>
      </div>
      <button
        onClick={onConfirm}
        disabled={receivedAmount < netTotal || netTotal === 0 || isSubmitting}
        className="mt-4 bg-green-600 text-white px-4 py-2 rounded w-full disabled:opacity-50"
      >
        {isSubmitting ? 'กำลังดำเนินการ...' : 'ยืนยันการขาย'}
      </button>
    </div>
  );
};

export default PaymentSection;
