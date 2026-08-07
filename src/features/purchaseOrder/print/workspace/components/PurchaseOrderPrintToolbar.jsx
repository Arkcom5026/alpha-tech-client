import React from 'react';

const PurchaseOrderPrintToolbar = ({ onPrint, onDownloadPdf }) => (
  <div className="flex justify-end gap-2 p-4 print:hidden">
    <button
      type="button"
      onClick={onPrint}
      className="px-4 py-2 border rounded bg-white hover:bg-gray-50"
    >
      พิมพ์ใบสั่งซื้อ
    </button>

    <button
      type="button"
      onClick={onDownloadPdf}
      className="px-4 py-2 border rounded bg-white hover:bg-gray-50"
    >
      ดาวน์โหลด PDF
    </button>
  </div>
);

export default PurchaseOrderPrintToolbar;
