// 🧾 เพิ่มสรุปรายงานท้ายหน้า
// 🔁 ปรับใหม่ให้โหลดข้อมูลเองผ่าน useSalesTaxReportStore() และแสดงผลตามช่วงวันจาก query string
import React, { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useBranchStore } from '@/features/branch/store/branchStore';
import { useSalesTaxReportStore } from '../store/salesTaxReportStore';
import { useSearchParams } from 'react-router-dom';
import SalesTaxTable from '../components/SalesTaxTable';

const PrintSalesTaxReportPage = () => {
  const componentRef = useRef(null);
  const { currentBranch } = useBranchStore();
  const { salesTaxData, loadSalesTaxDataAction } = useSalesTaxReportStore();
  const [searchParams] = useSearchParams();

  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'รายงานภาษีขาย',
  });

  useEffect(() => {
    if (startDate && endDate) {
      loadSalesTaxDataAction(startDate, endDate);
    }
  }, [startDate, endDate, loadSalesTaxDataAction]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${date.getFullYear()}`;
  };

  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return '0.00';
    return new Intl.NumberFormat('th-TH', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const sales = salesTaxData?.sales || [];
  const returns = salesTaxData?.returns || [];

  const totalBase = sales.reduce((sum, i) => sum + i.baseAmount, 0) - returns.reduce((sum, i) => sum + i.baseAmount, 0);
  const totalVat = sales.reduce((sum, i) => sum + i.vatAmount, 0) - returns.reduce((sum, i) => sum + i.vatAmount, 0);
  const totalAmount = sales.reduce((sum, i) => sum + i.totalAmount, 0) - returns.reduce((sum, i) => sum + i.totalAmount, 0);

  return (
    <div className="flex flex-col items-center p-4 bg-gray-200">
      <div className="w-[210mm] flex justify-end gap-2 mb-2 print-hidden">
        <button
          onClick={() => {
            if (componentRef.current) handlePrint();
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
          .print-hidden {
            display: none !important;
          }
          html, body {
            font-size: 16px;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          @page {
            size: A4 portrait;
            margin: 0;
          }
          .printable-area-container {
            padding: 0 !important;
            background: white !important;
          }
          .printable-area {
            border: none !important;
            box-shadow: none !important;
            margin: 0 !important;
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

      <div className="printable-area-container w-full">
        <div
          ref={componentRef}
          className="w-full mx-auto flex flex-col text-[10px] p-[10mm] bg-white justify-between"
          style={{
            width: '210mm',
            height: '297mm',
            fontFamily: 'TH Sarabun New, sans-serif',
            boxSizing: 'border-box',
            overflow: 'hidden',
          }}
        >
          <div className="flex flex-col gap-1">
            <div className="text-center">
              <div className="font-bold underline text-base mb-1">รายงานภาษีขาย</div>
              <div className="text-xs mb-1">
                ระหว่างวันที่ {formatDate(startDate)} ถึง {formatDate(endDate)}
              </div>
            </div>

            <div className="mb-1 text-xs">
              <div className="font-bold">{currentBranch?.name || '-'}</div>
              <div>ที่อยู่: {currentBranch?.address || '-'} {currentBranch?.province || ''}</div>
              <div>เบอร์โทร: {currentBranch?.phone || '-'}</div>
            </div>

            <br />

            <div>
              <SalesTaxTable title="รายการขาย (ใบกำกับภาษี)" items={sales} type="sales" />
            </div>

            {returns && returns.length > 0 && (
              <div>
                <SalesTaxTable title="รายการคืน (ใบลดหนี้)" items={returns} type="returns" />
              </div>
            )}
          </div>

          <div className="mt-2 flex justify-between items-start">
            <div className="w-[35%] border border-black p-1.5 text-center text-xs">
              <div className="font-bold mb-4 ">ผู้จัดทำ/ผู้ตรวจสอบ</div>
              <div>.......................................................</div>
              <div className="mt-1">วันที่: ......../......../........</div>
            </div>


            <div className="w-[50%] text-sm  p-2">
              <div className="flex justify-between mb-1">
                <span>รวมมูลค่าสินค้า / SUB TOTAL</span>
                <span>{formatCurrency(totalBase)} ฿</span>
              </div>
              <div className="flex justify-between mb-1 pt-2 ">
                <span>ภาษีมูลค่าเพิ่ม / VAT</span>
                <span>{formatCurrency(totalVat)} ฿</span>
              </div>
              <div className="flex justify-between font-bold pt-2 ">
                <span>จำนวนเงินรวมทั้งสิ้น / GRAND TOTAL</span>
                <span>{formatCurrency(totalAmount)} ฿</span>
              </div>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintSalesTaxReportPage;
