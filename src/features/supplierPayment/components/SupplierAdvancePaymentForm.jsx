import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import { feedback } from '@/design-system/feedback';
import useSupplierPaymentStore from '../store/supplierPaymentStore';
import SupplierPaymentHistoryTable from './SupplierPaymentHistoryTable';

dayjs.locale('th');

const PaymentSuccessView = ({ payload, onPrint, onGoBack }) => (
  <div className="rounded-lg border-l-4 border-green-500 bg-green-100 p-6 text-center text-green-700 shadow-md" role="alert">
    <strong className="block text-xl font-bold">บันทึกสำเร็จ!</strong>
    <p className="mt-2">บันทึกการชำระเงินล่วงหน้าจำนวน {payload.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} บาท เรียบร้อยแล้ว</p>
    <div className="mt-6 flex justify-center gap-4">
      <button onClick={onGoBack} className="rounded-lg bg-gray-500 px-6 py-2 font-semibold text-white hover:bg-gray-600">กลับไปที่รายการ</button>
      <button onClick={onPrint} className="rounded-lg bg-emerald-600 px-6 py-2 font-semibold text-white hover:bg-emerald-700">พิมพ์ใบสำคัญจ่าย</button>
    </div>
  </div>
);

const PaymentMethodInput = ({ label, value, onChange, onBlur, colorClass }) => {
  const textColor = {
    cash: 'text-green-700',
    transfer: 'text-sky-700',
    cheque: 'text-yellow-800',
  }[colorClass] || 'text-gray-800';

  return (
    <div>
      <label htmlFor="amount" className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <input
        id="amount"
        name="amount"
        type="text"
        className={`h-[42px] w-full rounded-md border-gray-300 px-3 py-2 text-right text-xl font-bold ${textColor} shadow-sm focus:ring-2 focus:ring-emerald-500`}
        placeholder="0.00"
        value={value}
        onChange={onChange}
        onBlur={onBlur}
      />
    </div>
  );
};

