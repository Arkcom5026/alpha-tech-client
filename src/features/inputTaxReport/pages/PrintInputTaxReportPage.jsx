// PrintInputTaxReportPage.jsx (ใช้ InputTaxReportTable แทนการสร้างตารางเอง)

import React, { useRef, useEffect, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useInputTaxReportStore } from '../store/inputTaxReporStore';
import { format } from 'date-fns';
import InputTaxReportTable from '../components/InputTaxReportTable';


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
    const d = new Date(dateStr);
    return isNaN(d) ? '-' : format(d, 'dd/MM/yyyy');
  };

  useEffect(() => {
    fetchInputTaxReportAction();
  }, [fetchInputTaxReportAction]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const start = searchParams.get('startDate');
    const end = searchParams.get('endDate');
    if (start) setStartDate(start);
    if (end) setEndDate(end);
  }, []);

  useEffect(() => {
    try {
      const branchStorage = localStorage.getItem('branch-storage');
      if (branchStorage) {
        const parsedStorage = JSON.parse(branchStorage);
        const currentBranch = parsedStorage.state?.currentBranch;
        if (currentBranch) {
          setCompanyInfo({
            name: currentBranch.name || 'ชื่อบริษัท (ไม่พบข้อมูล)',
            address: currentBranch.address || 'ที่อยู่ (ไม่พบข้อมูล)',
            taxId: currentBranch.taxId || 'เลขประจำตัวผู้เสียภาษี (ไม่พบข้อมูล)',
          });
        }
      }
    } catch (e) {
      console.error('โหลดข้อมูลสาขาไม่สำเร็จ');
    }
  }, []);

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

          <InputTaxReportTable items={reportData} type="normal" />

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
                  <span className="font-bold">{formatNumber(summary.totalAmount - summary.vatAmount)} ฿</span>
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
