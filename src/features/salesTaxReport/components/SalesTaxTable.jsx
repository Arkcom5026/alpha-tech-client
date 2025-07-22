import React from 'react';
import { format } from 'date-fns';

const formatCurrency = (amount) => {
  if (typeof amount !== 'number') return '0.00';
  return new Intl.NumberFormat('th-TH', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const day = format(date, 'dd');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = format(date, 'yyyy');
  return `${day}/${month}/${year}`;
};

const SalesTaxTable = ({ title, items, type }) => {
  return (
    <div className="mb-8">
      <h3 className="text-base font-semibold text-gray-800 mb-3">{title}</h3>
      <div className="overflow-x-auto border ">
        <table className="min-w-full bg-white border border-gray-700 text-xs">
          <thead className="bg-gray-300 text-center">
            <tr>
              <th className="px-2 py-1  text-black border border-gray-700">วันที่</th>
              <th className="px-2 py-1  text-black border border-gray-700">เลขใบกำกับภาษี</th>
              <th className="px-2 py-1  text-black border border-gray-700">ชื่อลูกค้า</th>
              <th className="px-2 py-1  text-black border border-gray-700">เลขประจำตัวผู้เสียภาษี</th>
              <th className="px-2 py-1  text-black border border-gray-700">มูลค่าสินค้า</th>
              <th className="px-2 py-1  text-black border border-gray-700">ภาษีมูลค่าเพิ่ม</th>
              <th className="px-2 py-1  text-black border border-gray-700">รวมทั้งสิ้น</th>
            </tr>
          </thead>
          <tbody>
            {items && items.length > 0 ? (
              items.map((item, index) => (
                <tr
                  key={`${type}-${index}`}
                  className={type === 'returns' ? 'bg-red-50 text-red-700' : 'text-gray-700'}
                >
                  <td className="px-2 py-1 border border-gray-700">{formatDate(item.date)}</td>
                  <td className="px-2 py-1 border border-gray-700">{item.taxInvoiceNumber || '-'}</td>
                  <td className="px-2 py-1 border border-gray-700">{item.customerName || '-'}</td>
                  <td className="px-2 py-1 border border-gray-700">{item.taxId || '-'}</td>
                  <td className="px-2 py-1 text-right font-mono border border-gray-700">{formatCurrency(item.baseAmount)}</td>
                  <td className="px-2 py-1 text-right font-mono border border-gray-700">{formatCurrency(item.vatAmount)}</td>
                  <td className="px-2 py-1 text-right font-mono border border-gray-700">{formatCurrency(item.totalAmount)}</td>
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
            <tfoot className=" font-semibold">
              <tr>
                <td colSpan={4} className="px-2 py-2 text-right text-black border border-gray-700">
                  รวมก่อน VAT
                </td>
                <td className="px-2 py-2 text-right font-mono text-black border border-gray-700">
                  {formatCurrency(items.reduce((sum, item) => sum + item.baseAmount, 0))}
                </td>
                <td className="px-2 py-2 text-right font-mono text-black border border-gray-700">
                  {formatCurrency(items.reduce((sum, item) => sum + item.vatAmount, 0))}
                </td>
                <td className="px-2 py-2 text-right font-mono text- black border border-gray-700">
                  {formatCurrency(items.reduce((sum, item) => sum + item.totalAmount, 0))}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

export default SalesTaxTable;

