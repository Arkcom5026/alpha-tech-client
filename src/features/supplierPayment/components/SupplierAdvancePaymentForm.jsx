import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import useSupplierPaymentStore from '../store/supplierPaymentStore'; // โปรดตรวจสอบว่า path ถูกต้อง
import SupplierPaymentHistoryTable from './SupplierPaymentHistoryTable';

dayjs.locale('th');

// --- Sub-component: Success View ---
/**
 * Component: PaymentSuccessView
 * วัตถุประสงค์: แสดงผลหน้าจอเมื่อบันทึกข้อมูลสำเร็จ
 */
const PaymentSuccessView = ({ payload, onPrint, onGoBack }) => (
  <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-6 rounded-lg shadow-md text-center" role="alert">
    <strong className="font-bold text-xl block">บันทึกสำเร็จ!</strong>
    <p className="mt-2">บันทึกการชำระเงินล่วงหน้าจำนวน {payload.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} บาท เรียบร้อยแล้ว</p>
    <div className="mt-6 flex justify-center gap-4">
      <button onClick={onGoBack} className="bg-gray-500 text-white font-semibold px-6 py-2 rounded-lg hover:bg-gray-600">
        กลับไปที่รายการ
      </button>
      <button onClick={onPrint} className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-700">
        พิมพ์ใบสำคัญจ่าย
      </button>
    </div>
  </div>
);

// --- ✅ NEW Sub-component: PaymentMethodInput ---
/**
 * Component: PaymentMethodInput
 * วัตถุประสงค์: เป็น Input ที่ออกแบบมาสำหรับการกรอกจำนวนเงินโดยเฉพาะ
 */
const PaymentMethodInput = ({ label, value, onChange, onBlur, colorClass }) => {
  const textColor = {
    cash: 'text-green-700',
    transfer: 'text-sky-700',
    cheque: 'text-yellow-800',
  }[colorClass] || 'text-gray-800';

  return (
    <div>
      <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        id="amount"
        name="amount"
        type="text"
        className={`w-full h-[42px] border-gray-300 rounded-md px-3 py-2 text-xl text-right font-bold ${textColor} focus:ring-2 focus:ring-blue-500 shadow-sm`}
        placeholder="0.00"
        value={value}
        onChange={onChange}
        onBlur={onBlur}
      />
    </div>
  );
};


// --- Main Component ---
/**
 * Component: SupplierAdvancePaymentForm
 * วัตถุประสงค์: เป็น Component หลักสำหรับสร้างรายการชำระเงินล่วงหน้า
 * และแสดงประวัติการชำระเงิน
 */
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
    chequeDetails: {
      number: '',
      bank: '',
      dueDate: '',
    },
  });

  const [error, setError] = useState(null);
  const [successPayload, setSuccessPayload] = useState(null);

  // Effect: ดึงข้อมูลประวัติการชำระเงินเมื่อ component ถูก mount หรือ supplier เปลี่ยน
  useEffect(() => {
    if (supplier?.id && fetchAdvancePaymentsBySupplierAction) {
      fetchAdvancePaymentsBySupplierAction(supplier.id);
    }
  }, [supplier, fetchAdvancePaymentsBySupplierAction]);

  // --- Handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('chequeDetails.')) {
        const key = name.split('.')[1];
        setFormData(prev => ({
            ...prev,
            chequeDetails: { ...prev.chequeDetails, [key]: value }
        }));
    } else {
        setFormData({ ...formData, [name]: value });
    }
  };

  const handleAmountChange = (e) => {
    const rawValue = e.target.value.replace(/,/g, '');
    if (!isNaN(rawValue) || rawValue === '') {
      setFormData({ ...formData, amount: rawValue });
    }
  };

  const handleAmountBlur = (e) => {
    const value = parseFloat(e.target.value.replace(/,/g, ''));
    if (!isNaN(value)) {
        setFormData(prev => ({ ...prev, amount: value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }));
    } else {
        setFormData(prev => ({ ...prev, amount: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessPayload(null);

    const parsedAmount = parseFloat(formData.amount.replace(/,/g, ''));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return setError('กรุณากรอกจำนวนเงินให้ถูกต้องและมากกว่าศูนย์');
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
      if (fetchAdvancePaymentsBySupplierAction) {
        fetchAdvancePaymentsBySupplierAction(supplier.id);
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + (err.message || 'Unknown error'));
    }
  };
  
  const handlePrintVoucher = () => {
    alert(`กำลังพิมพ์ใบสำคัญจ่ายสำหรับรายการ: ${successPayload.id}`);
  };

  // --- Render Logic ---
  if (successPayload) {
    return <PaymentSuccessView payload={successPayload} onPrint={handlePrintVoucher} onGoBack={() => navigate(-1)} />;
  }

  const parsedAmountForValidation = parseFloat(String(formData.amount).replace(/,/g, ''));
  const isSubmitButtonDisabled = isNaN(parsedAmountForValidation) || parsedAmountForValidation <= 0;

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div>
            <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700 mb-1">วันที่ชำระ</label>
            <input type="date" id="paymentDate" name="paymentDate" value={formData.paymentDate} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm h-[42px] px-3"/>
          </div>
          <div>
            <label htmlFor="method" className="block text-sm font-medium text-gray-700 mb-1">วิธีชำระเงิน</label>
            <select id="method" name="method" value={formData.method} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm h-[42px]">
              <option value="CASH">เงินสด</option>
              <option value="TRANSFER">โอนเงิน</option>
              <option value="CHEQUE">เช็ค</option>
            </select>
          </div>
          {/* ✅ FIX: Replaced standard input with the new PaymentMethodInput component */}
          <div>
            <PaymentMethodInput
              label="จำนวนเงิน"
              value={formData.amount}
              onChange={handleAmountChange}
              onBlur={handleAmountBlur}
              colorClass={{
                CASH: 'cash',
                TRANSFER: 'transfer',
                CHEQUE: 'cheque',
              }[formData.method]}
            />
          </div>
        </div>

        {/* Cheque Details Section */}
        {formData.method === 'CHEQUE' && (
          <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">เลขที่เช็ค</label>
              <input type="text" name="chequeDetails.number" value={formData.chequeDetails.number} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ธนาคาร</label>
              <input type="text" name="chequeDetails.bank" value={formData.chequeDetails.bank} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">วันที่บนเช็ค</label>
              <input type="date" name="chequeDetails.dueDate" value={formData.chequeDetails.dueDate} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm"/>
            </div>
          </div>
        )}

        {/* Note Section */}
        <div>
          <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ (ถ้ามี)</label>
          <textarea id="note" name="note" value={formData.note} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm" rows="3" placeholder="เพิ่มหมายเหตุเกี่ยวกับการชำระเงินล่วงหน้า"/>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">{error}</div>
        )}
        
        {/* Submit Button */}
        <div className="pt-4 flex justify-end">
          <button type="submit" className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400" disabled={isSubmitButtonDisabled}>
            บันทึกการชำระเงิน
          </button>
        </div>
      </form>

      {/* History Table Section */}
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-4 text-gray-700">ประวัติการชำระเงิน</h2>
        <SupplierPaymentHistoryTable payments={advancePayments} />
      </div>
    </div>
  );
};

export default SupplierAdvancePaymentForm;
