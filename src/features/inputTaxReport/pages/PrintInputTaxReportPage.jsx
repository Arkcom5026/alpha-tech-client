// PrintInputTaxReportPage.jsx
// ✅ ใช้ Store เป็น Source of Truth แทนการอ่าน localStorage ตรง
// ✅ branchId ลำดับความสำคัญ:
// selectedBranchId (กรณีสลับสาขา/SuperAdmin) → branchStore detail → authStore.employee.branchId

import React, { useRef, useEffect, useMemo, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { format } from 'date-fns';

import InputTaxReportTable from '../components/InputTaxReportTable';
import { useInputTaxReportStore } from '../store/inputTaxReporStore';
import { useBranchStore } from '@/features/branch/store/branchStore';
import { useAuthStore } from '@/features/auth/store/authStore';

const parseLocalDateInput = (value) => {
  if (!value) return null;

  const m = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(String(value));
  if (!m) return null;

  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);

  if (!y || mo < 1 || mo > 12 || d < 1 || d > 31) return null;

  return new Date(y, mo - 1, d);
};

const PrintInputTaxReportPage = () => {
  const {
    reportData,
    summary,
    isLoading,
    fetchInputTaxReportAction,
  } = useInputTaxReportStore();

  const printRef = useRef();

  const selectedBranchId = useBranchStore((s) => s.selectedBranchId);
  const branchDetail = useBranchStore((s) => s.branch || s.currentBranch || s.activeBranch || null);
  const authBranchId = useAuthStore((s) => s.employee?.branchId);

  const branchId = useMemo(() => {
    const raw =
      selectedBranchId ??
      branchDetail?.id ??
      branchDetail?.branchId ??
      authBranchId ??
      null;

    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [selectedBranchId, branchDetail?.id, branchDetail?.branchId, authBranchId]);

  const companyInfo = useMemo(() => {
    const b = branchDetail || {};

    return {
      name: b.name || 'ชื่อบริษัท (ไม่พบข้อมูล)',
      address: b.address || 'ที่อยู่ (ไม่พบข้อมูล)',
      taxId: b.taxId || 'เลขประจำตัวผู้เสียภาษี (ไม่พบข้อมูล)',
    };
  }, [branchDetail]);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get('startDate');
    const e = params.get('endDate');

    if (s) setStartDate(s);
    if (e) setEndDate(e);
  }, []);

  const handlePrint = useReactToPrint({
    content: () => printRef.current || null,
    documentTitle: 'รายงานภาษีซื้อ',
  });

  const formatNumber = (value) => {
    const num = Number(value);

    if (Number.isNaN(num)) return '0.00';

    return num.toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDateThai = (dateStr) => {
    const d = parseLocalDateInput(dateStr);
    return !d || Number.isNaN(d.getTime()) ? '-' : format(d, 'dd/MM/yyyy');
  };

  const rangeParams = useMemo(() => {
    if (!startDate || !endDate) return null;

    return {
      startDate,
      endDate,
    };
  }, [startDate, endDate]);

  useEffect(() => {
    if (!branchId) return;
    if (!rangeParams) return;

    fetchInputTaxReportAction(branchId, rangeParams);
  }, [branchId, rangeParams, fetchInputTaxReportAction]);

  return (
    <div className="input-tax-report-print-shell flex min-h-screen flex-col items-center bg-gray-200 p-4 print:min-h-0 print:bg-white print:p-0">
      <div className="mb-2 flex w-[210mm] justify-end gap-2 print-hidden">
        <button
          type="button"
          onClick={() => {
            if (printRef.current) handlePrint();
            else console.warn('⚠️ ยังโหลด component ไม่เสร็จ ไม่สามารถพิมพ์ได้');
          }}
          className="rounded bg-green-600 px-4 py-1 text-sm text-white hover:bg-green-700"
        >
          PDF
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          className="rounded bg-blue-600 px-4 py-1 text-sm text-white hover:bg-blue-700"
        >
          พิมพ์
        </button>
      </div>

      <style>{`
        @page { size: A4 portrait; margin: 4mm; }

        .input-tax-report-a4-page {
          box-sizing: border-box;
          width: 210mm;
          min-height: 296mm;
          margin: 0 auto;
          padding: 6mm;
          font-family: var(--document-font-family, "TH Sarabun New", "Sarabun", Tahoma, Arial, sans-serif);
        }

        @media print {
          .print-hidden { display: none !important; }
          html,
          body,
          #root,
          .input-tax-report-print-shell,
          .input-tax-report-print-container {
            width: auto !important;
            min-height: 0 !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            background: white !important;
          }
          .input-tax-report-a4-page {
            box-sizing: border-box !important;
            width: 201mm !important;
            min-height: 288mm !important;
            height: 288mm !important;
            margin: 0 auto !important;
            padding: 5mm !important;
            overflow: hidden !important;
            border: 0.3mm solid #444 !important;
            border-radius: 2.5mm !important;
            box-shadow: none !important;
            background: white !important;
            font-family: var(--document-font-family, "TH Sarabun New", "Sarabun", Tahoma, Arial, sans-serif) !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          thead tr {
            background-color: #d1d5db !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          table, th, td {
            border: 1px solid black;
            border-collapse: collapse;
          }
        }
      `}</style>

      <div className="input-tax-report-print-container w-full">
        <article
          ref={printRef}
          className="input-tax-report-a4-page relative flex flex-col bg-white text-[12px] text-black shadow-sm"
        >
          <div role="banner" className="border-b border-slate-300 pb-2 text-center">
            <div className="mb-1 text-[20px] font-bold leading-tight underline">รายงานภาษีซื้อ</div>
            <div className="mb-1 text-[14px] leading-tight">
              ช่วงวันที่: {formatDateThai(startDate)} - {formatDateThai(endDate)}
            </div>
          </div>

          <div className="mb-1 mt-2 text-[14px] leading-tight">
            <div className="font-bold">{companyInfo.name}</div>
            <div>ที่อยู่: {companyInfo.address}</div>
            <div>เลขประจำตัวผู้เสียภาษีอากร: {companyInfo.taxId}</div>
          </div>

          <div className="mt-2">
            {!branchId ? (
              <div className="py-4 text-center text-red-600">
                ไม่พบ branchId กรุณาเข้าสู่ระบบใหม่ หรือเลือกสาขาก่อนพิมพ์รายงาน
              </div>
            ) : isLoading ? (
              <div className="py-4 text-center">กำลังโหลดข้อมูล...</div>
            ) : (
              <InputTaxReportTable items={reportData} type="normal" />
            )}
          </div>

          <div className="mt-auto flex items-end justify-between gap-6 pt-3 text-[13px]">
            <div className="w-[35%] rounded-[2mm] border border-black p-2 text-center leading-tight">
              <div className="mb-4 font-bold">ผู้จัดทำ/ผู้ตรวจสอบ</div>
              <div>.......................................................</div>
              <div className="mt-1">วันที่: ......../......../........</div>
            </div>

            {summary && (
              <div className="w-[50%] text-[14px] leading-tight">
                <div className="flex justify-between">
                  <span>รวมเงิน / SUB TOTAL</span>
                  <span className="font-bold">{formatNumber(summary.totalAmount)} ฿</span>
                </div>

                <div className="flex justify-between pt-2">
                  <span>ภาษีมูลค่าเพิ่ม / VAT</span>
                  <span className="font-bold">{formatNumber(summary.vatAmount)} ฿</span>
                </div>

                <div className="mt-1 flex justify-between border-t border-black pt-2 font-bold">
                  <span>จำนวนเงินรวมทั้งสิ้น / GRAND TOTAL</span>
                  <span>{formatNumber(summary.grandTotal)} ฿</span>
                </div>
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  );
};

export default PrintInputTaxReportPage;
