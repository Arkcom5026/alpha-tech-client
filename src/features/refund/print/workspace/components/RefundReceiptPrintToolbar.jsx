import React from 'react';

const RefundReceiptPrintToolbar = ({ onPrint }) => (
  <div className="text-right">
    <button
      type="button"
      onClick={onPrint}
      className="bg-blue-600 text-white px-4 py-1 rounded print:hidden"
    >
      พิมพ์
    </button>
  </div>
);

export default RefundReceiptPrintToolbar;
