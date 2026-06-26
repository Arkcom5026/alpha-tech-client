// src/features/purchaseOrderReceipt/pages/ListPurchaseOrderReceiptPage.jsx
// 🏛️ Next-Gen Multi-Tenant Goods Receipt: (Fixed Store Variable Binding & Safe Tenant API Influx)
import React, { useEffect } from 'react';
// 🟢 [IMPORT FIXED] ดึง useParams ประจำการเพื่อดักจับค่าบริษัท/สาขาคั่นกลาง URL ป้องกันสิทธิ์หลุดเลน
import { useParams } from 'react-router-dom';
import { ClipboardList, AlertCircle, RefreshCw } from 'lucide-react';
import PurchaseOrderReceiptTable from '../components/purchaseOrderReceiptTable';
import usePurchaseOrderReceiptStore from '../store/purchaseOrderReceiptStore'; 

const ListPurchaseOrderReceiptPage = () => {
  // 🟢 [SLUG ACTIVATED] แกะคีย์ชื่อร้านค้าคั่น URL จากระบบกลางเพื่อประคองความเสถียรรายสาขา
  const { shopSlug } = useParams();
  const store = usePurchaseOrderReceiptStore();
  
  // 🟢 [STORE VARIABLE BINDING FIXED] สลับจับคีย์ตัวแปรให้ตรงตามระเบียบใหม่ v2 ของ Store ตัวจริง (purchaseOrdersForReceipt)
  const purchaseOrders = store?.purchaseOrdersForReceipt || []; 
  const loading = store?.loading || false;
  const error = store?.error || null;
  const clearErrorAction = store?.clearErrorAction;

  const fetchAction = store?.fetchPurchaseOrdersForReceiptAction || store?.fetchPurchaseOrdersForReceipt;

  useEffect(() => {
    if (typeof fetchAction === 'function') {
      // 🟢 [LIVE API INFLUX WITH SLUG] สั่งส่งข้อมูลแบรนด์/สาขาติดพ่วงเข้าไปกับ API กลาง เพื่อทะลวงดึงข้อมูลจริงขึ้นมาสแตนด์บาย
      const targetSlug = shopSlug || 'advancetech';
      fetchAction({ shopSlug: targetSlug });
    } else {
      console.warn("⚠️ ไม่พบฟังก์ชันดึงใบสั่งซื้อที่รอตรวจรับใน Store");
    }
  }, [fetchAction, shopSlug]); // 🟢 ดักสิทธิ์การทำงานร่วมกับ shopSlug ป้องกันสัญญานดับระเบิดหลุดลูป

  return (
    <div className="space-y-6 animate-fadeIn selection:bg-orange-500 selection:text-white p-6 max-w-[1400px] mx-auto">
      
      {/* 🟦 1. ส่วนหัวแผงควบคุมสไตล์ Glassmorphic */}
      <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-zinc-800/80 p-6 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all duration-300 hover:shadow-md relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/[0.01] to-transparent pointer-events-none" />
        <div className="min-w-0 relative z-10">
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">รายการใบสั่งซื้อที่รอตรวจรับ</h1>
          <p className="text-xs text-slate-400 mt-1 font-bold tracking-wide">
            Procurement Goods Receipt Management • ค้นหาและบันทึกประวัติการรับสินค้าพัสดุเข้าคลังสาขาประจำค่าย [{shopSlug?.toUpperCase() || 'MAIN'}]
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-xs px-4 py-2 rounded-2xl border border-orange-400/10 flex items-center gap-2 shrink-0 select-none shadow-[0_4px_15px_rgba(249,115,22,0.2)] transform hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
          {loading ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <ClipboardList className="w-3.5 h-3.5 text-orange-100" />
          )}
          <span className="tracking-wide">เชื่อมต่อท่อส่งข้อมูล Live API</span>
        </div>
      </div>

      {/* ⚠️ 2. กล่องแจ้งเตือนความปลอดภัยพาร์ตเนอร์ */}
      {error && (
        <div className="border border-rose-500/20 bg-rose-500/[0.04] backdrop-blur-md rounded-3xl p-5 flex items-start gap-4 animate-fadeIn shadow-[0_10px_30px_rgba(244,63,94,0.05)] text-left">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 border border-rose-500/20">
            <AlertCircle className="w-5 h-5 text-rose-600" />
          </div>

          <div className="flex-1">
            <div className="text-xs font-black text-rose-600 uppercase tracking-widest flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" style={{ animationDuration: '2.5s' }} />
              ระบบความปลอดภัยพาร์ตเนอร์
            </div>
            <div className="text-sm font-bold text-slate-800 dark:text-zinc-200 mt-1.5 leading-relaxed">
              {error?.message || String(error)}
            </div>
            {clearErrorAction && (
              <button
                type="button"
                onClick={() => clearErrorAction?.()}
                className="mt-3 text-xs text-rose-500 hover:text-rose-700 font-black tracking-wide underline transition-colors block active:scale-95 transform origin-left"
              >
                ปิดหน้าต่างข้อความเตือนภัยนี้
              </button>
            )}
          </div>
        </div>
      )}

      {/* 📊 3. ตารางประมวลผลข้อมูลรอเรนเดอร์ */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.02)] p-3 overflow-hidden transition-all duration-300 hover:shadow-md">
        <PurchaseOrderReceiptTable
          purchaseOrders={Array.isArray(purchaseOrders) ? purchaseOrders : []}
          loading={loading}
        />
      </div>

    </div>
  );
};

export default ListPurchaseOrderReceiptPage;