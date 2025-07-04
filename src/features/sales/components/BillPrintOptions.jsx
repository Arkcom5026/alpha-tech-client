// BillPrintOptions.jsx (New Component)
import React from 'react';

const BillPrintOptions = ({ saleOption, setSaleOption }) => {
  return (
    <div className="flex-1 min-w-[250px] max-w-[300px] bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">ตัวเลือกการพิมพ์บิล:</h3>
      <div className="space-y-3 pl-3 text-base text-gray-700">
        <label className="block flex items-center">
          <input type="radio" value="NONE" checked={saleOption === 'NONE'} onChange={(e) => setSaleOption(e.target.value)} className="form-radio text-blue-600 mr-2" />
          ไม่พิมพ์บิล
        </label>
        <label className="block flex items-center">
          <input type="radio" value="RECEIPT" checked={saleOption === 'RECEIPT'} onChange={(e) => setSaleOption(e.target.value)} className="form-radio text-blue-600 mr-2" />
          ใบกำกับภาษี อย่างย่อ
        </label>
        <label className="block flex items-center">
          <input type="radio" value="TAX_INVOICE" checked={saleOption === 'TAX_INVOICE'} onChange={(e) => setSaleOption(e.target.value)} className="form-radio text-blue-600 mr-2" />
          ใบกำกับภาษี เต็มรูป
        </label>
      </div>
    </div>
  );
};

export default BillPrintOptions;