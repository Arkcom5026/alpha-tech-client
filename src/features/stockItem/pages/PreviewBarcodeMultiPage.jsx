// src/features/stockItem/pages/PreviewBarcodePage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import JsBarcode from 'jsbarcode';
import usePurchaseOrderReceiptStore from '@/features/purchaseOrderReceipt/store/purchaseOrderReceiptStore';

const PreviewBarcodePage = () => {
  const { id } = useParams();
  const { receiptItems, loadReceiptItemsByReceiptId } = usePurchaseOrderReceiptStore();

  useEffect(() => {
    if (id) {
      loadReceiptItemsByReceiptId(Number(id));
    }
  }, [id, loadReceiptItemsByReceiptId]);

  const renderBarcode = (text) => {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, text, {
      format: 'CODE128',
      width: 2,
      height: 80,
      displayValue: true,
    });
    return canvas.toDataURL();
  };

  return (
    <div className="p-4 print:p-0">
      <div className="print:hidden mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">ตัวอย่างบาร์โค้ดใบเดียว</h2>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          พิมพ์ทั้งหมด
        </button>
      </div>

      {receiptItems.length === 0 ? (
        <p className="text-center text-gray-500 mt-8">ไม่มีรายการบาร์โค้ดจากใบรับสินค้าที่เลือก</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 print:grid-cols-5">
          {receiptItems.map((item) => {
            const barcodes = Array.from({ length: item.quantity }, (_, i) => {
              const sn = String(item.baseSerialNumber + i).padStart(8, '0');
              return (
                <div key={`${item.id}-${i}`} className="border p-2 flex flex-col items-center">
                  <img src={renderBarcode(sn)} alt={sn} />
                  <p className="text-[10px] mt-1 text-center leading-tight">
                    {item.purchaseOrderItem?.product?.title || '-'}<br />
                    SN: {sn}
                  </p>
                </div>
              );
            });
            return barcodes;
          })}
        </div>
      )}
    </div>
  );
};

export default PreviewBarcodePage;
