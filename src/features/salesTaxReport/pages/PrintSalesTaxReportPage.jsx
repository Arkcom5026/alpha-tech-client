// 🧾 เพิ่มสรุปรายงานท้ายหน้า
// 🔁 ปรับใหม่ให้โหลดข้อมูลเองผ่าน useSalesTaxReportStore() และแสดงผลตามช่วงวันจาก query string
import React, { useEffect, useRef } from 'react';
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
    <div className="sales-tax-report-print-shell flex min-h-screen flex-col items-center bg-gray-200 p-4 print:min-h-0 print:bg-white print:p-0">
      <div className="mb-2 flex w-[210mm] justify-end gap-2 print-hidden">
        <button
          onClick={() => {
            if (componentRef.current) handlePrint();
            else console.warn('⚠️ ยังโหลด component ไม่เสร็จ ไม่สามารถพิมพ์ได้');
          }}
          className="rounded bg-green-600 px-4 py-1 text-sm text-white hover:bg-green-700"
        >
          PDF
        </button>

        <button
          onClick={() => window.print()}
          className="rounded bg-blue-600 px-4 py-1 text-sm text-white hover:bg-blue-700"
        >
          พิมพ์
        </button>
      </div>

      <style>{`
        @page { size: A4 portrait; margin: 4mm; }

        .sales-tax-report-a4-page {
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
          .sales-tax-report-print-shell,
          .sales-tax-report-print-container {
            width: auto !important;
            min-height: 0 !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            background: white !important;
          }
          .sales-tax-report-a4-page {
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

      <div className="sales-tax-report-print-container w-full">
        <article
          ref={componentRef}
          className="sales-tax-report-a4-page relative flex flex-col justify-between bg-white text-[12px] text-black shadow-sm"
        >
          <div className="flex flex-col gap-1">
            <div role="banner" className="border-b border-slate-300 pb-2 text-center">
              <div className="mb-1 text-[20px] font-bold leading-tight underline">รายงานภาษีขาย</div>
              <div className="mb-1 text-[14px] leading-tight">
                ระหว่างวันที่ {formatDate(startDate)} ถึง {formatDate(endDate)}
              </div>
            </div>

            <div className="mb-1 mt-2 text-[14px] leading-tight">
              <div className="font-bold">{currentBranch?.name || '-'}</div>
              <div>ที่อยู่: {currentBranch?.address || '-'} {currentBranch?.province || ''}</div>
              <div>เบอร์โทร: {currentBranch?.phone || '-'}</div>
            </div>

            <div className="mt-2">
              <SalesTaxTable title="รายการขาย (ใบกำกับภาษี)" items={sales} type="sales" />
            </div>

            {returns && returns.length > 0 && (
              <div>
                <SalesTaxTable title="รายการคืน (ใบลดหนี้)" items={returns} type="returns" />
              </div>
            )}
          </div>

          <div className="mt-3 flex items-end justify-between gap-6">
            <div className="w-[35%] rounded-[2mm] border border-black p-2 text-center text-[13px] leading-tight">
              <div className="mb-4 font-bold">ผู้จัดทำ/ผู้ตรวจสอบ</div>
              <div>.......................................................</div>
              <div className="mt-1">วันที่: ......../......../........</div>
            </div>

            <div className="w-[50%] p-2 text-[14px] leading-tight">
              <div className="mb-1 flex justify-between">
                <span>รวมมูลค่าสินค้า / SUB TOTAL</span>
                <span>{formatCurrency(totalBase)} ฿</span>
              </div>
              <div className="flex justify-between pt-2">
                <span>ภาษีมูลค่าเพิ่ม / VAT</span>
                <span>{formatCurrency(totalVat)} ฿</span>
              </div>
              <div className="mt-1 flex justify-between border-t border-black pt-2 font-bold">
                <span>จำนวนเงินรวมทั้งสิ้น / GRAND TOTAL</span>
                <span>{formatCurrency(totalAmount)} ฿</span>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

export default PrintSalesTaxReportPage;
