// src/features/stockItem/pages/ListReceiptItemsToScanPage.jsx
// 🏛️ Premium Next-Gen Scan Influx Queue: (Fixed Button Import Path Mismatch & Aurora Control Filters)

import React, { useEffect, useMemo, useState, useCallback } from 'react';
// 🟢 เรียกใช้งาน useParams ดักจับสิทธิ์บริษัทรายสาขาคั่นหน้า URL ป้องกันบั๊กลิงก์ดีดเด้ง
import { useNavigate, useParams } from 'react-router-dom';

// 🟢 [IMPORT FIXED] สับเปลี่ยนท่อส่ง นำเข้า Button จากโฟลเดอร์ ui/button โดยตรง ทะลวง Uncaught SyntaxError ดับสนิท 100%
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import useBarcodeStore from '@/features/barcode/store/barcodeStore';
import { FileSpreadsheet, RefreshCw, Layers, Calendar, User, SlidersHorizontal, ArrowRight, AlertCircle } from 'lucide-react';

const thDate = new Intl.DateTimeFormat('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' });

const ListReceiptItemsToScanPage = () => {
  const navigate = useNavigate();
  // 🟢 แกะรอยคีย์ shopSlug เพื่อรักษาเส้นทาง Multi-Tenant v2 สากล
  const { shopSlug } = useParams(); 
  
  const { receipts, loadReceiptsReadyToScanAction, loading, error, clearErrorAction } = useBarcodeStore();
  const [filter, setFilter] = useState('ALL'); 

  const load = useCallback(() => {
    clearErrorAction?.();
    loadReceiptsReadyToScanAction();
  }, [loadReceiptsReadyToScanAction, clearErrorAction]);

  useEffect(() => {
    load();

    const onVis = () => {
      if (document.visibilityState === 'visible') load();
    };

    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [load]);

  const sortedReceipts = useMemo(() => {
    const rows = (receipts || []).slice();
    return rows.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [receipts]);

  const rowsAll = sortedReceipts;
  const rows = useMemo(() => {
    if (filter === 'SN') return rowsAll.filter((r) => Number(r?.pendingSN || 0) > 0);
    if (filter === 'LOT') return rowsAll.filter((r) => Number(r?.pendingLOT || 0) > 0);
    return rowsAll;
  }, [rowsAll, filter]);

  const sumSN = useMemo(() => rowsAll.reduce((s, r) => s + Number(r?.pendingSN || 0), 0), [rowsAll]);
  const sumLOT = useMemo(() => rowsAll.reduce((s, r) => s + Number(r?.pendingLOT || 0), 0), [rowsAll]);

  const goScan = (receipt) => {
    if (!receipt?.id) return; 
    const targetSlug = shopSlug || 'advancetech';
    navigate(`/${targetSlug}/pos/purchases/receipt/items/scan/${receipt.id}?code=${encodeURIComponent(receipt.purchaseOrderCode || '')}`);
  };

  return (
    <div className="w-full h-full space-y-6 text-slate-800 selection:bg-orange-500 selection:text-white animate-fadeIn font-sans p-6 max-w-[1400px] mx-auto">
      
      {/* 🟦 1. ส่วนหัวแผงควบคุมสไตล์ Glassmorphic */}
      <div className="bg-white/80 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800 p-6 rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.01)] backdrop-blur-md flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5 transition-all duration-300 select-none">
        <div className="min-w-0">
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-orange-500" /> ใบตรวจรับสินค้าที่พร้อมยิง / เปิดล็อตเข้าคลังสต๊อก
          </h1>
          <p className="text-xs text-slate-400 dark:text-zinc-400 mt-1 font-bold">
            Stock Influx Control Panel • รายการตรวจสอบความสมดุลพัสดุรายชิ้น แยกโหมดการทำงาน STRUCTURED ค้างยิง
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 xl:ml-auto">
          <span className="px-3 py-1.5 rounded-xl font-black text-xs bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 shadow-inner">ทั้งหมด: {rowsAll.length} ใบรับ</span>
          <span className="px-3 py-1.5 rounded-xl font-black text-xs bg-blue-500/10 text-blue-700 border border-blue-500/10">SN ค้างยิง: {sumSN} ชิ้น</span>
          <span className="px-3 py-1.5 rounded-xl font-black text-xs bg-emerald-500/10 text-emerald-700 border border-emerald-500/10">LOT ค้างเปิด: {sumLOT} กลุ่ม</span>
        </div>
      </div>

      {/* 🎛️ 2. แผงรวมศูนย์เครื่องมือฟิลเตอร์สลับประเภทพัสดุ คลาสพรีเมียม */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-4 shadow-[0_4px_25px_rgba(0,0,0,0.01)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
        <div className="text-xs font-black text-slate-400 flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5" /> สลับระเบียบการดักกรองสายพานคิวงานสต๊อกสินค้า
        </div>

        <div className="flex flex-wrap items-center gap-2 select-none w-full sm:w-auto justify-end">
          <Button size="sm" variant={filter === 'ALL' ? 'default' : 'outline'} onClick={() => setFilter('ALL')} className="rounded-xl font-black text-xs">ทั้งหมด</Button>
          <Button size="sm" variant={filter === 'SN' ? 'default' : 'outline'} onClick={() => setFilter('SN')} className="rounded-xl font-black text-xs">SN เท่านั้น</Button>
          <Button size="sm" variant={filter === 'LOT' ? 'default' : 'outline'} onClick={() => setFilter('LOT')} className="rounded-xl font-black text-xs">LOT เท่านั้น</Button>
          <Button size="sm" variant="secondary" onClick={load} className="rounded-xl font-black text-xs flex items-center gap-1 shadow-sm ml-2">
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-orange-500' : ''}`} /> รีเฟรชท่อส่ง
          </Button>
        </div>
      </div>

      {/* ⚠️ 3. ส่วนแจ้งเตือนความล้มเหลวเครือข่าย */}
      {!loading && error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 text-xs font-black text-rose-600 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500" />
            <span>เกิดข้อผิดพลาดในการโหลดคิวยิงสต๊อก: {typeof error === 'string' ? error : error?.message || 'กรุณาลองใหม่อีกครั้ง'}</span>
          </div>
          <Button size="sm" variant="destructive" onClick={load} className="rounded-xl font-black">ลองโหลดใหม่</Button>
        </div>
      )}

      {/* 📊 4. CORE TABLE GRID PANEL */}
      <div className="border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-zinc-900">
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80 dark:bg-zinc-800/50 border-b border-slate-200/60 dark:border-zinc-800 text-slate-500 text-xs font-black uppercase tracking-wider select-none">
                <TableHead className="p-3.5">เลขที่ใบสั่งซื้อ PO</TableHead>
                <TableHead className="p-3.5">เลขที่ใบตรวจรับ RC</TableHead>
                <TableHead className="p-3.5"><Calendar className="w-3.5 h-3.5 inline mr-1 text-slate-400" /> วันที่ออกเอกสาร</TableHead>
                <TableHead className="p-3.5"><User className="w-3.5 h-3.5 inline mr-1 text-slate-400" /> ซัพพลายเออร์ (Supplier)</TableHead>
                <TableHead className="p-3.5 text-center w-28 text-blue-700">SN ค้างยิง</TableHead>
                <TableHead className="p-3.5 text-center w-28 text-emerald-700">LOT ค้างเปิด</TableHead>
                <TableHead className="p-3.5 text-center w-32">การจัดการสต๊อก</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="font-medium text-slate-600 dark:text-zinc-300 text-xs sm:text-sm">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-slate-400 font-bold select-none">
                    <div className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                      <span>กำลังกวาดค้นรายชื่อใบตรวจรับสินค้าพัสดุ...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : !rows || rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-slate-400 font-bold italic select-none">
                    ✨ ไม่มีใบตรวจรับสินค้าคงค้างรอคิวยิงสแกนเข้าคลังสต๊อกสาขาในขณะนี้
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r) => (
                  <TableRow key={r.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors duration-150 group border-b border-slate-100 dark:border-zinc-800">
                    <td className="p-3.5 font-mono font-bold text-slate-400 text-xs">{r.purchaseOrderCode || '-'}</td>
                    <td className="p-3.5 font-mono font-black text-slate-900 dark:text-white group-hover:text-orange-500 transition-colors text-xs sm:text-sm">{r.code || '-'}</td>
                    <td className="p-3.5 font-semibold text-slate-500 dark:text-zinc-400 font-sans">{r.createdAt ? thDate.format(new Date(r.createdAt)) : '-'}</td>
                    <td className="p-3.5 font-bold text-slate-700 dark:text-zinc-200 truncate max-w-[240px]">{r.supplier || '-'}</td>
                    <td className="p-3.5 text-center font-bold font-mono text-blue-600 bg-blue-500/[0.01]">{Number(r?.pendingSN || 0)}</td>
                    <td className="p-3.5 text-center font-bold font-mono text-emerald-600 bg-emerald-500/[0.01]">{Number(r?.pendingLOT || 0)}</td>
                    <td className="p-3.5 text-center select-none">
                      <button
                        type="button"
                        onClick={() => goScan(r)}
                        className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-black text-xs rounded-xl border border-slate-900 shadow-sm transform hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-1 mx-auto"
                      >
                        <span>ยิงรับสต๊อก</span>
                        <ArrowRight className="w-3 h-3 text-slate-300" />
                      </button>
                    </td>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

    </div>
  );
};

export default ListReceiptItemsToScanPage;