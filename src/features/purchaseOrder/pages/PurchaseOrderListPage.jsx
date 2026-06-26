// src/features/purchaseOrder/pages/PurchaseOrderListPage.jsx
// 🏛️ Premium Next-Gen PO List: (Fixed JSON Shape, Aurora Glow Action, Glassmorphism Filters & Micro Physics)
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; 
import { getPurchaseOrders } from '../api/purchaseOrderApi';
import { Plus, Search, Layers, Calendar, RefreshCw, FileText, User } from 'lucide-react';

export default function PurchaseOrderListPage() {
  const navigate = useNavigate(); 
  const { shopSlug } = useParams(); 

  const [historyList, setHistoryList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [showAllHistory, setShowAllHistory] = useState(false);

  useEffect(() => {
    const fetchCoreDataWithFilters = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const statusParam = showAllHistory 
          ? 'all' 
          : 'PENDING,PARTIALLY_RECEIVED';

        const response = await getPurchaseOrders({
          search: searchQuery,
          status: statusParam
        });
        
        // 🟢 [BUG FIX RESOLVED] สกัดแกะกล่องเจาะจงเข้าหาฟิลด์ .data ตัวจริงจากโครงสร้าง API v2 เพื่อเคลียร์บั๊กยอดเงินคงค้าง
        const actualList = response?.data || (Array.isArray(response) ? response : []);
        setHistoryList(actualList);
      } catch (err) {
        console.error('[UI Filter Binding Error]', err);
        setError(err.message || 'ไม่สามารถเรียกข้อมูลใบสั่งซื้อจากเซิร์ฟเวอร์หลักได้');
      } finally {
        setIsLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchCoreDataWithFilters();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, showAllHistory]);

  const handleNavigateToCreatePage = () => {
    navigate(`/${shopSlug}/pos/purchases/orders/create`);
  };

  // 🎨 [COMPSULE STATUS VISUAL] ยกระดับป้ายสถานะเป็นแคปซูลมนพาสเทลนุ่มนวล พร้อมจุดเรืองแสงไดนามิก
  const renderStatusBadge = (status) => {
    const s = String(status || '').toUpperCase();
    switch (s) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-700 border border-slate-300 select-none">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-pulse" /> รอดำเนินการ
          </span>
        );
      case 'PARTIALLY_RECEIVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500/10 text-amber-700 border border-amber-500/20 select-none">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" /> รับของแล้วบางส่วน
          </span>
        );
      case 'RECEIVED':
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-500/20 select-none">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> เสร็จสมบูรณ์
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="w-full h-full p-6 space-y-6 text-slate-800 selection:bg-orange-500 selection:text-white animate-fadeIn">
      
      {/* 🟦 1. ส่วนหัวแผงควบคุมสไตล์ Glassmorphism ผสาน Aurora Control Group */}
      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-slate-200/80 dark:border-zinc-800/80 p-6 rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.01)] flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5 transition-all duration-300 hover:shadow-sm">
        <div className="min-w-0">
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">หน้ารวมเอกสารและประวัติจัดซื้อจริง (PO Dashboard)</h1>
          <p className="text-xs text-slate-400 mt-1 font-bold tracking-wide">
            Enterprise Purchasing & Contract Control • ตรวจสอบความถูกต้องและสลักสิทธิ์ยอดสุทธิจริงพอร์ตคลังสินค้า
          </p>
        </div>

        {/* ฟิลเตอร์จัดชุดกรองสี่เหลี่ยมโปร่งแสงขลิบมน */}
        <div className="flex flex-wrap items-center gap-3 xl:ml-auto">
          
          <div className="relative">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาเลขที่ PO หรือชื่อคู่ค้า..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-64 bg-slate-100 border border-slate-200 focus:border-orange-500 focus:bg-white text-sm font-bold rounded-xl outline-none transition-all shadow-inner"
            />
          </div>

          <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs sm:text-sm font-black text-slate-600 cursor-pointer user-select-none transition-colors hover:bg-slate-200/60 active:scale-[0.99]">
            <input
              type="checkbox"
              checked={showAllHistory}
              onChange={(e) => setShowAllHistory(e.target.checked)}
              className="w-4 h-4 rounded text-orange-500 border-slate-300 accent-orange-500 cursor-pointer"
            />
            <span>แสดงประวัติย้อนหลังทั้งหมด</span>
          </label>

          {/* ปุ่มสร้างใบสั่งซื้อใหม่สะท้อนแสงนีออนส้มเรืองแสงล้ำอนาคต */}
          <button
            onClick={handleNavigateToCreatePage}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs sm:text-sm rounded-xl border border-orange-400/10 shadow-[0_4px_15px_rgba(249,115,22,0.25)] transform hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
          >
            <Plus className="w-4 h-4 text-orange-100" />
            <span>สร้างใบสั่งซื้อใหม่</span>
          </button>
        </div>
      </div>

      {/* สัญญาณแจ้งสถานะสปินเนอร์กระดานโหลดเน็ตเวิร์ก */}
      {isLoading && (
        <div className="bg-orange-500/5 border border-orange-500/10 text-orange-600 font-bold text-xs p-4 rounded-2xl flex items-center gap-2 select-none animate-pulse">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>ระบบกำลังประมวลผลตัวกรองข้อมูลจัดซื้อเรียลไทม์...</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs p-4 rounded-2xl font-black">
          ⚠️ เกิดข้อผิดพลาดเครือข่าย: {error}
        </div>
      )}

      {/* 📊 2. แผงตารางประมวลผลโมเดิร์น ยกระดับจากสไตล์โบราณสู่ความคลีนระดับโลก */}
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.01)] p-3 overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b-2 border-slate-100 bg-slate-50/70 text-slate-500 text-xs font-black uppercase tracking-wider select-none">
                <th className="p-4 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> วันที่ออกเอกสาร</th>
                <th className="p-4"><FileText className="w-3.5 h-3.5 inline mr-1" /> เลขที่ใบสั่งซื้อ</th>
                <th className="p-4"><User className="w-3.5 h-3.5 inline mr-1" /> คู่ค้าจัดซื้อ</th>
                <th className="p-4 text-right">ยอดสุทธิรวม</th>
                <th className="p-4 text-center"><Layers className="w-3.5 h-3.5 inline mr-1" /> สถานะดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!isLoading && historyList.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-slate-400 font-bold italic text-sm">
                    ไม่พบข้อมูลเอกสารใบสั่งซื้อตามเงื่อนไขการค้นหาปัจจุบัน
                  </td>
                </tr>
              ) : (
                historyList.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50/80 transition-colors duration-150 group">
                    <td className="p-4 text-sm font-semibold text-slate-500">
                      {po.createdAt 
                        ? new Date(po.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }) 
                        : 'ไม่ระบุวันที่'}
                    </td>
                    <td className="p-4 text-sm font-black text-slate-900 tracking-tight group-hover:text-orange-500 transition-colors">
                      {po.code}
                    </td>
                    <td className="p-4 text-sm font-bold text-slate-700">
                      {po.supplier?.name || 'ไม่ระบุคู่ค้า'}
                    </td>
                    {/* 🟢 [TOTAL AMOUNT RENDER] ผูกคีย์ดึงค่าเงินจริง .totalAmount พุ่งทะยานขึ้นจอเรียบร้อยครับ! */}
                    <td className="p-4 text-sm font-black text-right text-slate-950 font-sans text-base">
                      ฿{Number(po.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 text-center">
                      {renderStatusBadge(po.status)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}