const SupplierAdvancePaymentForm = ({ supplier }) => {
  const navigate = useNavigate();
  const {
    createSupplierPaymentAction,
    fetchAdvancePaymentsBySupplierAction,
    advancePayments,
  } = useSupplierPaymentStore();

  const [formData, setFormData] = useState({
    paymentDate: dayjs().format('YYYY-MM-DD'),
    amount: '',
    method: 'CASH',
    note: '',
    chequeDetails: { number: '', bank: '', dueDate: '' },
  });
  const [error, setError] = useState(null);
  const [successPayload, setSuccessPayload] = useState(null);

  useEffect(() => {
    if (supplier?.id && fetchAdvancePaymentsBySupplierAction) {
      fetchAdvancePaymentsBySupplierAction(supplier.id);
    }
  }, [supplier?.id, fetchAdvancePaymentsBySupplierAction]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('chequeDetails.')) {
      const key = name.split('.')[1];
      setFormData((prev) => ({ ...prev, chequeDetails: { ...prev.chequeDetails, [key]: value } }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAmountChange = (e) => {
    const rawValue = e.target.value.replace(/,/g, '');
    if (!Number.isNaN(Number(rawValue)) || rawValue === '') {
      setFormData((prev) => ({ ...prev, amount: rawValue }));
    }
  };

  const handleAmountBlur = (e) => {
    const value = parseFloat(e.target.value.replace(/,/g, ''));
    setFormData((prev) => ({
      ...prev,
      amount: !Number.isNaN(value)
        ? value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessPayload(null);

    const parsedAmount = parseFloat(formData.amount.replace(/,/g, ''));
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('กรุณากรอกจำนวนเงินให้ถูกต้องและมากกว่าศูนย์');
      return;
    }

    const payload = {
      supplierId: supplier.id,
      paymentDate: formData.paymentDate,
      amount: parsedAmount,
      method: formData.method,
      note: formData.note,
      paymentType: 'ADVANCE',
      ...(formData.method === 'CHEQUE' && { chequeDetails: formData.chequeDetails }),
    };

    try {
      const response = await createSupplierPaymentAction(payload);
      setSuccessPayload(response);
      fetchAdvancePaymentsBySupplierAction?.(supplier.id);
    } catch (err) {
      setError(`เกิดข้อผิดพลาดในการบันทึกข้อมูล: ${err.message || 'Unknown error'}`);
    }
  };

  const handlePrintVoucher = () => {
    feedback.info(`กำลังพิมพ์ใบสำคัญจ่ายสำหรับรายการ: ${successPayload.id}`);
  };

  if (successPayload) {
    return <PaymentSuccessView payload={successPayload} onPrint={handlePrintVoucher} onGoBack={() => navigate(-1)} />;
  }

  const parsedAmountForValidation = parseFloat(String(formData.amount).replace(/,/g, ''));
  const isSubmitButtonDisabled = Number.isNaN(parsedAmountForValidation) || parsedAmountForValidation <= 0;

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-3">
          <div>
            <label htmlFor="paymentDate" className="mb-1 block text-sm font-medium text-gray-700">วันที่ชำระ</label>
            <input type="date" id="paymentDate" name="paymentDate" value={formData.paymentDate} onChange={handleChange} className="h-[42px] w-full rounded-md border-gray-300 px-3 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
          </div>
          <div>
            <label htmlFor="method" className="mb-1 block text-sm font-medium text-gray-700">วิธีชำระเงิน</label>
            <select id="method" name="method" value={formData.method} onChange={handleChange} className="h-[42px] w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100">
              <option value="CASH">เงินสด</option><option value="TRANSFER">โอนเงิน</option><option value="CHEQUE">เช็ค</option>
            </select>
          </div>
          <PaymentMethodInput
            label="จำนวนเงิน"
            value={formData.amount}
            onChange={handleAmountChange}
            onBlur={handleAmountBlur}
            colorClass={{ CASH: 'cash', TRANSFER: 'transfer', CHEQUE: 'cheque' }[formData.method]}
          />
        </div>

        {formData.method === 'CHEQUE' && (
          <div className="grid grid-cols-1 gap-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 md:grid-cols-3">
            <div><label className="mb-1 block text-sm font-medium text-gray-700">เลขที่เช็ค</label><input type="text" name="chequeDetails.number" value={formData.chequeDetails.number} onChange={handleChange} className="w-full rounded-md border-gray-300 shadow-sm" /></div>
            <div><label className="mb-1 block text-sm font-medium text-gray-700">ธนาคาร</label><input type="text" name="chequeDetails.bank" value={formData.chequeDetails.bank} onChange={handleChange} className="w-full rounded-md border-gray-300 shadow-sm" /></div>
            <div><label className="mb-1 block text-sm font-medium text-gray-700">วันที่บนเช็ค</label><input type="date" name="chequeDetails.dueDate" value={formData.chequeDetails.dueDate} onChange={handleChange} className="w-full rounded-md border-gray-300 shadow-sm" /></div>
          </div>
        )}

        <div><label htmlFor="note" className="mb-1 block text-sm font-medium text-gray-700">หมายเหตุ (ถ้ามี)</label><textarea id="note" name="note" value={formData.note} onChange={handleChange} className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" rows="3" placeholder="เพิ่มหมายเหตุเกี่ยวกับการชำระเงินล่วงหน้า" /></div>

        {error && <div className="rounded-lg border border-red-400 bg-red-100 px-4 py-3 text-red-700" role="alert">{error}</div>}

        <div className="flex justify-end pt-4">
          <button type="submit" className="rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700 disabled:bg-gray-400" disabled={isSubmitButtonDisabled}>บันทึกการชำระเงิน</button>
        </div>
      </form>

      <div className="mt-12">
        <h2 className="mb-4 text-xl font-bold text-gray-700">ประวัติการชำระเงิน</h2>
        <SupplierPaymentHistoryTable payments={advancePayments} />
      </div>
    </div>
  );
};

export default SupplierAdvancePaymentForm;