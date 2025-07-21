// 🔁 ปรับใหม่ให้ใช้โครงสร้างเดียวกับ BillLayoutFullTax เพื่อให้พอดีหน้า A4 จริง ไม่มีหน้า 2 โดยไม่จำเป็น
import React, { useRef, useEffect, useState } from 'react';
import {
    Typography, Table, TableHead, TableRow, TableCell, TableBody, TableFooter, Button,
    Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress
} from '@mui/material';
import { useInputTaxReportStore } from '../store/inputTaxReporStore';

const PrintInputTaxReportPage = () => {
    const {
        reportData,
        filters,
        summary,
        isLoading,
        fetchInputTaxReportAction
    } = useInputTaxReportStore();

    const printRef = useRef();
    const [companyInfo, setCompanyInfo] = useState({
        name: 'ชื่อบริษัท (กำลังโหลด...)',
        address: 'ที่อยู่ (กำลังโหลด...)',
        taxId: 'เลขประจำตัวผู้เสียภาษี (กำลังโหลด...)',
    });
    const [showPdfMessage, setShowPdfMessage] = useState(false);
    const [pdfMessage, setPdfMessage] = useState('');
    const [isPrintContentReady, setIsPrintContentReady] = useState(false);
    const [branchDataLoaded, setBranchDataLoaded] = useState(false);

    const formatNumber = (value) => {
        const num = Number(value);
        if (isNaN(num)) return '0.00';
        return num.toLocaleString('th-TH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    const handlePrint = () => window.print();

    const handleDownloadPdf = () => {
        if (!printRef.current) return;
        import('html2pdf.js').then((html2pdf) => {
            const element = printRef.current;
            const opt = {
                margin: 0,
                filename: `รายงานภาษีซื้อ-${filters.taxMonth || 'xx'}-${filters.taxYear || 'xxxx'}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            html2pdf().set(opt).from(element).save();
        });
    };

    const handleClosePdfMessage = () => {
        setShowPdfMessage(false);
        setPdfMessage('');
    };

    useEffect(() => {
        fetchInputTaxReportAction();
    }, [fetchInputTaxReportAction]);

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
                    setBranchDataLoaded(true);
                }
            }
        } catch (e) {
            setBranchDataLoaded(false);
        }
    }, []);

    useEffect(() => {
        setIsPrintContentReady(!isLoading && branchDataLoaded);
    }, [isLoading, branchDataLoaded]);

    return (
        <div className="flex flex-col items-center p-4 bg-gray-200">
            <style>
                {`
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
            background-color: #d1d5db !important; /* gray-400 */
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            }
          }
        `}
            </style>

            <div className="print-hidden flex justify-end gap-2 w-full mb-4 max-w-[210mm]">
                <Button onClick={handlePrint} variant="contained">พิมพ์</Button>
                <Button onClick={handleDownloadPdf} variant="contained" color="secondary">PDF</Button>
            </div>

            <div className="printable-area-container w-full">
                <div
                    ref={printRef}
                    className="w-full mx-auto flex flex-col text-[10px] p-[10mm] border border-black bg-white"
                    style={{
                        width: '210mm',
                        height: '297mm',
                        fontFamily: 'TH Sarabun New, sans-serif',
                        boxSizing: 'border-box',
                        overflow: 'hidden'
                    }}>

                    <div className="flex flex-col gap-1 flex-grow">
                        <div className="text-center">
                            <div className="font-bold underline text-lg mb-1">รายงานภาษีซื้อ</div>
                            <div className="text-xs mb-1">
                                สำหรับเดือนภาษี {
                                    filters?.taxMonth
                                        ? ['', 'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'][parseInt(filters.taxMonth, 10)]
                                        : '-'
                                } ปี {filters?.taxYear ? filters.taxYear + 543 : '-'}
                            </div>
                        </div>

                        <div className="mb-1 text-xs">
                            <div className="font-bold">{companyInfo.name}</div>
                            <div>ที่อยู่: {companyInfo.address}</div>
                            <div>เลขประจำตัวผู้เสียภาษีอากร: {companyInfo.taxId}</div>
                        </div>

                        <table className="w-full border border-black border-collapse mb-2 text-xs" style={{ pageBreakInside: 'avoid' }}>
                            <thead>
                                <tr className="bg-gray-300">
                                    <th className="border border-black px-1 py-[2px] font-bold">ลำดับ</th>
                                    <th className="border border-black px-1 py-[2px] font-bold">วันที่</th>
                                    <th className="border border-black px-1 py-[2px] font-bold">เลขที่ใบกำกับ</th>
                                    <th className="border border-black px-1 py-[2px] font-bold text-left">ชื่อผู้ขาย</th>
                                    <th className="border border-black px-1 py-[2px] font-bold text-right">มูลค่าสินค้า</th>
                                    <th className="border border-black px-1 py-[2px] font-bold text-right">ภาษี</th>
                                    <th className="border border-black px-1 py-[2px] font-bold text-right">รวม</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.slice(0, 25).map((item, index) => (
                                    <tr key={index}>
                                        <td className="border border-black px-1 text-center align-top">{index + 1}</td>
                                        <td className="border border-black px-1 text-center align-top">{new Date(item.supplierTaxInvoiceDate).toLocaleDateString('th-TH')}</td>
                                        <td className="border border-black px-1 text-center align-top">{item.supplierTaxInvoiceNumber}</td>
                                        <td className="border border-black px-1 align-top">{item.supplierName}</td>
                                        <td className="border border-black px-1 text-right align-top">{formatNumber(item.totalAmount)}</td>
                                        <td className="border border-black px-1 text-right align-top">{formatNumber(item.vatAmount)}</td>
                                        <td className="border border-black px-1 text-right align-top">{formatNumber(item.grandTotal)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-between items-end text-[10px] mt-auto">
                        <div className="w-[40%] border border-black p-1.5 text-center">
                            <div className="font-bold mb-4">ผู้จัดทำ/ผู้ตรวจสอบ</div>
                            <div>.......................................................</div>
                            <div className="mt-1">วันที่: ......../......../........</div>
                        </div>
                        {summary && (
                            <div className="w-[50%]">
                                <div className="flex justify-between">
                                    <span>รวมเงิน / SUB TOTAL</span>
                                    <span className="font-bold">{formatNumber(summary.totalAmount - summary.vatAmount)} ฿</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>ภาษีมูลค่าเพิ่ม / VAT</span>
                                    <span className="font-bold">{formatNumber(summary.vatAmount)} ฿</span>
                                </div>
                                <div className="flex justify-between border-t-2 border-b-4 border-double border-black pt-1 mt-1 font-bold">
                                    <span>จำนวนเงินรวมทั้งสิ้น / GRAND TOTAL</span>
                                    <span>{formatNumber(summary.grandTotal)} ฿</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Dialog open={showPdfMessage} onClose={handleClosePdfMessage}>
                <DialogTitle>ข้อมูลการดาวน์โหลด PDF</DialogTitle>
                <DialogContent>
                    <Typography>{pdfMessage}</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClosePdfMessage}>ตกลง</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default PrintInputTaxReportPage;
