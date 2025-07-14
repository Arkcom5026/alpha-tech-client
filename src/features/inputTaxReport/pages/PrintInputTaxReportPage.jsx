// ===== สร้างหน้าใหม่: PrintInputTaxReportPage.jsx =====

// src/features/inputTaxReport/pages/PrintInputTaxReportPage.jsx

import React, { useRef, useEffect, useState } from 'react';
import {
    Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, TableFooter, Button,
    Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress
} from '@mui/material';
import { useInputTaxReportStore } from '../store/inputTaxReporStore';

// --- ไอคอน ---
const PrintIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
        <polyline points="6 9 6 2 18 2 18 9"></polyline>
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
        <rect width="12" height="8" x="6" y="14"></rect>
    </svg>
);
const BackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
        <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
);


const PrintInputTaxReportPage = () => {
    const {
        reportData,
        filters,
        summary,
        isLoading,
        fetchInputTaxReport
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

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPdf = () => {
        setPdfMessage('ฟังก์ชันดาวน์โหลด PDF ยังไม่พร้อมใช้งานในขณะนี้ กรุณาใช้ฟังก์ชัน "พิมพ์" และเลือก "บันทึกเป็น PDF" ในหน้าต่างพิมพ์');
        setShowPdfMessage(true);
    };

    const handleClosePdfMessage = () => {
        setShowPdfMessage(false);
        setPdfMessage('');
    };

    const handleGoBack = () => {
        window.history.back();
    };

    useEffect(() => {
        // Fetch input tax report data when the component mounts
        fetchInputTaxReport();
    }, [fetchInputTaxReport]);

    useEffect(() => {
        // Load company/branch information from localStorage
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
                } else {
                    setCompanyInfo({
                        name: 'ชื่อบริษัท (ไม่พบข้อมูลสาขา)',
                        address: 'ที่อยู่ (ไม่พบข้อมูลสาขา)',
                        taxId: 'เลขประจำตัวผู้เสียภาษี (ไม่พบข้อมูลสาขา)',
                    });
                    setBranchDataLoaded(false);
                }
            } else {
                setCompanyInfo({
                    name: 'ชื่อบริษัท (ไม่พบข้อมูลสาขา)',
                    address: 'ที่อยู่ (ไม่พบข้อมูลสาขา)',
                    taxId: 'เลขประจำตัวผู้เสียภาษี (ไม่พบข้อมูลสาขา)',
                });
                setBranchDataLoaded(false);
            }
        } catch (error) {
            console.error("Failed to parse branch-storage from localStorage", error);
            setCompanyInfo({
                name: 'ชื่อบริษัท (เกิดข้อผิดพลาด)',
                address: 'ที่อยู่ (เกิดข้อผิดพลาด)',
                taxId: 'เลขประจำตัวผู้เสียภาษี (เกิดข้อผิดพลาด)',
            });
            setBranchDataLoaded(false);
        }
    }, []);

    useEffect(() => {
        // Determine if the print content is ready (data loaded and branch info loaded)
        const ready = !isLoading && branchDataLoaded;
        setIsPrintContentReady(ready);
    }, [isLoading, branchDataLoaded]);

    // Calculate empty rows to maintain a consistent table height for printing
    const maxRowCount = 28; // Max rows per page for the table
    const emptyRowCount = Math.max(maxRowCount - (reportData?.length || 0), 0);

    return (
        <div className='flex flex-col items-center p-4 min-h-screen'>
            {/* Styles for printing */}
            <style>
                {`
                @media print {
                    /* Hide elements not meant for print */
                    .print-hidden {
                        display: none !important;
                    }
                    .no-print-placeholder {
                        display: none !important;
                    }

                    /* Page setup for printing */
                    @page {
                        margin: 10mm; /* Adjust page margins as needed */
                        /* Define page numbers in the bottom-right corner of the printout */
                        @bottom-right {
                            content: "หน้า " counter(page) " / " counter(pages);
                            font-family: 'TH Sarabun New', sans-serif; /* Apply font to print footer */
                            font-size: 10pt; /* Adjust font size for print footer */
                            color: #000; /* Ensure black color for print */
                        }
                    }

                    /* Ensure body and html have no default margins/padding for print */
                    body, html {
                        margin: 0;
                        padding: 0;
                        -webkit-print-color-adjust: exact; /* For better color accuracy on print */
                        print-color-adjust: exact;
                    }

                    /* Ensure the main printable box fits the page */
                    .printable-area {
                        width: 210mm; /* A4 width */
                        /* min-height: 297mm; REMOVED to prevent unwanted page breaks */
                        box-shadow: none; /* Remove shadow for print */
                        border: none; /* Remove border for print */
                        padding: 0; /* Adjust padding if needed, @page margin handles overall */
                    }

                    /* Adjust table cell padding for print if necessary */
                    .MuiTableCell-root {
                        padding: 4px 6px !important; /* Slightly reduce padding for print */
                    }
                }
                `}
            </style>

            {/* ✅ แก้ไข: ปรับปรุงตำแหน่งและรูปแบบของปุ่ม */}
            <Box sx={{ position: 'fixed', top: 80, right: 30, display: 'flex', gap: 2, zIndex: 1000 }} className="print-hidden">
                <Button variant="outlined" startIcon={<BackIcon />} onClick={handleGoBack}>กลับ</Button>
                <Button variant="contained" color="primary" startIcon={<PrintIcon />} onClick={handlePrint} disabled={!isPrintContentReady}>พิมพ์</Button>
                <Button variant="outlined" onClick={handleDownloadPdf} disabled={!isPrintContentReady}>PDF</Button>
            </Box>

            <div className='border-black'>
                {/* Printable content container */}

                <Box
                    ref={printRef}
                    sx={{
                        width: '210mm',
                        Height: '297mm',
                        padding: '2mm',
                        boxSizing: 'border-box',
                        overflow: 'hidden',
                        backgroundColor: 'white',
                        fontFamily: 'TH Sarabun New, sans-serif',
                        fontSize: 16,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        pageBreakInside: 'avoid',
                        '@media print': {
                            margin: 0,
                            boxShadow: 'none',
                        },
                    }}
                >

                    {/* Loading Overlay */}
                    {!isPrintContentReady && (
                        <Box sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            zIndex: 1001,
                        }} className="print-hidden">
                            <CircularProgress />
                            <Typography sx={{ ml: 2, mt: 2 }}>กำลังเตรียมข้อมูลสำหรับพิมพ์...</Typography>
                        </Box>
                    )}

                    {/* Header Section */}
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        borderBottom: '1px solid #6b7280',
                        paddingBottom: '8px',
                        marginBottom: '8px',
                    }}>
                        <Typography variant="h6" component="h1" gutterBottom sx={{ fontWeight: 'bold', textDecoration: 'underline', fontSize: '1.25rem', mb: 1 }}>
                            รายงานภาษีซื้อ
                        </Typography>
                        <Typography variant="body1" component="div" sx={{ fontSize: '0.9rem', mb: 2 }}>
                            สำหรับเดือนภาษี {filters.taxMonth || '-'} / {filters.taxYear ? filters.taxYear + 543 : '-'}
                        </Typography>

                        <Box sx={{
                            width: '100%',
                            textAlign: 'left',
                            fontSize: '0.875rem',
                            mt: 2
                        }}>
                            <Typography variant="body2" component="div" sx={{ fontWeight: 'bold', mb: 0.5, fontSize: '1rem' }}>
                                {companyInfo.name}
                            </Typography>
                            <Typography variant="body2" component="div" sx={{ mb: 0.5, fontSize: '0.875rem' }}>
                                ที่อยู่: {companyInfo.address}
                            </Typography>
                            <Typography variant="body2" component="div" sx={{ fontSize: '0.875rem' }}>
                                เลขประจำตัวผู้เสียภาษีอากร: {companyInfo.taxId}
                            </Typography>
                        </Box>
                    </Box>


                    {/* Table */}
                    <Table size="small" sx={{
                        border: '1px solid #000', mt: 2,
                        '& .MuiTableCell-root': {
                            border: '1px solid #ddd',
                            padding: '4px',
                            minHeight: '32px',
                            fontSize: '0.85rem'
                        }
                    }}>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f0f0f0' }}>
                                <TableCell align="center" sx={{ fontWeight: 'bold', width: '5%' }}>ลำดับ</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', width: '13%' }}>วัน เดือน ปี</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', width: '15%' }}>เลขที่ใบกำกับ</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', width: '30%' }}>ชื่อผู้ขาย</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', width: '12%' }}>มูลค่าสินค้า</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', width: '13%' }}>ภาษีมูลค่าเพิ่ม</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', width: '11%' }}>รวมเป็นเงิน</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {reportData?.length > 0 ? (
                                reportData.map((item, index) => (
                                    <TableRow key={item.id || index}>
                                        <TableCell align="center">{index + 1}</TableCell>
                                        <TableCell align="center">
                                            {item.supplierTaxInvoiceDate ? new Date(item.supplierTaxInvoiceDate).toLocaleDateString('th-TH') : '-'}
                                        </TableCell>
                                        <TableCell align="center">{item.supplierTaxInvoiceNumber || '-'}</TableCell>
                                        <TableCell align="left">{item.supplierName || 'N/A'}</TableCell>
                                        <TableCell align="right">{formatNumber(item.totalAmount)}</TableCell>
                                        <TableCell align="right">{formatNumber(item.vatAmount)}</TableCell>
                                        <TableCell align="right">{formatNumber(item.grandTotal)}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ p: 2 }}>
                                        ไม่พบข้อมูลสำหรับเดือนภาษีนี้
                                    </TableCell>
                                </TableRow>
                            )}
                           
                            {[...Array(emptyRowCount)].map((_, idx) => (
                                <TableRow key={`empty-${idx}`}>
                                    <TableCell>&nbsp;</TableCell>
                                    <TableCell>&nbsp;</TableCell>
                                    <TableCell>&nbsp;</TableCell>
                                    <TableCell>&nbsp;</TableCell>
                                    <TableCell>&nbsp;</TableCell>
                                    <TableCell>&nbsp;</TableCell>
                                    <TableCell>&nbsp;</TableCell>
                                </TableRow>
                            ))}

                        </TableBody>
                    </Table>


                    {/* Footer Container */}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-end',
                            width: '100%',
                            borderTop: '1px solid #6b7280',
                            fontSize: 14,
                            paddingTop: '8px',
                            marginTop: '8px',
                        }}>

                        {/* Signature Block */}
                        <Box sx={{
                            textAlign: 'center',
                            width: '40%',
                            border: '1px solid #000',
                            padding: '10px',
                            borderRadius: '4px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-end'
                        }}>
                            <Typography sx={{ mb: 2, fontWeight: 'bold' }}>ผู้จัดทำ/ผู้ตรวจสอบ</Typography>
                            <Typography sx={{ mb: 0 }}>.......................................................</Typography>
                            <Typography sx={{ mt: 1 }}>วันที่: ......../......../........</Typography>
                        </Box>

                        {/* Summary Section */}
                        {summary && (
                            <Box sx={{
                                width: '48%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'flex-end',
                                textAlign: 'right',
                            }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', paddingY: '4px' }}>
                                    <Typography>รวมเงิน / SUB TOTAL</Typography>
                                    <Typography sx={{ fontWeight: 'bold' }}>{formatNumber(summary.totalAmount - summary.vatAmount)} ฿</Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', paddingY: '4px' }}>
                                    <Typography>ภาษีมูลค่าเพิ่ม / VAT</Typography>
                                    <Typography sx={{ fontWeight: 'bold' }}>{formatNumber(summary.vatAmount)} ฿</Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', paddingY: '4px', borderTop: '1px solid #000', paddingTop: '8px' }}>
                                    <Typography>จำนวนเงินรวมทั้งสิ้น / GRAND TOTAL</Typography>
                                    <Typography>{formatNumber(summary.grandTotal)} ฿</Typography>
                                </Box>
                            </Box>
                        )}
                    </Box>
                </Box>
            </div>

            {/* PDF Download Message Dialog */}
            <Dialog
                open={showPdfMessage}
                onClose={handleClosePdfMessage}
                aria-labelledby="pdf-message-title"
                aria-describedby="pdf-message-description"
            >
                <DialogTitle id="pdf-message-title">{"ข้อมูลการดาวน์โหลด PDF"}</DialogTitle>
                <DialogContent>
                    <Typography id="pdf-message-description">
                        {pdfMessage}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClosePdfMessage} color="primary" autoFocus>
                        ตกลง
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default PrintInputTaxReportPage;
