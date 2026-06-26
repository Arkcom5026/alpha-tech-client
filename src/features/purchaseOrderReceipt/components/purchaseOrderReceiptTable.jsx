// src/features/purchaseOrderReceipt/components/purchaseOrderReceiptTable.jsx
// 🏛️ Next-Gen Receipt Table: (Glassmorphic Accent, Aurora Badges, Spring Buttons & Stable Routing)
import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ClipboardCheck, Layers, Calendar, User, SlidersHorizontal, AlertCircle } from 'lucide-react';

const formatDateTh = (value) => {
  try {
    if (!value) return '-';
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return '-';
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d);
  } catch {
    return '-';
  }
};

const normalizeStatus = (status) => String(status || '').toUpperCase();



// 🎨 🟢 [AURORA CAPSULE BADGES] ปรับแต่งป้ายสเตตัสให้มนโค้งพาสเทล พร้อมจุดไฟ Breathing Pulse นุ่มนวล
const renderStatusBadge = (statusRaw) => {
  const s = normalizeStatus(statusRaw);
  if (s === 'PENDING') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-700 border border-slate-200 select-none">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-pulse" /> รอดำเนินการ
      </span>
    );
  }
  if (s === 'PARTIALLY_RECEIVED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500/10 text-amber-700 border border-amber-500/20 select-none">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" style={{ animationDuration: '2s' }} /> รับบางส่วน
      </span>
    );
  }
  if (s === 'COMPLETED' || s === 'RECEIVED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-500/20 select-none">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> จบกระบวนการ
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-500/15 select-none">
      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> ยกเลิก
    </span>
  );
};

const canReceive = (po) => {
  const s = normalizeStatus(po?.status);
  return s === 'PENDING' || s === 'PARTIALLY_RECEIVED';
};

