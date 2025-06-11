import React, { useState } from 'react';

const SupplierPaymentForm = ({ purchaseOrder, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    amount: '',
    method: 'CASH',
    referenceCode: '',
    note: '',
    isRefund: false,
    isAdvance: false,
    attachmentFile: null,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      attachmentFile: e.target.files[0] || null,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount) return alert('กรุณาระบุจำนวนเงิน');
    onSubmit({ ...formData, purchaseOrderId: purchaseOrder.id });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label>เลขที่ใบสั่งซื้อ</label>
        <input type="text" value={purchaseOrder.code} readOnly className="input" />
      </div>

      <div>
        <label>จำนวนเงินที่ชำระ</label>
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          className="input"
          required
        />
      </div>

      <div>
        <label>วิธีชำระเงิน</label>
        <select name="method" value={formData.method} onChange={handleChange} className="input">
          <option value="CASH">เงินสด</option>
          <option value="TRANSFER">โอนเงิน</option>
          <option value="CHEQUE">เช็ค</option>
          <option value="OTHER">อื่น ๆ</option>
        </select>
      </div>

      <div>
        <label>เลขอ้างอิง / หมายเลขสลิป</label>
        <input
          type="text"
          name="referenceCode"
          value={formData.referenceCode}
          onChange={handleChange}
          className="input"
        />
      </div>

      <div>
        <label>หมายเหตุเพิ่มเติม</label>
        <textarea
          name="note"
          value={formData.note}
          onChange={handleChange}
          className="input"
        ></textarea>
      </div>

      <div className="flex items-center gap-4">
        <label>
          <input type="checkbox" name="isRefund" checked={formData.isRefund} onChange={handleChange} /> รับเงินคืน
        </label>
        <label>
          <input type="checkbox" name="isAdvance" checked={formData.isAdvance} onChange={handleChange} /> ชำระล่วงหน้า
        </label>
      </div>

      <div>
        <label>แนบหลักฐานการชำระเงิน (ถ้ามี)</label>
        <input type="file" accept="image/*,application/pdf" onChange={handleFileChange} />
      </div>

      <div className="pt-4 flex gap-3">
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">บันทึก</button>
        <button type="button" onClick={onCancel} className="bg-gray-300 px-4 py-2 rounded">ยกเลิก</button>
      </div>
    </form>
  );
};

export default SupplierPaymentForm;
