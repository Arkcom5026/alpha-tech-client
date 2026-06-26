// src/features/stockItem/components/BarcodePrintTable.jsx
// 🏛️ Premium Next-Gen Barcode Table: (Fixed Multi-Tenant Redirection, Aurora Badges & Spring Physics Commands)

import React, { useEffect, useMemo, useState } from 'react';
// 🟢 [IMPORT FIXED] เรียกใช้งาน useParams ดักจับค่า shopSlug เพื่อรักษาเส้นทาง Multi-Tenant v2 สากล
import { useNavigate, useParams } from 'react-router-dom';
import useBarcodeStore from '@/features/barcode/store/barcodeStore';
import { Layers, Calendar, User, Printer, CheckCircle, AlertCircle, Sparkles, Search, X } from 'lucide-react';

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

const getErrorMessage = (err) => {
  if (!err) return 'เกิดข้อผิดพลาด';
  if (typeof err === 'string') return err;
  return err?.response?.data?.message || err?.message || 'เกิดข้อผิดพลาด';
};

const BarcodePrintTable = ({ mode = 'UNPRINTED', receipts }) => {
  const navigate = useNavigate();
  // 🟢 [SLUG ACTIVATED] แกะรอยคีย์ shopSlug เพื่อคุมระนาบเส้นทางลัดรายสาขาให้แม่นยำ 100%
  const { shopSlug } = useParams();
  
  const { generateBarcodesAction, reprintBarcodesAction } = useBarcodeStore();

  const [selectedIds, setSelectedIds] = useState([]);
  const [uiError, setUiError] = useState('');
  const [printingId, setPrintingId] = useState(null);

  const normalizedReceipts = useMemo(
    () =>
      (Array.isArray(receipts) ? receipts : []).map((r) => ({
        id: r.id,
        purchaseOrderCode: r.purchaseOrderCode ?? r.orderCode ?? r.poCode ?? r.purchaseOrder?.code ?? '-',
        code: r.code ?? r.receiptCode ?? r.purchaseOrderReceiptCode ?? r.poReceiptCode ?? '-',
        supplier: typeof r.supplier === 'object' ? r.supplier?.name ?? '-' : r.supplier ?? r.supplierName ?? '-',
        receivedAt: r.receivedAt ?? r.createdAt ?? r.date ?? null,
        printed: Boolean(r.printed ?? r.isPrinted ?? false),
      })),
    [receipts]
  );

  const visibleReceipts = useMemo(() => {
    if (mode === 'UNPRINTED') return normalizedReceipts.filter((r) => !r.printed);
    return normalizedReceipts;
  }, [normalizedReceipts, mode]);

  const isAllSelected =
    mode === 'UNPRINTED' && visibleReceipts.length > 0 && visibleReceipts.every((r) => selectedIds.includes(r.id));

  const toggleSelect = (id) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const toggleSelectAll = () => setSelectedIds(isAllSelected ? [] : visibleReceipts.map((r) => r.id));

  useEffect(() => {
    setSelectedIds([]);
    setUiError('');
  }, [mode, receipts]);

  const handlePrintClick = async (receiptId) => {
    if (!receiptId) return;
    setUiError('');
    try {
      setPrintingId(receiptId);
      await generateBarcodesAction(receiptId);
      
      // 🟢 [ROUTING FIXED] บังคับท่อส่งหน้าพรีวิวเดี่ยว ให้เกาะสาย Dynamic shopSlug ป้องกันการดีดเด้งหลุด
      const targetSlug = shopSlug || 'advancetech';
      navigate(`/${targetSlug}/pos/purchases/barcodes/preview/${receiptId}`);
    } catch (err) {
      if (import.meta?.env?.DEV) console.error('[handlePrintClick] ❌', err);
      setUiError(getErrorMessage(err));
    } finally {
      setPrintingId(null);
    }
  };

  const handleReprintClick = async (receiptId) => {
    if (!receiptId) return;
    setUiError('');
    try {
      setPrintingId(receiptId);
      await reprintBarcodesAction(receiptId);
      
      // 🟢 [ROUTING FIXED] บังคับท่อส่งหน้าพรีวิวพิมพ์ซ้ำเดี่ยว ให้เกาะสาย Dynamic shopSlug ป้องกันการดีดเด้งหลุด
      const targetSlug = shopSlug || 'advancetech';
      navigate(`/${targetSlug}/pos/purchases/barcodes/preview/${receiptId}`);
    } catch (err) {
      if (import.meta?.env?.DEV) console.error('[handleReprintClick] ❌', err);
      setUiError(getErrorMessage(err));
    } finally {
      setPrintingId(null);
    }
  };

  return (
    <div className="space-y-4 font-sans text-slate-800">
      
      {/* ⚠️ กล่องข้อความแจ้งเตือน Error UI */}
      {uiError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs font-black text-rose-600 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-rose-500" />
            <span>{uiError}</span>
          </div>
          <button type="button" className="underline ml-2 text-slate-500 hover:text-slate-900" onClick={() => setUiError('')}>ปิด</button>
        </div>
      )}

      {/* 📊 CORE TABLE LAYOUT: จัดโฉมตารางโมเดิร์นคลีน โปร่งตา ขอบโค้งมนมีมิติ */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-[0_4px_25px_rgba(0,0,0,0.01)] bg-white">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-xs sm:text-sm text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/60 text-slate-500 text-xs font-black uppercase tracking-wider select-none">
                <th className="p-3 w-12 text-center">
                  {mode === 'UNPRINTED' ? (
                    <input type="checkbox" onChange={toggleSelectAll} checked={isAllSelected} className="accent-orange-500 cursor-pointer h-4 w-4 rounded" />
                  ) : (
                    <span />
                  )}
                </th>
                <th className="p-3 w-16 text-center">ลำดับ</th>
                <th className="p-3">เลขใบสั่งซื้อ PO</th>
                <th className="p-3">เลขใบตรวจรับ RC</th>
                <th className="p-3"><User className="w-3.5 h-3.5 inline mr-1 text-slate-400" /> Supplier</th>
                <th className="p-3"><Calendar className="w-3.5 h-3.5 inline mr-1 text-slate-400" /> วันที่รับของ</th>
                <th className="p-3 text-center w-32">การจัดพิมพ์</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-600 text-xs sm:text-sm">
              {visibleReceipts.map((r, index) => (
                <tr key={r.id} className="hover:bg-slate-50/60 transition-colors duration-150 group">
                  <td className="p-3 text-center">
                    {mode === 'UNPRINTED' ? (
                      <input type="checkbox" checked={selectedIds.includes(r.id)} onChange={() => toggleSelect(r.id)} className="accent-orange-500 cursor-pointer h-4 w-4 rounded" />
                    ) : (
                      <span />
                    )}
                  </td>
                  <td className="p-3 text-center font-bold text-slate-400 font-sans text-xs">{index + 1}</td>
                  <td className="p-3 font-mono font-bold text-slate-400 text-xs">{r.purchaseOrderCode}</td>
                  <td className="p-3 font-mono font-black text-slate-900 group-hover:text-orange-500 transition-colors text-xs sm:text-sm">{r.code}</td>
                  <td className="p-3 font-bold text-slate-800">{r.supplier}</td>
                  <td className="p-3 font-semibold text-slate-500 font-sans">{formatDateTh(r.receivedAt)}</td>
                  <td className="p-3 text-center select-none">
                    {mode === 'UNPRINTED' ? (
                      <button
                        type="button"
                        onClick={() => handlePrintClick(r.id)}
                        disabled={printingId === r.id}
                        className={`px-4 py-1.5 text-xs font-black rounded-xl border tracking-wide shadow-sm active:scale-95 transform transition-all duration-200 ${
                          printingId === r.id
                            ? 'bg-orange-400 border-orange-400 text-white cursor-not-allowed shadow-none'
                            : 'bg-slate-800 hover:bg-slate-900 text-white border-slate-900 hover:-translate-y-0.5'
                        }`}
                      >
                        {printingId === r.id ? 'สร้างฉลาก...' : 'พิมพ์ฉลาก'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleReprintClick(r.id)}
                        disabled={printingId === r.id}
                        className={`px-4 py-1.5 text-xs font-black rounded-xl border tracking-wide shadow-sm active:scale-95 transform transition-all duration-200 ${
                          printingId === r.id
                            ? 'bg-blue-400 border-blue-400 text-white cursor-not-allowed shadow-none'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:-translate-y-0.5'
                        }`}
                      >
                        {printingId === r.id ? 'เตรียมงาน...' : 'พิมพ์ซ้ำ'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {visibleReceipts.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-slate-400 font-bold italic py-12 text-sm select-none">
                    {mode === 'UNPRINTED' ? '✨ ไม่มีรายการบิลค้างพิมพ์บาร์โค้ดในระบบขณะนี้' : 'ไม่พบข้อมูลใบรับสินค้าที่ตรงกับตัวกรองค้นหา'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🟦 3. แผงควบคุมคำสั่งพิมพ์กลุ่มอัจฉริยะท้ายบิล (Batch Print Action Tray Container) */}
      {mode === 'UNPRINTED' && selectedIds.length > 0 && (
        <div className="bg-slate-800 border border-slate-900 rounded-2xl p-4 shadow-[0_10px_30px_rgba(30,41,59,0.15)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none animate-slideUp">
          <div className="text-xs font-black text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-orange-400 Regal-Breathing-Pulse" /> 
            <span>เลือกบิลรวมเข้าแผงคิวงานแล้ว</span> 
            <span className="text-white text-sm font-sans px-1.5 py-0.5 bg-slate-700 rounded-md shadow-inner">{selectedIds.length}</span> 
            <span>ใบตรวจรับพัสดุ</span>
          </div>
          
          <div className="flex items-center gap-2 select-none w-full sm:w-auto">
            <button type="button" className="flex-1 sm:flex-none h-9 px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs rounded-xl active:scale-95 transition-all" onClick={() => setSelectedIds([])}>ยกเลิกการเลือก</button>
            
            {/* 🟢 [ROUTING FIXED] ปรับปุ่มพิมพ์กลุ่มพ่วงรหัสตัวแปร shopSlug ยิงพุ่งตรงเข้าเป้าหมายอย่างแม่นยำ ไร้อาการเด้งสะบัด */}
            <button
              type="button"
              onClick={() => {
                const targetSlug = shopSlug || 'advancetech';
                navigate(`/${targetSlug}/pos/purchases/barcodes/print?ids=${selectedIds.join(',')}`);
              }}
              className="flex-1 sm:flex-none h-9 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs rounded-xl border border-orange-400/10 shadow-lg transform active:scale-95 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-1"
            >
              <Printer className="w-3.5 h-3.5 text-orange-100" />
              <span>พิมพ์กลุ่มรายการที่เลือก ({selectedIds.length})</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarcodePrintTable;