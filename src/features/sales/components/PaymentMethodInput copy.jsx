// PaymentMethodInput.jsx (New Component)
import React from 'react';

const PaymentMethodInput = ({ label, value, onChange, colorClass }) => {
  const bgColor = {
    cash: 'bg-green-50',
    transfer: 'bg-sky-50',
    credit: 'bg-yellow-50',
  }[colorClass];

  const borderColor = {
    cash: 'border-green-100',
    transfer: 'border-sky-100',
    credit: 'border-yellow-100',
  }[colorClass];

  const textColor = {
    cash: 'text-green-700',
    transfer: 'text-sky-700',
    credit: 'text-yellow-700',
  }[colorClass];

  return (
    <div className={`min-w-[250px] bg-white p-3 rounded-xl shadow-sm border ${bgColor} ${borderColor}`}>
      <h3 className="text-base font-bold text-gray-800 mb-1">{label.split(' ')[0]}</h3> {/* Extract "เงินสด", "เงินโอน", "บัตรเครดิต" */}      
      <div className=''>
        {/* <label className="block text-base font-bold text-gray-700 mb-1">{label}</label> */}
        <input
          type="number"
          className={`w-full h-[50px] border border-gray-300 rounded-md px-3 py-2 text-2xl text-right font-bold ${textColor} focus:ring-2 focus:ring-${colorClass}-500 shadow-sm`}
          placeholder="0.00"
          value={value}
          onChange={onChange}
        />
      </div>

    </div>
  );
};

export default PaymentMethodInput;