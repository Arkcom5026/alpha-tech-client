// src/features/supplier/components/SupplierTable.jsx
// 🏛️ Premium Next-Gen Influx Registry Terminal: (Extreme Simplicity & Pure Row-Click Edition)

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search, Plus, Building2, ShieldCheck } from 'lucide-react';

const SupplierTable = ({ suppliers = [], onDelete }) => {
  const navigate = useNavigate();
  const { shopSlug } = useParams();
  const [searchTerm, setSearchTerm] = useState('');

  const targetSlug = shopSlug || 'advancetech';

  const filteredSuppliers = suppliers.filter((supplier) =>
    (supplier?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden animate-fadeIn text-xs md:text-sm">
      
      {/* 🟦 1. ส่วนหัวควบคุมและช่องค้นหาด่วน (Extreme Simplicity Header) */}
      <div className="p-3 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-slate-50/50 select-none">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-slate-900/5 rounded-lg text-slate-800">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs md:text-sm font-black text-slate-900">ทะเบียนรายชื่อผู้ขาย (Suppliers)</h2>
            <p className="text-[10px] md:text-[11px] text-slate-400 font-medium">บริหารจัดการคู่ค้า วงเงินเครดิตหมุนเวียน และรอบดิวชำระเงินส่วนกลาง</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาชื่อคู่ค้าด่วน..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 pl-8 pr-3 text-xs font-bold bg-white border border-slate-200 focus:border-orange-500 rounded-lg outline-none w-full transition-all shadow-inner"
            />
          </div>
          <button
            type="button"
            onClick={() => navigate(`/${targetSlug}/pos/purchases/suppliers/create`)}
            className="h-8 px-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-lg active:scale-95 transition-all shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>เพิ่มผู้ขายใหม่</span>
          </button>
        </div>
      </div>

      {/* 🟦 2. ตารางข้อมูลความเร็วสูง (Pure Row-Click Text Data Table) */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black uppercase tracking-wider select-none text-[10px]">
              <th className="p-2.5 pl-5">ชื่อ Supplier / บริษัทคู่ค้า</th>
              <th className="p-2.5">เบอร์โทรศัพท์</th>              
              <th className="p-2.5">อีเมลติดต่อ</th>
              <th className="p-2.5 text-right pr-8">วงเงินสูงสุด</th>
              <th className="p-2.5 text-right pr-8">ยอดหนี้ปัจจุบัน</th>
              <th className="p-2.5 text-center pr-4">เครดิตดิว</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-semibold text-slate-600 text-[11px] sm:text-xs">
            {filteredSuppliers.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-10 text-center text-slate-400 italic font-bold select-none">
                  📭 ไม่พบข้อมูลรายชื่อบริษัทคู่ค้าในบัญชีระบบปัจจุบัน
                </td>
              </tr>
            ) : (
              filteredSuppliers.map((supplier) => (
                <tr 
                  key={supplier.id} 
                  /* 🟢 [INTENT ROW CLICK]: คลิกตรงไหนบนแถวก็ได้เพื่อวาร์ปเข้าหน้าดูรายละเอียดทันที ไม่ต้องเล็งเป้ากดปุ่มเล็ก ๆ */
                  onClick={() => navigate(`/${targetSlug}/pos/purchases/suppliers/view/${supplier.id}`)}
                  className="hover:bg-slate-100/70 transition-colors border-t border-slate-100 cursor-pointer active:bg-slate-200/50"
                >
                  {/* ชื่อ Supplier - เน้นน้ำหนักสีเข้มและเพิ่มขีดล่างสไตล์ลิงก์นุ่มนวลชวนให้คลิก */}
                  <td className="p-2.5 pl-5 font-black text-slate-900 max-w-[280px] truncate hover:text-orange-600 hover:underline transition-colors" title={supplier.name}>
                    {supplier.name}
                  </td>
                  
                  {/* เบอร์โทรศัพท์ */}
                  <td className="p-2.5 font-mono text-slate-600 tracking-tight select-all" onClick={(e) => e.stopPropagation()}>
                    {supplier.phone || '—'}
                  </td>                  
                  
                  {/* อีเมลติดต่อ */}
                  <td className="p-2.5 text-slate-500 truncate max-w-[180px]" title={supplier.email}>
                    {supplier.email || '—'}
                  </td>
                  
                  {/* วงเงินสูงสุด */}
                  <td className="p-2.5 text-right pr-8 font-mono font-bold text-slate-900">
                    {supplier.creditLimit ? supplier.creditLimit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'} <span className="text-[10px] text-slate-400 font-sans ml-0.5">฿</span>
                  </td>
                  
                  {/* ยอดหนี้ปัจจุบัน */}
                  <td className="p-2.5 text-right pr-8 font-mono font-bold text-blue-600">
                    {supplier.creditBalance ? supplier.creditBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'} <span className="text-[10px] text-slate-400 font-sans ml-0.5">฿</span>
                  </td>
                  
                  {/* วันเครดิต */}
                  <td className="p-2.5 text-center pr-4 font-mono">
                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200/60 font-bold text-[10px]">
                      {supplier.paymentTerms || 0} วัน
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 🟦 3. แถบบาร์ท้ายตารางเพื่อความปลอดภัย (System Info Strip) */}
      <div className="p-2 bg-slate-50/60 border-t border-slate-100 text-[10px] font-bold text-slate-400 flex items-center gap-1 select-none pl-5">
        <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
        <span>ข้อมูลทะเบียนคู่ค้าส่วนกลาง · คลิกที่แถวข้อมูลผู้ขายเพื่อเรียกดูรายละเอียดองค์รวมอย่างรวดเร็ว</span>
      </div>

    </div>
  );
};

export default SupplierTable;