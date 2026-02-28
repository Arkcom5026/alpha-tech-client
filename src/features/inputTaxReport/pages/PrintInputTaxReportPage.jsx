
// PrintInputTaxReportPage.jsx (ใช้ InputTaxReportTable แทนการสร้างตารางเอง)

import React, { useRef, useEffect, useMemo, useState } from 'react';
import { useReactToPrint } from 'react-to-print';


import { format } from 'date-fns';
import InputTaxReportTable from '../components/InputTaxReportTable';
import { useInputTaxReportStore } from '../store/inputTaxReporStore';



const parseLocalDateInput = (value) => {
  // value: 'YYYY-MM-DD'
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
  const [companyInfo, setCompanyInfo] = useState({
    name: 'ชื่อบริษัท (กำลังโหลด...)',
    address: 'ที่อยู่ (กำลังโหลด...)',
    taxId: 'เลขประจำตัวผู้เสียภาษี (กำลังโหลด...)',
  });

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // อ่าน query จาก URL ครั้งแรก
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
    if (isNaN(num)) return '0.00';
    return num.toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDateThai = (dateStr) => {
    const d = parseLocalDateInput(dateStr);
    return !d || isNaN(d) ? '-' : format(d, 'dd/MM/yyyy');
  };

  const branchContext = useMemo(() => {
    try {
      const branchStorage = localStorage.getItem('branch-storage');
      if (!branchStorage) return { branchId: null, currentBranch: null };
      const parsedStorage = JSON.parse(branchStorage);
      const state = parsedStorage?.state || {};
      const currentBranch = state.currentBranch || null;
      const branchId = state.branchId ?? currentBranch?.id ?? currentBranch?.branchId ?? null;
      return { branchId: branchId ? Number(branchId) : null, currentBranch };
    } catch (e) {
      console.error('โหลดข้อมูลสาขาไม่สำเร็จ', e);
      return { branchId: null, currentBranch: null };
    }
  }, []);

  const rangeParams = useMemo(() => {
    if (!startDate || !endDate) return null;
    return {
      startDate,
      endDate,
    };
  }, [startDate, endDate]);

  // ยิง fetch เมื่อ branch และช่วงวันที่พร้อม
  useEffect(() => {
    if (!branchContext.branchId) return;
    if (!rangeParams) return;

    fetchInputTaxReportAction(branchContext.branchId, rangeParams);
  }, [branchContext.branchId, rangeParams, fetchInputTaxReportAction]);

  useEffect(() => {
    const currentBranch = branchContext.currentBranch;
    if (currentBranch) {
      setCompanyInfo({
        name: currentBranch.name || 'ชื่อบริษัท (ไม่พบข้อมูล)',
        address: currentBranch.address || 'ที่อยู่ (ไม่พบข้อมูล)',
        taxId: currentBranch.taxId || 'เลขประจำตัวผู้เสียภาษี (ไม่พบข้อมูล)',
      });
    }
  }, [branchContext.currentBranch]);

  return (
    <div className="flex flex-col items-center p-4 bg-gray-200">
      <div className="w-[210mm] flex justify-end gap-2 mb-2 print-hidden">
        <button
          onClick={() => {
            if (printRef.current) handlePrint();
            else console.warn('⚠️ ยังโหลด component ไม่เสร็จ ไม่สามารถพิมพ์ได้');
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded text-sm"
        >
          PDF
        </button>

        <button
          onClick={() => window.print()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded text-sm"
        >
          พิมพ์
        </button>
      </div>

      <style>{`
        @media print {
          .print-hidden { display: none !important; }
          html, body { font-size: 12px; margin: 0 !important; padding: 0 !important; background: white !important; }
          @page { size: A4 portrait; margin: 0; }
          .printable-area-container { padding: 0 !important; background: white !important; }
          .printable-area { border: none !important; box-shadow: none !important; margin: 0 !important; }
          thead tr { background-color: #d1d5db !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          table, th, td { border: 1px solid black; border-collapse: collapse; }
        }
      `}</style>

      <div className="printable-area-container w-full">
        <div
          ref={printRef}
          className="printable-area w-full mx-auto flex flex-col text-[12px] p-[10mm] bg-white"
          style={{ width: '210mm', height: '297mm', fontFamily: 'TH Sarabun New, sans-serif', boxSizing: 'border-box', overflow: 'hidden' }}
        >
          <div className="text-center">
            <div className="font-bold underline text-base mb-1">รายงานภาษีซื้อ</div>
            <div className="text-xs mb-1">
              ช่วงวันที่: {formatDateThai(startDate)} - {formatDateThai(endDate)}
            </div>
          </div>

          <div className="mb-1 text-sm">
            <div className="font-bold">{companyInfo.name}</div>
            <div>ที่อยู่: {companyInfo.address}</div>
            <div>เลขประจำตัวผู้เสียภาษีอากร: {companyInfo.taxId}</div>
          </div>
          <br />

          {isLoading ? (
            <div className="text-center py-4">กำลังโหลดข้อมูล...</div>
          ) : (
            <InputTaxReportTable items={reportData} type="normal" />
          )}

          <div className="flex justify-between items-end text-[12px] mt-auto">                     
            
            <div className="w-[35%] border border-black p-1.5 text-center text-xs">
              <div className="font-bold mb-4 ">ผู้จัดทำ/ผู้ตรวจสอบ</div>
              <div>.......................................................</div>
              <div className="mt-1">วันที่: ......../......../........</div>
            </div>           

            {summary && (
              <div className="w-[50%] ">
                <div className="flex justify-between ">
                  <span>รวมเงิน / SUB TOTAL</span>
                  <span className="font-bold">{formatNumber(summary.totalAmount)} ฿</span>
                </div>

                <div className="flex justify-between pt-2 ">
                  <span>ภาษีมูลค่าเพิ่ม / VAT</span>
                  <span className="font-bold">{formatNumber(summary.vatAmount)} ฿</span>
                </div>

                <div className="flex justify-between border-t-2 border-b-4 border-double border-black pt-2 mt-1 font-bold">
                  <span>จำนวนเงินรวมทั้งสิ้น / GRAND TOTAL</span>
                  <span>{formatNumber(summary.grandTotal)} ฿</span>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintInputTaxReportPage;