const PurchaseOrderReceiptTable = ({ purchaseOrders, loading }) => {
  const navigate = useNavigate();
  const { shopSlug } = useParams(); // 🚀 [MATCH ROUTE] ดึงพารามิเตอร์ Slug ร้านค้ามาใช้คุมเส้นทางย่อยให้สมบูรณ์แบบ
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = useMemo(() => {
    const list = Array.isArray(purchaseOrders) ? purchaseOrders : [];
    const q = String(searchText || '').trim().toLowerCase();

    return list.filter((po) => {
      const supplierName = String(po?.supplier?.name || '').toLowerCase();
      const poCode = String(po?.code || po?.poNumber || '').toLowerCase();

      const matchText = !q || supplierName.includes(q) || poCode.includes(q);
      const matchStatus =
        statusFilter === 'ALL' || normalizeStatus(po?.status) === normalizeStatus(statusFilter);

      return matchText && matchStatus;
    });
  }, [purchaseOrders, searchText, statusFilter]);

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.01)] bg-white">
      
      {/* 🟦 TOP CONTROL CONTAINER: กล่องจัดชุดกรองดีไซน์สีกระจกฝ้า สบายตา ลื่นไหล */}
      <div className="flex justify-between items-center p-4 flex-wrap gap-4 bg-slate-50/70 border-b border-slate-100">
        <div className="relative">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหา Supplier / เลขที่ใบสั่งซื้อ..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="pl-10 pr-4 py-2 w-64 bg-white border border-slate-200 focus:border-orange-500 text-sm font-bold rounded-xl outline-none transition-all shadow-inner"
          />
        </div>

        {/* Radio Filter Group มนขอบพรีเมียม */}
        <div className="flex items-center gap-4 text-xs sm:text-sm flex-wrap font-black text-slate-600 bg-white border border-slate-200 px-4 py-1.5 rounded-xl shadow-sm select-none">
          <span className="text-slate-400 font-bold flex items-center gap-1 shrink-0"><SlidersHorizontal className="w-3.5 h-3.5" /> ตัวกรอง:</span>
          
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-900 transition-colors">
            <input
              type="radio"
              name="poReceiptStatusFilter"
              value="ALL"
              checked={statusFilter === 'ALL'}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-4 h-4 text-orange-500 border-slate-300 accent-orange-500 cursor-pointer"
            />
            <span>ทั้งหมด</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-900 transition-colors">
            <input
              type="radio"
              name="poReceiptStatusFilter"
              value="PENDING"
              checked={statusFilter === 'PENDING'}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-4 h-4 text-orange-500 border-slate-300 accent-orange-500 cursor-pointer"
            />
            <span>รอดำเนินการ</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-900 transition-colors">
            <input
              type="radio"
              name="poReceiptStatusFilter"
              value="PARTIALLY_RECEIVED"
              checked={statusFilter === 'PARTIALLY_RECEIVED'}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-4 h-4 text-orange-500 border-slate-300 accent-orange-500 cursor-pointer"
            />
            <span>รับบางส่วน</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-900 transition-colors">
            <input
              type="radio"
              name="poReceiptStatusFilter"
              value="COMPLETED"
              checked={statusFilter === 'COMPLETED'}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-4 h-4 text-orange-500 border-slate-300 accent-orange-500 cursor-pointer"
            />
            <span>จบกระบวนการ</span>
          </label>
        </div>
      </div>

      {/* 📊 TABLE LAYOUT: จัดรูปฟอนต์ตารางและขอบบรรทัดให้โปร่งตา เนียนพิกเซล */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-black uppercase tracking-wider select-none">
              <th className="px-4 py-3.5 w-12 text-center">#</th>
              <th className="px-4 py-3.5"><Calendar className="w-3.5 h-3.5 inline mr-1" /> วันที่ออกเอกสาร</th>
              <th className="px-4 py-3.5">เลขที่ใบสั่งซื้อ</th>
              <th className="px-4 py-3.5"><User className="w-3.5 h-3.5 inline mr-1" /> Supplier</th>
              <th className="px-4 py-3.5"><Layers className="w-3.5 h-3.5 inline mr-1" /> สถานะ</th>
              <th className="px-4 py-3.5 text-center">การจัดการคลังพัสดุ</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td className="px-4 py-12 text-center text-slate-400 font-bold select-none" colSpan={6}>
                  <div className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    <span>กำลังโหลดและเชื่อมท่อ Live API หลังบ้าน...</span>
                  </div>
                </td>
              </tr>
            )}

            {!loading && filtered.length === 0 && (
              <tr>
                <td className="px-4 py-12 text-center text-slate-400 font-bold italic text-sm select-none" colSpan={6}>
                  ไม่พบข้อมูลเอกสารใบสั่งซื้อที่ตรงกับเงื่อนไขตัวกรองในปัจจุบัน
                </td>
              </tr>
            )}

            {!loading &&
              filtered.map((po, index) => {
                const disabled = !canReceive(po);
                return (
                  <tr key={po.id} className="hover:bg-slate-50/80 transition-colors duration-150 group">
                    <td className="px-4 py-3.5 text-center font-bold text-slate-400 text-xs">{index + 1}</td>
                    <td className="px-4 py-3.5 text-slate-500 font-semibold">{formatDateTh(po?.createdAt)}</td>
                    <td className="px-4 py-3.5 font-black text-slate-900 tracking-tight group-hover:text-orange-500 transition-colors">
                      {po?.code || po?.poNumber || '-'}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-700">{po?.supplier?.name || '-'}</td>
                    <td className="px-4 py-3.5">{renderStatusBadge(po?.status)}</td>
                    
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                        {/* 🎨 🟢 [SPRING PHYSICS BUTTON] ปุ่มตรวจรับแบบ Slate Dark-Mirror สั่นไหวเด้งสู้เมาส์อย่างหรูหรา */}
                        <button
                          disabled={disabled}
                          onClick={() => {
                            if (disabled) return;
                            const targetSlug = shopSlug || 'advancetech';
                            navigate(`/${targetSlug}/pos/purchases/receipt/create/${po.id}`);
                          }}
                          className={`px-4 py-1.5 rounded-xl text-xs font-black border tracking-wide transition-all duration-300 ease-out transform active:scale-95 flex items-center gap-1 shadow-sm ${
                            disabled
                              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed shadow-none'
                              : 'bg-slate-800 hover:bg-slate-900 text-white border-slate-900 hover:border-black hover:-translate-y-0.5 hover:shadow-orange-500/10'
                          }`}
                        >
                          <ClipboardCheck className="w-3.5 h-3.5" />
                          <span>ตรวจรับ</span>
                        </button>

                        {disabled && (
                          <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-2 py-1 rounded-md flex items-center gap-1 select-none">
                            <AlertCircle className="w-3 h-3 text-slate-400" />
                            บิลนี้เสร็จสมบูรณ์แล้ว
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PurchaseOrderReceiptTable;