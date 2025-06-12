import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import useSupplierPaymentStore from '../store/supplierPaymentStore';
import usePurchaseOrderStore from '../../purchaseOrder/store/purchaseOrderStore';

const SupplierPaymentForm = ({ supplier }) => {
  const navigate = useNavigate();
  const { createSupplierPaymentAction } = useSupplierPaymentStore();
  const { fetchPurchaseOrdersBySupplierAction, purchaseOrders } = usePurchaseOrderStore();

  const [formData, setFormData] = useState({
    paymentDate: dayjs().format('YYYY-MM-DD'),
    amount: '',
    method: 'CASH',
    paymentType: 'PO_BASED',
    note: '',
    pos: [], // สำหรับผูก PO
  });

  const [error, setError] = useState(null);

  useEffect(() => {
    if (formData.paymentType === 'PO_BASED') {
      fetchPurchaseOrdersBySupplierAction(supplier.id);
    }
  }, [formData.paymentType, supplier.id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePoAmountChange = (poId, value) => {
    const updatedPOs = formData.pos.filter(p => p.poId !== poId);
    if (parseFloat(value) > 0) {
      updatedPOs.push({ poId, amountPaid: parseFloat(value) });
    }
    setFormData({
      ...formData,
      pos: updatedPOs,
    });
  };

  const calculateTotalFromPOs = () => {
    return formData.pos.reduce((sum, item) => sum + (item.amountPaid || 0), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.amount || isNaN(formData.amount)) {
      return setError('กรุณากรอกจำนวนเงินให้ถูกต้อง');
    }

    const payload = {
      supplierId: supplier.id,
      paymentDate: formData.paymentDate,
      amount: parseFloat(formData.amount),
      method: formData.method,
      paymentType: formData.paymentType,
      note: formData.note,
      pos: formData.paymentType === 'PO_BASED' ? formData.pos : [],
      debitAmount: formData.paymentType === 'ADVANCE' ? parseFloat(formData.amount) : 0,
    };

    try {
      await createSupplierPaymentAction(payload);
      navigate(-1);
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const isAdvance = formData.paymentType === 'ADVANCE';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-medium">วันที่ชำระ</label>
        <input
          type="date"
          name="paymentDate"
          value={formData.paymentDate}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      <div>
        <label className="block font-medium">จำนวนเงิน</label>
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          min="0"
        />
      </div>

      <div>
        <label className="block font-medium">วิธีชำระเงิน</label>
        <select
          name="method"
          value={formData.method}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="CASH">เงินสด</option>
          <option value="TRANSFER">โอนเงิน</option>
          <option value="CHEQUE">เช็ค</option>
        </select>
      </div>

      <div>
        <label className="block font-medium">ประเภทการชำระเงิน</label>
        <div className="flex gap-4 pt-1">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="paymentType"
              value="PO_BASED"
              checked={formData.paymentType === 'PO_BASED'}
              onChange={handleChange}
            />
            ตามใบสั่งซื้อ (PO)
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="paymentType"
              value="ADVANCE"
              checked={formData.paymentType === 'ADVANCE'}
              onChange={handleChange}
            />
            ชำระล่วงหน้า
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="paymentType"
              value="CREDIT_NOTE"
              checked={formData.paymentType === 'CREDIT_NOTE'}
              onChange={handleChange}
            />
            เครดิตโน้ต
          </label>
        </div>
        {isAdvance && (
          <div className="text-yellow-600 text-sm mt-1">
            การชำระล่วงหน้าจะไม่หักเครดิต จนกว่าจะมีการรับสินค้าเข้าสต๊อกจริง
          </div>
        )}
      </div>

      {formData.paymentType === 'PO_BASED' && (
        <div>
          <label className="block font-medium mb-2">เลือก PO ที่ต้องการชำระ</label>
          <div className="space-y-2">
            {purchaseOrders.map((po) => (
              <div key={po.id} className="flex items-center gap-2">
                <div className="flex-1">
                  <span className="block text-sm">{po.code} - คงเหลือ {po.totalAmount?.toLocaleString()} ฿</span>
                </div>
                <input
                  type="number"
                  placeholder="ยอดที่ชำระ"
                  min="0"
                  className="border px-2 py-1 w-32 rounded"
                  onChange={(e) => handlePoAmountChange(po.id, e.target.value)}
                />
              </div>
            ))}
          </div>
          <div className="text-sm text-gray-600 mt-2">
            ยอดรวมจากใบสั่งซื้อ: {calculateTotalFromPOs().toLocaleString()} บาท
          </div>
        </div>
      )}

      <div>
        <label className="block font-medium">หมายเหตุ (ถ้ามี)</label>
        <textarea
          name="note"
          value={formData.note}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          rows="3"
        />
      </div>

      {error && <div className="text-red-600">{error}</div>}

      <div className="pt-2">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          บันทึกการชำระเงิน
        </button>
      </div>
    </form>
  );
};

export default SupplierPaymentForm;


