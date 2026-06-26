// src/features/customerReceipt/pages/PrintCustomerReceiptPage.jsx
// 🏛️ Tenant-Safe Premium Printer Terminal: (Real-Time Short Slip / Full A4 Switcher Engine)

import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import useCustomerReceiptStore from '../store/customerReceiptStore';
import CustomerReceiptPrintLayout from '../components/CustomerReceiptPrintLayout';
// 🟢 [DYNAMIC INJECTION]: นำเข้าคอมโพเนนต์เลย์เอาต์สลิปอย่างย่อยของระบบการเงิน (ถ้ามี หรือสลับดีไซน์ในตัว)
import { ArrowLeft, Printer, Loader2, AlertTriangle, FileCheck, Smartphone, FileText } from 'lucide-react';

const PrintCustomerReceiptPage = () => {
  const { id, shopSlug } = useParams();
  const navigate = useNavigate();
  const printedRef = useRef(false);

  // 🟦 [THE CONTROL STATE]: 'FULL' = ใบเสร็จเต็มรูป A4 | 'SHORT' = สลิปความร้อนอย่างย่อ
  const [printMode, setPrintMode] = useState('FULL');

  const selectedItem = useCustomerReceiptStore((state) => state.selectedItem);
  const detailLoading = useCustomerReceiptStore((state) => state.detailLoading);
  const printLoading = useCustomerReceiptStore((state) => state.printLoading);
  const error = useCustomerReceiptStore((state) => state.error);
  
  const loadCustomerReceiptForPrintAction = useCustomerReceiptStore(
    (state) => state.loadCustomerReceiptForPrintAction
  );
  const clearCustomerReceiptMessagesAction = useCustomerReceiptStore(
    (state) => state.clearCustomerReceiptMessagesAction
  );
  const clearSelectedCustomerReceiptAction = useCustomerReceiptStore(
    (state) => state.clearSelectedCustomerReceiptAction
  );

  useEffect(() => {
    printedRef.current = false;
    clearCustomerReceiptMessagesAction();

    if (!id) return undefined;

    loadCustomerReceiptForPrintAction(Number(id)).catch(() => null);

    return () => {
      clearCustomerReceiptMessagesAction();
      clearSelectedCustomerReceiptAction();
    };
  }, [
    id,
    loadCustomerReceiptForPrintAction,
    clearCustomerReceiptMessagesAction,
    clearSelectedCustomerReceiptAction,
  ]);

  useEffect(() => {
    if (detailLoading || printLoading) return;
    if (error) return;
    if (!selectedItem?.id) return;
    if (Number(selectedItem.id) !== Number(id)) return;
    if (printedRef.current) return;

    // หมายเหตุ: เอาออกหรือคงไว้สำหรับการ auto-print จังหวะแรกที่เข้ามา
    printedRef.current = true;
    const timer = window.setTimeout(() => {
      window.print();
    }, 400);

    return () => window.clearTimeout(timer);
  }, [detailLoading, printLoading, error, id, selectedItem, printMode]);

  const handleBack = () => {
    const currentPath = window.location.pathname;
    if (selectedItem?.id) {
      const baseDetailPath = currentPath.substring(0, currentPath.indexOf('/print'));
      navigate(baseDetailPath);
      return;
    }
    const baseListPath = currentPath.substring(0, currentPath.indexOf(`/customer-receipts`));
    navigate(`${baseListPath}/customer-receipts`);
  };

  if (!id) {
    return (
      // 🟢 FIXED: รีสกินหน้า Error ให้กลืนโหมดมืดพรีเมียมสมมาตรเท่ากัน
      <div className="min-h-screen bg-slate-900 p-6 flex items-center justify-center font-sans text-white">
        <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-6 text-center shadow-xl space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-black text-white tracking-tight">ไม่พบเลขที่ใบรับเงิน</h1>
            <p className="mt-1 text-xs font-bold text-zinc-400">กรุณาตรวจสอบพิกัดเส้นทางเอกสารก่อนพิมพ์อีกครั้ง</p>
          </div>
          <button
            type="button"
            onClick={handleBack}
            className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-xs font-black text-zinc-200 hover:bg-zinc-700 hover:text-white transform active:scale-98 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>กลับไปหน้ารายการใบรับเงิน</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            background: #fff !important;
          }

          body * {
            visibility: hidden !important;
          }

          #customer-receipt-print-root,
          #customer-receipt-print-root * {
            visibility: visible !important;
          }

          #customer-receipt-print-root {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* 🟢 [DYNAMIC MEDIA ADJUSTMENT]: ปรับเปลี่ยนโครงสร้างขนาดหน้ากระดาษตามสเตตสวิตช์วิทยุเรียบลื่น */
          @page {
            size: ${printMode === 'SHORT' ? '80mm auto' : 'A4'} ;
            margin: ${printMode === 'SHORT' ? '0mm' : '10mm'} ;
          }

          .customer-receipt-print-page {
            margin: 0 !important;
            padding: 0 !important;
            min-height: auto !important;
            height: auto !important;
            overflow: visible !important;
            background: #fff !important;
          }
        }
      `}</style>

      {/* 🟢 FIXED: เปลี่ยนพื้นหลังเพจหลักเป็น bg-slate-900 และคง p-6 ไว้เพื่อดันมิติการ์ดลอยแบบ Layered Depth ที่ต้องการ */}
      <div className="customer-receipt-print-page min-h-screen bg-slate-900 p-6 print:bg-white print:p-0 font-sans text-white">
        
        {/* 🟦 TOP ACTION BAR: รีสกินแถบควบคุมด้านบนให้เป็นดีไซน์ดาร์กพรีเมียมสลักขอบสีบางประณีต */}
        <div className="mx-auto mb-6 flex max-w-5xl flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-900 border border-zinc-800/80 p-4 rounded-2xl shadow-lg backdrop-blur-md print:hidden">
          <div className="min-w-0 self-start sm:self-center">
            <h1 className="text-base font-black text-white tracking-tight flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-orange-400" /> พิมพ์ใบเสร็จรับเงินลูกหนี้
            </h1>
            <p className="text-xs font-bold text-zinc-400 mt-0.5">เลขที่อ้างอิงภายในระบบคลังการเงิน: <span className="text-amber-400 font-mono font-black">{selectedItem?.code || '—'}</span></p>
          </div>

          {/* 🎛️ SEGMENTED MODE TOGGLE BAR: รีสกินปุ่มสลับโหมดให้หรูหราคมคายรับโหมดมืด */}
          <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800 select-none shrink-0 w-full sm:w-auto justify-center">
            <button
              type="button"
              onClick={() => setPrintMode('SHORT')}
              className={`px-3 h-7 rounded-md text-xs font-black transition-all flex items-center justify-center gap-1 w-full sm:w-auto ${
                printMode === 'SHORT' ? 'bg-gradient-to-b from-amber-400 to-orange-500 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" /> สลิปสั้นย่อ
            </button>
            <button
              type="button"
              onClick={() => setPrintMode('FULL')}
              className={`px-3 h-7 rounded-md text-xs font-black transition-all flex items-center justify-center gap-1 w-full sm:w-auto ${
                printMode === 'FULL' ? 'bg-gradient-to-b from-amber-400 to-orange-500 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> ใบเสร็จเต็มรูป A4
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-1 px-4 h-9 text-xs font-black bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-xl transform active:scale-95 transition-all shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>กลับ</span>
            </button>
            
            <button
              type="button"
              onClick={() => window.print()}
              disabled={detailLoading || printLoading || !selectedItem?.id}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 px-4 h-9 text-xs font-black bg-gradient-to-b from-amber-400 to-orange-500 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] text-white border border-amber-500/20 rounded-xl shadow-md transform hover:-translate-y-0.5 active:scale-95 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:transform-none disabled:shadow-none"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>พิมพ์ใบเสร็จ ({printMode === 'SHORT' ? 'ย่อ' : 'เต็ม'})</span>
            </button>
          </div>
        </div>

        {/* LOADING & ERROR STATES */}
        {detailLoading || printLoading ? (
          <div className="mx-auto max-w-5xl rounded-3xl border border-zinc-800 bg-zinc-900 p-12 text-center text-sm font-bold text-zinc-400 shadow-sm print:hidden flex flex-col items-center justify-center gap-3 select-none">
            <Loader2 className="w-6 h-6 animate-spin text-orange-400" />
            <span>กำลังเรียกค้นข้อมูลพิกัดใบรับเงินจากเซิร์ฟเวอร์กลาง...</span>
          </div>
        ) : error ? (
          <div className="mx-auto max-w-5xl rounded-3xl border border-rose-500/20 bg-zinc-900 p-6 text-center shadow-sm print:hidden space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white tracking-tight">ไม่สามารถโหลดข้อมูลใบรับเงินได้</h2>
              <p className="mt-1 text-xs font-bold text-rose-400">{error}</p>
            </div>
          </div>
        ) : !selectedItem?.id ? (
          <div className="mx-auto max-w-5xl rounded-3xl border border-amber-500/20 bg-zinc-900 p-6 text-center shadow-sm print:hidden space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white tracking-tight">ไม่พบข้อมูลใบรับเงินพอร์ตระบบคลัง</h2>
            </div>
          </div>
        ) : (
          /* CORE PRINT VALUE RENDER ROOT */
          /* 🟢 FIXED: บังคับทับสิทธิ์ CSS ให้แผ่นกระดาษตัวคอนเทนต์ใบเสร็จตรงกลางเป็นพื้นสีขาว ตัวอักษรสีดำสนิท 100% เสมอ */
          /* สกัดกั้นคราบสีจากโหมดมืดด้วยการระบุ bg-white text-black dark:bg-white dark:text-black ครอบคลุมพิกัดแผ่นฟอร์มพิมพ์ทั้งหมด */
          <div id="customer-receipt-print-root" className="animate-fadeIn w-full overflow-x-auto p-1 bg-slate-900 print:bg-white text-black">
            {printMode === 'SHORT' ? (
              /* 🟩 [SHORT SLIP RECEIPT RENDER]: จัดกรอบพื้นที่สลิปย่อกระชับพิกัด 80mm ให้เป็นสีขาวสะอาดยามเปิดหน้าจอ */
              <div className="max-w-[340px] mx-auto bg-white text-black dark:bg-white dark:text-black p-4 border border-zinc-200 rounded-2xl shadow-inner text-xs print:border-0 print:shadow-none print:p-0">
                <CustomerReceiptPrintLayout receipt={selectedItem} layoutMode="short" />
              </div>
            ) : (
              /* 🟦 [FULL A4 TAX RECEIPT RENDER]: บังคับแผ่นฟอร์ม A4 ตัวเต็มให้อยู่บนพื้นสีขาว ตัวหนังสือดำคมกริบ */
              <div className="max-w-[794px] mx-auto bg-white text-black dark:bg-white dark:text-black p-6 rounded-2xl border border-zinc-200 shadow-sm print:border-0 print:shadow-none print:p-0 print:rounded-none">
                <CustomerReceiptPrintLayout receipt={selectedItem} layoutMode="full" />
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default PrintCustomerReceiptPage;