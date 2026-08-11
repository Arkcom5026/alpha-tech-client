import React from 'react';
import { formatTaxMoney } from '../utils/inputTaxReceiptLink';

const columns = [
  ['subtotalAmount', 'ก่อนภาษีมูลค่าเพิ่ม'],
  ['vatAmount', 'ภาษีมูลค่าเพิ่ม'],
  ['totalAmount', 'ยอดรวม'],
];

const InputTaxAllocationSummary = ({ projection }) => {
  if (!projection) return null;

  return (
    <div className={`overflow-hidden rounded-2xl border ${projection.overflow ? 'border-rose-300 bg-rose-50' : 'border-blue-200 bg-white'}`}>
      <div className="border-b border-inherit px-4 py-3">
        <h2 className="font-black text-slate-900">ตรวจสอบยอดก่อนผูกใบรับสินค้า</h2>
        <p className="text-xs text-slate-500">ระบบรวมยอดที่ผูกไว้แล้วกับใบรับสินค้าที่กำลังเลือก เพื่อป้องกันการใช้ยอดเกินใบกำกับภาษี</p>
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
              ['limits', 'ยอดตามใบกำกับภาษีซื้อ'],
              ['existing', 'ผูกไว้แล้ว'],
              ['pending', 'กำลังจะผูกเพิ่ม'],
              ['projected', 'ยอดรวมหลังยืนยัน'],
            ].map(([key, label]) => (
              <tr key={key} className={key === 'projected' ? 'font-black text-slate-900' : 'text-slate-600'}>
                <td className="p-3">{label}</td>
                {columns.map(([field]) => <td key={field} className="p-3 text-right">{formatTaxMoney(projection[key][field])}</td>)}
              </tr>
            ))}
            <tr className={projection.overflow ? 'font-black text-rose-700' : 'font-bold text-emerald-700'}>
              <td className="p-3">ยอดคงเหลือที่ยังผูกได้</td>
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
          ยอดที่กำลังจะผูกเกินยอดใบกำกับภาษีซื้อ กรุณาปรับรายการก่อนยืนยัน
        </p>
      )}
    </div>
  );
};

export default InputTaxAllocationSummary;
