// src/components/shared/input/PaymentInput.jsx
import React from 'react';

/**
 * Component: PaymentInput
 * วัตถุประสงค์: ช่องกรอกจำนวนเงินที่นำกลับมาใช้ซ้ำได้ พร้อมการจัดสไตล์และการจัดการค่า
 *
 * Props:
 * - title: ข้อความหัวข้อสำหรับช่องกรอก (เช่น "เงินสด", "ใช้มัดจำ")
 * - value: ค่าปัจจุบันของช่องกรอก
 * - onChange: ฟังก์ชันที่จะถูกเรียกเมื่อค่ามีการเปลี่ยนแปลง (จะส่งค่า `e.target.value` โดยตรง)
 * - placeholder: ข้อความ placeholder ในช่องกรอก
 * - color: ใช้สำหรับกำหนดชุดสีของ input (เช่น 'cash', 'transfer', 'credit', 'blue')
 */
const PaymentInput = ({ title, value, onChange, placeholder = "0.00", color }) => {
  // กำหนดคลาส Tailwind CSS ตาม prop 'color'
  const inputClasses = {
    cash: 'text-green-800 border-green-300 focus:ring-green-400 bg-green-50',
    transfer: 'text-sky-800 border-sky-300 focus:ring-sky-400 bg-sky-50',
    credit: 'text-yellow-800 border-yellow-300 focus:ring-yellow-400 bg-yellow-50',
    blue: 'text-blue-800 border-blue-300 focus:ring-blue-400 bg-blue-50',
  };

  const defaultClasses = 'text-gray-800 border-gray-300 focus:ring-blue-400';
  const selectedClasses = inputClasses[color] || defaultClasses;

  return (
    <div className="relative">
      <label className="block text-lg font-semibold text-gray-700 mb-1">{title}</label>
      <input
        type="number"
        min="0" // ป้องกันการกรอกค่าติดลบ
        value={value}
        // ✅ FIX: ส่งค่า e.target.value โดยตรงไปยัง onChange handler
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`mt-1 w-full border rounded-md px-4 py-3 text-2xl text-right font-bold focus:ring-2 shadow-sm
          ${selectedClasses}
        `}
        onFocus={(e) => e.target.select()} // เลือกข้อความทั้งหมดเมื่อ focus เพื่อให้แก้ไขง่าย
      />
    </div>
  );
};

export default PaymentInput;
