// PaymentMethodInput.jsx (Refactored to include 3 static inputs)
import React from 'react';

const PaymentMethodInput = ({ cash, transfer, credit, onCashChange, onTransferChange, onCreditChange }) => {
  return (
    <div className=" gap-4 ">
      {/* เงินสด */}
      <div className="min-w-[200px] rounded-xl shadow-sm border bg-green-50 border-green-100 px-3 py-3">
        <h3 className="text-base font-bold text-gray-800 mb-1">เงินสด</h3>
        <input
          type="number"
          className="w-full h-[50px] border border-gray-300 rounded-md px-3 py-3 text-2xl text-right font-bold text-green-700 focus:ring-2 focus:ring-green-500 shadow-sm"
          placeholder="0.00"
          value={cash}
          onChange={onCashChange}
        />
        {/* </div> */}

        {/* เงินโอน */}

        <div className='py-2'>
          <h3 className="text-base font-bold text-gray-800 mb-1 ">เงินโอน</h3>
          <input
            type="number"
            className="w-full h-[50px] border border-gray-300 rounded-md px-3 py-2 text-2xl text-right font-bold text-sky-700 focus:ring-2 focus:ring-sky-500 shadow-sm"
            placeholder="0.00"
            value={transfer}
            onChange={onTransferChange}
          />
        </div>


        {/* บัตรเครดิต */}
        <div className='py-2'>
          <h3 className="text-base font-bold text-gray-800 mb-1">บัตรเครดิต</h3>
          <input
            type="number"
            className="w-full h-[50px] border border-gray-300 rounded-md px-3 py-2 text-2xl text-right font-bold text-yellow-700 focus:ring-2 focus:ring-yellow-500 shadow-sm"
            placeholder="0.00"
            value={credit}
            onChange={onCreditChange}
          />
        </div>

        {/* เลขอ้างอิงบัตรเครดิต */}
        <div className='py-1'>

          <input
            type="text"
            className="w-full h-[50px] border border-gray-300 rounded-md px-3 py-2 text-xl text-right font-medium text-gray-700 focus:ring-2 focus:ring-yellow-400 shadow-sm"
            placeholder="กรอกเลขอ้างอิง..."
          />
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodInput;


