// BillPrintOptions.jsx (New Component)
import React from 'react';

const BillPrintOptions = ({ saleOption, setSaleOption, hideNoneOption = false }) => {
  return (

    <div className="space-y-3 pl-3 text-base text-gray-700">

      {!hideNoneOption && (
        <label className="flex items-center">
          <input type="radio" value="NONE" checked={saleOption === 'NONE'} onChange={(e) => setSaleOption(e.target.value)} className="form-radio text-blue-600 mr-2 w-4 h-4" />
          ไม่พิมพ์บิล
        </label>
      )}
      <div className='flex justify-between'>
        <label className="flex items-center">
          <input type="radio" value="RECEIPT" checked={saleOption === 'RECEIPT'} onChange={(e) => setSaleOption(e.target.value)} className="form-radio text-blue-600 mr-2 w-4 h-4" />
          ใบกำกับภาษีอย่างย่อ
        </label>
       
        <label className="flex items-center pl-3">
          <input type="radio" value="TAX_INVOICE" checked={saleOption === 'TAX_INVOICE'} onChange={(e) => setSaleOption(e.target.value)} className="form-radio text-blue-600 mr-2  w-4 h-4" />
          ใบกำกับภาษีเต็มรูป
        </label>
      </div>

    </div>


  );
};

export default BillPrintOptions;




