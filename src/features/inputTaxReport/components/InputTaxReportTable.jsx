// InputTaxReportTable.jsx (ปรับโครงสร้างให้เป็นมาตรฐานเดียวกับ SalesTaxTable)

import React from 'react';

const formatCurrency = (amount) => {
  const num = Number(amount);
  if (isNaN(num)) return '0.00';
  return num.toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('th-TH');
};

const InputTaxReportTable = ({ items = [], type }) => {
  return (
    <div className="mb-8">
      
      <div className="overflow-x-auto border">
        <table className="min-w-full bg-white border border-gray-700 text-xs">
          <thead className="bg-gray-300">
            <tr>
              <th className="px-2 py-1 text-black border border-gray-700">วันที่</th>
              <th className="px-2 py-1 text-black border border-gray-700">เลขที่ใบกำกับภาษี</th>
              <th className="px-2 py-1 text-black border border-gray-700">ชื่อผู้ขาย</th>
              <th className="px-2 py-1 text-black border border-gray-700">เลขประจำตัวผู้เสียภาษี</th>
              <th className="px-2 py-1 text-black border border-gray-700">มูลค่าสินค้า</th>
              <th className="px-2 py-1 text-black border border-gray-700">ภาษีมูลค่าเพิ่ม</th>
              <th className="px-2 py-1 text-black border border-gray-700">รวมทั้งสิ้น</th>
            </tr>
          </thead>
          <tbody>
            {items && items.length > 0 ? (
              items.map((item, index) => (
                <tr
                  key={`${type}-${index}`}
                  className={type === 'returns' ? 'bg-red-50 text-red-700' : 'text-gray-700'}
                >
                  <td className="px-2 py-1 border border-gray-700">{formatDate(item.supplierTaxInvoiceDate)}</td>
                  <td className="px-2 py-1 border border-gray-700">{item.supplierTaxInvoiceNumber || '-'}</td>
                  <td className="px-2 py-1 border border-gray-700">{item.supplierName || '-'}</td>
                  <td className="px-2 py-1 border border-gray-700">{item.supplierTaxId || '-'}</td>
                  <td className="px-2 py-1 text-right font-mono border border-gray-700">{formatCurrency(item.totalAmount)}</td>
                  <td className="px-2 py-1 text-right font-mono border border-gray-700">{formatCurrency(item.vatAmount)}</td>
                  <td className="px-2 py-1 text-right font-mono border border-gray-700">{formatCurrency(item.totalAmount + item.vatAmount)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-3 text-gray-500 border border-gray-700">
                  ไม่พบข้อมูล
                </td>
              </tr>
            )}
          </tbody>
          {items && items.length > 0 && (
            <tfoot className="font-semibold">
              <tr>
                <td colSpan={4} className="px-2 py-2 text-right text-black border border-gray-700">
                  รวมก่อน VAT
                </td>
                <td className="px-2 py-2 text-right font-mono text-black border border-gray-700">
                  {formatCurrency(items.reduce((sum, item) => sum + item.totalAmount, 0))}
                </td>
                <td className="px-2 py-2 text-right font-mono text-black border border-gray-700">
                  {formatCurrency(items.reduce((sum, item) => sum + item.vatAmount, 0))}
                </td>
                <td className="px-2 py-2 text-right font-mono text-black border border-gray-700">
                  {formatCurrency(items.reduce((sum, item) => sum + item.totalAmount + item.vatAmount, 0))}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

export default InputTaxReportTable;


