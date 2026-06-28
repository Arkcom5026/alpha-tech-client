// src/features/purchaseOrderReceipt/components/purchaseOrderReceiptTable.jsx
// 🏛️ Next-Gen Receipt Table: (Glassmorphic Accent, Aurora Badges, Spring Buttons & Stable Routing)
import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search, ClipboardCheck, Layers, Calendar, User, SlidersHorizontal, AlertCircle, XCircle } from 'lucide-react';
import usePurchaseOrderReceiptStore from '../store/purchaseOrderReceiptStore'; //[cite: 16]

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

const normalizeStatus = (status) => String(status || '').toUpperCase(); //[cite: 16]

const renderStatusBadge = (statusRaw) => {
  const s = normalizeStatus(statusRaw); //[cite: 16]
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
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> เสร็จสมบูรณ์
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
  const s = normalizeStatus(po?.status); //[cite: 16]
  return s === 'PENDING' || s === 'PARTIALLY_RECEIVED'; //[cite: 16]
};

const PurchaseOrderReceiptTable = ({ purchaseOrders, loading }) => {
  const navigate = useNavigate(); //[cite: 16]
  const { shopSlug } = useParams(); //[cite: 16]
  const { cancelPurchaseOrderAction } = usePurchaseOrderReceiptStore(); 
  const [searchText = '', setSearchText] = useState(''); //[cite: 16]
  const [statusFilter = 'ALL', setStatusFilter] = useState('ALL'); //[cite: 16]
  const [cancelingId, setCancelingId] = useState(null); 

  const filtered = useMemo(() => {
    const list = Array.isArray(purchaseOrders) ? purchaseOrders : []; //[cite: 16]
    const q = String(searchText || '').trim().toLowerCase(); //[cite: 16]

    return list.filter((po) => {
      const supplierName = String(po?.supplier?.name || '').toLowerCase(); //[cite: 16]
      const poCode = String(po?.code || po?.poNumber || '').toLowerCase(); //[cite: 16]

      const matchText = !q || supplierName.includes(q) || poCode.includes(q); //[cite: 16]
      const matchStatus =
        statusFilter === 'ALL' || normalizeStatus(po?.status) === normalizeStatus(statusFilter); //[cite: 16]

      return matchText && matchStatus; //[cite: 16]
    });
  }, [purchaseOrders, searchText, statusFilter]); //[cite: 16]

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.01)] bg-white"> //[cite: 16]
      
      {/* 🟦 TOP CONTROL CONTAINER */}
      <div className="flex justify-between items-center p-4 flex-wrap gap-4 bg-slate-50/70 border-b border-slate-100 font-sans">
        <div className="relative">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" /> {/*[cite: 16] */}
          <input
            type="text"
            placeholder="ค้นหา Supplier / เลขที่ใบสั่งซื้อ..."
            value={searchText} //[cite: 16]
            onChange={(e) => setSearchText(e.target.value)} //[cite: 16]
            className="pl-10 pr-4 py-2 w-64 bg-white border border-slate-200 focus:border-orange-500 text-sm font-bold rounded-xl outline-none transition-all shadow-inner" //[cite: 16]
          />
        </div>

        <div className="flex items-center gap-4 text-xs sm:text-sm flex-wrap font-black text-slate-600 bg-white border border-slate-200 px-4 py-1.5 rounded-xl shadow-sm select-none"> {/*[cite: 16] */}
          <span className="text-slate-400 font-bold flex items-center gap-1 shrink-0"><SlidersHorizontal className="w-3.5 h-3.5" /> ตัวกรอง:</span> {/*[cite: 16] */}
          
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-900 transition-colors">
            <input
              type="radio"
              name="poReceiptStatusFilter"
              value="ALL"
              checked={statusFilter === 'ALL'} //[cite: 16]
              onChange={(e) => setStatusFilter(e.target.value)} //[cite: 16]
              className="w-4 h-4 text-orange-500 border-slate-300 accent-orange-500 cursor-pointer" //[cite: 16]
            />
            <span>ทั้งหมด</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-900 transition-colors">
            <input
              type="radio"
              name="poReceiptStatusFilter"
              value="PENDING"
              checked={statusFilter === 'PENDING'} //[cite: 16]
              onChange={(e) => setStatusFilter(e.target.value)} //[cite: 16]
              className="w-4 h-4 text-orange-500 border-slate-300 accent-orange-500 cursor-pointer" //[cite: 16]
            />
            <span>รอดำเนินการ</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-900 transition-colors">
            <input
              type="radio"
              name="poReceiptStatusFilter"
              value="PARTIALLY_RECEIVED"
              checked={statusFilter === 'PARTIALLY_RECEIVED'} //[cite: 16]
              onChange={(e) => setStatusFilter(e.target.value)} //[cite: 16]
              className="w-4 h-4 text-orange-500 border-slate-300 accent-orange-500 cursor-pointer" //[cite: 16]
            />
            <span>รับบางส่วน</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-900 transition-colors">
            <input
              type="radio"
              name="poReceiptStatusFilter"
              value="COMPLETED"
              checked={statusFilter === 'COMPLETED'} //[cite: 16]
              onChange={(e) => setStatusFilter(e.target.value)} //[cite: 16]
              className="w-4 h-4 text-orange-500 border-slate-300 accent-orange-500 cursor-pointer" //[cite: 16]
            />
            <span>เสร็จสมบูรณ์</span>
          </label>
        </div>
      </div>

      {/* 📊 TABLE LAYOUT */}
      <div className="w-full overflow-x-auto font-sans">
        <table className="w-full text-sm text-left border-collapse"> {/*[cite: 16] */}
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-black uppercase tracking-wider select-none"> {/*[cite: 16] */}
              <th className="px-4 py-3.5 w-12 text-center">#</th> {/*[cite: 16] */}
              <th className="px-4 py-3.5"><Calendar className="w-3.5 h-3.5 inline mr-1" /> วันที่ออกเอกสาร</th> {/*[cite: 16] */}
              <th className="px-4 py-3.5">เลขที่ใบสั่งซื้อ</th> {/*[cite: 16] */}
              <th className="px-4 py-3.5"><User className="w-3.5 h-3.5 inline mr-1" /> Supplier</th> {/*[cite: 16] */}
              <th className="px-4 py-3.5"><Layers className="w-3.5 h-3.5 inline mr-1" /> สถานะ</th> {/*[cite: 16] */}
              {/* 🟢 ขยายความกว้างหัวตารางล็อกพื้นที่รับ 2 ปุ่มแนวนอน */}
              <th className="px-4 py-3.5 text-center w-[240px]">การจัดการคลังพัสดุ</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100"> {/*[cite: 16] */}
            {loading && (
              <tr>
                <td className="px-4 py-12 text-center text-slate-400 font-bold select-none" colSpan={6}> {/*[cite: 16] */}
                  <div className="flex items-center justify-center gap-2"> {/*[cite: 16] */}
                    <span className="h-4 w-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /> {/*[cite: 16] */}
                    <span>กำลังโหลดและเชื่อมท่อ Live API หลังบ้าน...</span> {/*[cite: 16] */}
                  </div>
                </td>
              </tr>
            )}

            {!loading && filtered.length === 0 && (
              <tr>
                <td className="px-4 py-12 text-center text-slate-400 font-bold italic text-sm select-none" colSpan={6}> {/*[cite: 16] */}
                  ไม่พบข้อมูลเอกสารใบสั่งซื้อที่ตรงกับเงื่อนไขตัวกรองในปัจจุบัน {/*[cite: 16] */}
                </td>
              </tr>
            )}

            {!loading &&
              filtered.map((po, index) => {
                const disabled = !canReceive(po); //[cite: 16]
                const isCanceling = cancelingId === po.id;
                const canCancel = normalizeStatus(po?.status) === 'PENDING' || normalizeStatus(po?.status) === 'PARTIALLY_RECEIVED';

                const handleCancelPO = async (id, code) => {
                  if (!window.confirm(`⚠️ คุณต้องการ "ยกเลิก" ใบสั่งซื้อเลขที่ ${code} ใช่หรือไม่?\n(เมื่อยกเลิกแล้ว บิลนี้จะถูกปิดถาวรและไม่สามารถนำมาตรวจรับของได้อีก)`)) {
                    return;
                  }
                  try {
                    setCancelingId(id);
                    await cancelPurchaseOrderAction(id);
                    alert(`✅ ยกเลิกใบสั่งซื้อ ${code} และถอนสิทธิ์เอกสารสำเร็จ`);
                  } catch (err) {
                    alert(`❌ 不สามารถยกเลิกบิลได้: ${err?.message || 'เกิดข้อผิดพลาดทางระบบ'}`);
                  } finally {
                    setCancelingId(null);
                  }
                };

                return (
                  <tr key={po.id} className="hover:bg-slate-50/80 transition-colors duration-150 group"> {/*[cite: 16] */}
                    <td className="px-4 py-3.5 text-center font-bold text-slate-400 text-xs">{index + 1}</td> {/*[cite: 16] */}
                    <td className="px-4 py-3.5 text-slate-500 font-semibold">{formatDateTh(po?.createdAt)}</td> {/*[cite: 16] */}
                    <td className="px-4 py-3.5 font-black text-slate-900 tracking-tight group-hover:text-orange-500 transition-colors"> {/*[cite: 16] */}
                      {po?.code || po?.poNumber || '-'} {/*[cite: 16] */}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-700">{po?.supplier?.name || '-'}</td> {/*[cite: 16] */}
                    <td className="px-4 py-3.5">{renderStatusBadge(po?.status)}</td> {/*[cite: 16] */}
                    
                    <td className="px-4 py-3.5 text-center">
                      {/* 🟢 จัดเรียง flex แถวตรงแบบบังคับห้ามตัดคำบรรทัด */}
                      <div className="flex items-center justify-center gap-1.5 flex-nowrap w-full">
                        
                        {/* 🎨 1. ปุ่มตรวจรับสินค้า */}
                        <button
                          disabled={disabled || isCanceling}
                          onClick={() => {
                            if (disabled) return;
                            const targetSlug = shopSlug || 'advancetech'; //[cite: 16]
                            navigate(`/${targetSlug}/pos/purchases/receipt/create/${po.id}`); //[cite: 16]
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-black border tracking-wide transition-all duration-200 ease-out transform active:scale-95 flex items-center gap-1 shadow-sm whitespace-nowrap shrink-0 ${
                            disabled
                              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed shadow-none'
                              : 'bg-slate-800 hover:bg-slate-900 text-white border-slate-900 hover:border-black'
                          }`}
                        >
                          <ClipboardCheck className="w-3.5 h-3.5" /> {/*[cite: 16] */}
                          <span>ตรวจรับ</span>
                        </button>

                        {/* 🔴 2. ปุ่มยกเลิกเอกสาร PO (ปรับลดขนาดฟอนต์ text-[10px] และยึดพื้นที่แนวเดี่ยว) */}
                        {canCancel && (
                          <button
                            type="button"
                            disabled={isCanceling}
                            onClick={() => handleCancelPO(po.id, po.code)}
                            className="px-2 py-1 rounded-lg text-[10px] font-black border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-all active:scale-95 flex items-center gap-0.5 whitespace-nowrap shrink-0"
                          >
                            <XCircle className="w-3 h-3" />
                            <span>{isCanceling ? 'ปิดบิล...' : 'ยกเลิกบิล'}</span>
                          </button>
                        )}

                        {disabled && (
                          <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-2 py-1 rounded-md flex items-center gap-1 select-none whitespace-nowrap shrink-0"> {/*[cite: 16] */}
                            <AlertCircle className="w-3 h-3 text-slate-400" /> {/*[cite: 16] */}
                            เสร็จสิ้นแล้ว
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