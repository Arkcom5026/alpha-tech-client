import React, { useState } from 'react';
import useCustomerStore from '@/features/customer/store/customerStore';
import useCustomerDepositStore from '../store/customerDepositStore';

// --- 🎨 Sub-Component: PaymentMethodInput ---
// This component is designed to be a flexible input for various payment methods.
// It could potentially be moved to a shared components folder if reused elsewhere.
const PaymentMethodInput = ({ title, value, onChange, placeholder, disabled }) => (
  <div>
    <label className="block text-lg font-semibold text-gray-700">{title}</label>
    <input
      type="number" // Ensures numeric input
      min="0" // Prevents negative numbers
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="mt-1 w-full border rounded-md px-4 py-3 text-2xl text-right font-bold text-gray-800 disabled:bg-gray-100 disabled:cursor-not-allowed"
      onFocus={(e) => e.target.select()} // Selects all text on focus for easy editing
    />
  </div>
);

/**
 * Component: PaymentSectionDeposit
 * วัตถุประสงค์: จัดการการกรอกจำนวนเงินและเลือกวิธีการชำระเงินในรูปแบบใหม่
 * ที่เหมือนกับหน้า Sale เพื่อให้ผู้ใช้สามารถจ่ายได้หลายช่องทางพร้อมกัน
 *
 * การปรับปรุง:
 * - เพิ่มการจัดการข้อผิดพลาดในการส่งข้อมูล (submitError) และแสดงผลบน UI
 * - เพิ่ม min="0" ให้กับ input type="number" ใน PaymentMethodInput เพื่อป้องกันค่าติดลบ
 */
