import React from 'react';
import { formatTaxMoney } from '../utils/inputTaxReceiptLink';

const columns = [
  ['subtotalAmount', 'ก่อน VAT'],
  ['vatAmount', 'VAT'],
  ['totalAmount', 'ยอดรวม'],
];

const InputTaxAllocationSummary = ({ projection }) => {
  if (!projection) return null;

  return (
    <div className={`overflow-hidden rounded-2xl border ${projection.overflow ? 'border-rose-300 bg-rose-50' : 'border-blue-200 bg-white'}`}>
      <div className="border-b border-inherit px-4 py-3">
        <h2 className="font-black text-slate-900">ตรวจยอดก่อนผูกใบรับสินค้า</h2>
        <p className="text-xs text-slate-500">ยอดที่ผูกอยู่แล้ว รวมกับใบรับที่กำลังเลือก</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-xs font-bold text-slate-500">
            <tr>
              <th className="p-3 text-left">รายการ</th>
              {columns.map(([, label]) => <th key={label} className="p-3 text-right">{label}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[
              ['limits', 'ยอดใบกำกับภาษี'],
              ['existing', 'ผูกอยู่แล้ว'],
              ['pending', 'กำลังเลือก'],
              ['projected', 'รวมหลังบันทึก'],
            ].map(([key, label]) => (
              <tr key={key} className={key === 'projected' ? 'font-black text-slate-900' : 'text-slate-600'}>
                <td className="p-3">{label}</td>
                {columns.map(([field]) => <td key={field} className="p-3 text-right">{formatTaxMoney(projection[key][field])}</td>)}
              </tr>
            ))}
            <tr className={projection.overflow ? 'font-black text-rose-700' : 'font-bold text-emerald-700'}>
              <td className="p-3">คงเหลือในใบกำกับภาษี</td>
              {columns.map(([field]) => (
                <td key={field} className="p-3 text-right">
                  {projection.remaining[field] == null ? 'ไม่กำหนดเพดาน' : formatTaxMoney(projection.remaining[field])}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      {projection.overflow && (
        <p className="border-t border-rose-200 px-4 py-3 text-sm font-bold text-rose-700">
          ยอดที่กำลังผูกเกินยอดใบกำกับภาษี กรุณาปรับยอดจัดสรรก่อนบันทึก
        </p>
      )}
    </div>
  );
};

export default InputTaxAllocationSummary;