const PaymentSectionDeposit = () => {
  // State สำหรับจำนวนเงินในแต่ละประเภท
  const [cashAmount, setCashAmount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [cardAmount, setCardAmount] = useState('');

  // State สำหรับเปิด/ปิดการใช้งานแต่ละช่องทาง
  const [isCashEnabled, setIsCashEnabled] = useState(true);
  const [isTransferEnabled, setIsTransferEnabled] = useState(false);
  const [isCardEnabled, setIsCardEnabled] = useState(false);

  // State สำหรับจัดการข้อผิดพลาดในการส่งข้อมูล
  const [submitError, setSubmitError] = useState('');

  const { customer } = useCustomerStore();
  const { createCustomerDepositAction, isSubmitting } = useCustomerDepositStore();

  // คำนวณยอดรวมทั้งหมด
  const total = (Number(cashAmount) || 0) + (Number(transferAmount) || 0) + (Number(cardAmount) || 0);
  
  // ตรวจสอบเงื่อนไขการปิดใช้งานปุ่มส่งข้อมูล
  const isSubmitDisabled = !customer || total <= 0 || isSubmitting;

  // ฟังก์ชันสำหรับการส่งข้อมูลเงินมัดจำ
  const handleSubmit = async () => {
    setSubmitError(''); // เคลียร์ข้อผิดพลาดเก่า
    if (isSubmitDisabled) {
      if (!customer) {
        setSubmitError('กรุณาเลือกลูกค้าก่อนบันทึกเงินมัดจำ');
      } else if (total <= 0) {
        setSubmitError('ยอดรวมเงินมัดจำต้องมากกว่า 0');
      }
      return;
    }

    try {
      await createCustomerDepositAction({
        customerId: customer.id,
        cashAmount: isCashEnabled ? (Number(cashAmount) || 0) : 0,
        transferAmount: isTransferEnabled ? (Number(transferAmount) || 0) : 0,
        cardAmount: isCardEnabled ? (Number(cardAmount) || 0) : 0,
        totalAmount: total,
      });
      // รีเซ็ตฟอร์มหลังจากส่งข้อมูลสำเร็จ
      setCashAmount('');
      setTransferAmount('');
      setCardAmount('');
      setIsCashEnabled(true);
      setIsTransferEnabled(false);
      setIsCardEnabled(false);
      alert('บันทึกเงินมัดจำสำเร็จ!'); // แจ้งเตือนผู้ใช้
    } catch (error) {
      console.error('Failed to submit deposit:', error);
      setSubmitError('เกิดข้อผิดพลาดในการบันทึกเงินมัดจำ กรุณาลองอีกครั้ง'); // แสดงข้อผิดพลาดที่เข้าใจง่าย
    }
  };
  
  // ฟังก์ชันสำหรับจัดรูปแบบตัวเลขให้เป็นทศนิยม 2 ตำแหน่ง
  const formatNumber = (numStr) => {
    const number = parseFloat(numStr);
    return isNaN(number) ? '0.00' : number.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border w-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">ระบุยอดเงินมัดจำ</h2>
      
      {/* Checkbox Controls สำหรับเปิด/ปิดช่องทางการชำระเงิน */}
      <div className="flex items-center gap-6 border-b pb-4 mb-4 text-gray-700">
        <label className="flex items-center text-lg cursor-pointer">
          <input type="checkbox" checked={isCashEnabled} onChange={() => setIsCashEnabled(!isCashEnabled)} className="form-checkbox h-5 w-5 mr-2" />
          เงินสด
        </label>
        <label className="flex items-center text-lg cursor-pointer">
          <input type="checkbox" checked={isTransferEnabled} onChange={() => setIsTransferEnabled(!isTransferEnabled)} className="form-checkbox h-5 w-5 mr-2" />
          เงินโอน
        </label>
        <label className="flex items-center text-lg cursor-pointer">
          <input type="checkbox" checked={isCardEnabled} onChange={() => setIsCardEnabled(!isCardEnabled)} className="form-checkbox h-5 w-5 mr-2" />
          บัตรเครดิต
        </label>
      </div>

      {/* Grid Layout สำหรับช่องกรอกเงินและสรุปยอด */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Payment Inputs Area (ส่วนกรอกจำนวนเงิน) */}
        <div className="space-y-4">
          {isCashEnabled && <PaymentMethodInput title="เงินสด" value={cashAmount} onChange={setCashAmount} placeholder="0.00" />}
          {isTransferEnabled && <PaymentMethodInput title="เงินโอน" value={transferAmount} onChange={setTransferAmount} placeholder="0.00" />}
          {isCardEnabled && <PaymentMethodInput title="บัตรเครดิต" value={cardAmount} onChange={setCardAmount} placeholder="0.00" />}
        </div>

        {/* Summary and Submit Area (ส่วนสรุปยอดและปุ่มบันทึก) */}
        <div className="md:col-span-2 bg-slate-50 p-4 rounded-lg flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">สรุปยอด</h3>
            <div className="space-y-2 text-gray-700 text-lg">
              {isCashEnabled && <div className="flex justify-between"><span>เงินสด:</span> <span className="font-semibold">{formatNumber(cashAmount)}</span></div>}
              {isTransferEnabled && <div className="flex justify-between"><span>เงินโอน:</span> <span className="font-semibold">{formatNumber(transferAmount)}</span></div>}
              {isCardEnabled && <div className="flex justify-between"><span>บัตรเครดิต:</span> <span className="font-semibold">{formatNumber(cardAmount)}</span></div>}
            </div>
            <hr className="my-4" />
            <div className="flex justify-between items-center text-2xl font-bold text-blue-600">
                <span>รวมทั้งหมด:</span>
                <span>{formatNumber(total)}</span>
            </div>
          </div>
          {/* แสดงข้อผิดพลาดในการส่งข้อมูล */}
          {submitError && (
            <div className="bg-red-100 text-red-700 border border-red-300 px-4 py-2 rounded text-lg mt-4">
              ⚠️ {submitError}
            </div>
          )}
          <button
              disabled={isSubmitDisabled}
              onClick={handleSubmit}
              className="w-full mt-6 px-4 py-4 bg-blue-600 text-white font-bold text-lg rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all"
          >
              {isSubmitting ? 'กำลังบันทึก...' : '💾 บันทึกเงินมัดจำ'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSectionDeposit;
