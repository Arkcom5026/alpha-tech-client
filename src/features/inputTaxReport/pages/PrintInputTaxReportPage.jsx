// ===== สร้างหน้าใหม่: PrintInputTaxReportPage.jsx =====

// src/features/inputTaxReport/pages/PrintInputTaxReportPage.jsx

import React, { useRef, useEffect, useState } from 'react';
import {
    Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, TableFooter, Button,
    Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress // Import CircularProgress
} from '@mui/material';
// เปลี่ยนจาก useReactToPrint เป็น window.print()
// import { useReactToPrint } from 'react-to-print'; // Removed this import
import { useInputTaxReportStore } from '../store/inputTaxReporStore';

const PrintInputTaxReportPage = () => {
    const {
        reportData,
        filters,
        summary,
        isLoading, // ดึงสถานะ isLoading จาก store
        fetchInputTaxReport
    } = useInputTaxReportStore();

    const printRef = useRef(); // printRef is still used for the main document Box

    const [companyInfo, setCompanyInfo] = useState({
        name: 'ชื่อบริษัท (กำลังโหลด...)',
        address: 'ที่อยู่ (กำลังโหลด...)',
        taxId: 'เลขประจำตัวผู้เสียภาษี (กำลังโหลด...)',
    });

    const [showPdfMessage, setShowPdfMessage] = useState(false);
    const [pdfMessage, setPdfMessage] = useState('');

    // State เพื่อตรวจสอบว่าข้อมูลพร้อมสำหรับการพิมพ์หรือไม่
    const [isPrintContentReady, setIsPrintContentReady] = useState(false);
    const [branchDataLoaded, setBranchDataLoaded] = useState(false); // New state for branch data loading status

    const formatNumber = (value) => {
        const num = Number(value);
        if (isNaN(num)) {
            return '0.00';
        }
        return num.toLocaleString('th-TH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    // เปลี่ยน handlePrint ให้ใช้ window.print() โดยตรง
    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPdf = () => {
        console.log('Downloading PDF...');
        setPdfMessage('ฟังก์ชันดาวน์โหลด PDF ยังไม่พร้อมใช้งานในขณะนี้ กรุณาใช้ฟังก์ชัน "พิมพ์" และเลือก "บันทึกเป็น PDF" ในหน้าต่างพิมพ์');
        setShowPdfMessage(true);
    };

    const handleClosePdfMessage = () => {
        setShowPdfMessage(false);
        setPdfMessage('');
    };

    // Effect for fetching report data from store
    useEffect(() => {
        console.log('Fetching input tax report...');
        fetchInputTaxReport();
    }, [fetchInputTaxReport]);

    // Effect for loading company info from localStorage
    useEffect(() => {
        console.log('Loading branch data from localStorage...');
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
                    console.warn('currentBranch not found in branch-storage');
                    setCompanyInfo({
                        name: 'ชื่อบริษัท (ไม่พบข้อมูลสาขา)',
                        address: 'ที่อยู่ (ไม่พบข้อมูลสาขา)',
                        taxId: 'เลขประจำตัวผู้เสียภาษี (ไม่พบข้อมูลสาขา)',
                    });
                    setBranchDataLoaded(false);
                }
            } else {
                console.warn('branch-storage not found in localStorage');
                setCompanyInfo({
                    name: 'ชื่อบริษัท (ไม่พบข้อมูลสาขา)',
                    address: 'ที่อยู่ (ไม่พบข้อมูลสาขา)',
                    taxId: 'เลขประจำตัวผู้เสียภาษี (ไม่พบข้อมูลสาขา)',
                });
                setBranchDataLoaded(false);
            }
        } catch (error) {
            console.error('Error parsing branch-storage from localStorage:', error);
            setCompanyInfo({
                name: 'ชื่อบริษัท (เกิดข้อผิดพลาด)',
                address: 'ที่อยู่ (เกิดข้อผิดพลาด)',
                taxId: 'เลขประจำตัวผู้เสียภาษี (เกิดข้อผิดพลาด)',
            });
            setBranchDataLoaded(false);
        }
    }, []); // This effect runs only once on mount

    // Effect to determine if content is ready for print
    useEffect(() => {
        // isPrintContentReady will be true when data is loaded (printRef.current is not a dependency for window.print())
        const ready = !isLoading && branchDataLoaded;
        setIsPrintContentReady(ready);

        console.log('Readiness Check (Data Only):', { // Changed log name for clarity
            isLoading,
            branchDataLoaded,
            isPrintContentReady: ready,
        });

    }, [isLoading, branchDataLoaded]); // printRef.current is NOT a dependency here

    // Number of empty rows to maintain fixed table height
    const maxRowCount = 30;
    const emptyRowCount = Math.max(maxRowCount - (reportData?.length || 0), 0);

    return (
        <div className='flex flex-col items-center p-4 min-h-screen'> {/* Changed to flex-col and items-center for overall layout */}
            {/* Buttons for Print and PDF - Now visible on screen */}
            <Box sx={{
                position: 'fixed', // Fixed position to stay visible on scroll
                top: 80, // Adjust top position as needed
                left: '80%', // Start from 50% from the left
                transform: 'translateX(-50%)', // Move back by half of its own width to center
                display: 'flex', // THIS LINE MAKES THE BUTTONS VISIBLE AGAIN
                gap: 2,
                zIndex: 1000,
                padding: '16px',
                backgroundColor: '#1976d2',
                borderRadius: '8px', // Apply rounded corners to all sides
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                '@media print': { // Added media query for print
                    display: 'none', // Hide buttons when printing
                },
            }} className="print:hidden"> {/* This class hides the buttons only when printing */}
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handlePrint}
                    disabled={!isPrintContentReady} // Disable if content not ready
                >
                    พิมพ์
                </Button>
                <Button
                    variant="outlined"
                    sx={{
                        color: 'white', // White text for outlined button on blue background
                        borderColor: 'white', // White border for outlined button
                        '&:hover': {
                            borderColor: 'white',
                            backgroundColor: 'rgba(255,255,255,0.1)', // Slight white background on hover
                        }
                    }}
                    onClick={handleDownloadPdf}
                    disabled={!isPrintContentReady}
                >
                    PDF
                </Button>
            </Box>

            <div className='border-black'>
                {/* Printable content container */}
                <Box ref={printRef} sx={{
                    width: '210mm',
                    minHeight: '297mm',
                    padding: '4mm', // Adjusted padding to match BillLayoutFullTax more closely
                    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                    backgroundColor: 'white',
                    fontFamily: 'TH Sarabun New, sans-serif',
                    fontSize: 18, // Overall font size
                    marginTop: '-10px', // Adjusted margin-top to bring it closer to the top
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative' // Added position relative for absolute positioning of overlay
                }}>
                    {/* Loading Overlay */}
                    {!isPrintContentReady && (
                        <Box sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent white overlay
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            zIndex: 1001, // Ensure it's above content
                        }}>
                            <CircularProgress />
                            <Typography sx={{ ml: 2, mt: 2 }}>กำลังเตรียมข้อมูลสำหรับพิมพ์...</Typography>
                        </Box>
                    )}

                    {/* Header */}
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start', // Align items to the top
                        borderBottom: '1px solid #6b7280', // Darker grey border
                        paddingBottom: '8px',
                        marginBottom: '8px',
                        fontSize: '0.875rem' // text-sm
                    }}>
                        <Box sx={{ textAlign: 'left' }}>
                            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', mb: 0.5, fontSize: '1rem' }}> {/* Adjusted font size */}
                                {companyInfo.name}
                            </Typography>
                            <Typography variant="body2" component="div" sx={{ mb: 0.5, fontSize: '0.875rem' }}> {/* Adjusted font size */}
                                ที่อยู่: {companyInfo.address}
                            </Typography>
                            <Typography variant="body2" component="div" sx={{ fontSize: '0.875rem' }}> {/* Adjusted font size */}
                                เลขประจำตัวผู้เสียภาษีอากร: {companyInfo.taxId}
                            </Typography>
                        </Box>

                        {/* Report Title */}
                        <Box sx={{
                            textAlign: 'center', mb: 3,
                        }}>
                            <Typography variant="h6" component="h1" gutterBottom sx={{ fontWeight: 'bold', textDecoration: 'underline', fontSize: '1.125rem' }}> {/* Adjusted font size */}
                                รายงานภาษีซื้อ
                            </Typography>
                            <Typography variant="body1" component="div" sx={{ fontSize: '0.875rem' }}> {/* Adjusted font size */}
                                สำหรับเดือนภาษี {filters.taxMonth || '-'} / {filters.taxYear ? filters.taxYear + 543 : '-'}
                            </Typography>
                        </Box>

                    </Box>


                    {/* Table */}
                    <Table size="small" sx={{
                        border: '1px solid #000', mt: 2,
                    }}>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f0f0f0' }}>
                                <TableCell align="center" sx={{ fontWeight: 'bold', width: '5%', border: '1px solid #ddd', padding: '4px', minHeight: '28px' }}>ลำดับ</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', width: '13%', border: '1px solid #ddd', padding: '4px', minHeight: '28px' }}>วัน เดือน ปี</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', width: '15%', border: '1px solid #ddd', padding: '4px', minHeight: '28px' }}>เลขที่ใบกำกับ</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', width: '30%', border: '1px solid #ddd', padding: '4px', minHeight: '28px' }}>ชื่อผู้ขาย</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', width: '12%', border: '1px solid #ddd', padding: '4px', minHeight: '28px' }}>มูลค่าสินค้า</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', width: '13%', border: '1px solid #ddd', padding: '4px', minHeight: '28px' }}>ภาษีมูลค่าเพิ่ม</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', width: '11%', border: '1px solid #ddd', padding: '4px', minHeight: '28px' }}>รวมเป็นเงิน</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {reportData?.length > 0 ? (
                                reportData.map((item, index) => (
                                    <TableRow key={item.id || index}>
                                        <TableCell align="center" sx={{ border: '1px solid #ddd', padding: '4px', minHeight: '28px' }}>{index + 1}</TableCell>
                                        <TableCell align="center" sx={{ border: '1px solid #ddd', padding: '4px', minHeight: '28px' }}>
                                            {item.supplierTaxInvoiceDate ? new Date(item.supplierTaxInvoiceDate).toLocaleDateString('th-TH') : '-'}
                                        </TableCell>
                                        <TableCell align="center" sx={{ border: '1px solid #ddd', padding: '4px', minHeight: '28px' }}>{item.supplierTaxInvoiceNumber || '-'}</TableCell>
                                        <TableCell align="center" sx={{ border: '1px solid #ddd', padding: '4px', minHeight: '28px' }}>{item.supplierName || 'N/A'}</TableCell>
                                        <TableCell align="right" sx={{ border: '1px solid #ddd', padding: '4px', minHeight: '28px' }}>{formatNumber(item.totalAmount)}</TableCell>
                                        <TableCell align="right" sx={{ border: '1px solid #ddd', padding: '4px', minHeight: '28px' }}>{formatNumber(item.vatAmount)}</TableCell>
                                        <TableCell align="right" sx={{ border: '1px solid #ddd', padding: '4px', minHeight: '28px' }}>{formatNumber(item.grandTotal)}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ p: 2, borderRight: '1px solid #000', minHeight: '28px' }}>
                                        ไม่พบข้อมูลสำหรับเดือนภาษีนี้
                                    </TableCell>
                                </TableRow>
                            )}
                            {/* Empty rows to maintain fixed height */}
                            {[...Array(emptyRowCount)].map((_, idx) => (
                                <TableRow key={`empty-${idx}`}>
                                    <TableCell sx={{ border: '1px solid #ddd', padding: '4px', minHeight: '28px' }}>&nbsp;</TableCell>
                                    <TableCell sx={{ border: '1px solid #ddd', padding: '4px', minHeight: '28px' }}>&nbsp;</TableCell>
                                    <TableCell sx={{ border: '1px solid #ddd', padding: '4px', minHeight: '28px' }}>&nbsp;</TableCell>
                                    <TableCell sx={{ border: '1px solid #ddd', padding: '4px', minHeight: '28px' }}>&nbsp;</TableCell>
                                    <TableCell sx={{ border: '1px solid #ddd', padding: '4px', minHeight: '28px' }}>&nbsp;</TableCell>
                                    <TableCell sx={{ border: '1px solid #ddd', padding: '4px', minHeight: '28px' }}>&nbsp;</TableCell>
                                    <TableCell sx={{ border: '1px solid #ddd', padding: '4px', minHeight: '28px' }}>&nbsp;</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>


                    <div>
                        {/* Summary Section - New structure based on BillLayoutFullTax */}
                        {summary && (
                            <Box sx={{
                                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.75rem', marginTop: 'auto', paddingTop: '16px', minHeight: '130px',
                            }}>
                                {/* Removed the list items as they are not in the provided image of the tax report */}
                                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', textAlign: 'right' }}>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', paddingY: '4px' }}>
                                        <Typography>รวมเงิน / SUB TOTAL</Typography>
                                        <Typography>{formatNumber(summary.totalAmount - summary.vatAmount)} ฿</Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', paddingY: '4px' }}>
                                        <Typography>ภาษีมูลค่าเพิ่ม / VAT</Typography>
                                        <Typography>{formatNumber(summary.vatAmount)} ฿</Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', paddingY: '4px' }}>
                                        <Typography>จำนวนเงินรวมทั้งสิ้น </Typography>
                                        <Typography>{formatNumber(summary.grandTotal)} ฿</Typography>
                                    </Box>
                                </Box>
                            </Box>
                        )}
                    </div>


                    {/* Footer / Signatures */}
                    <Box sx={{
                        mt: 'auto', pt: 4, textAlign: 'right', fontSize: 16,
                    }}>

                    </Box>
                </Box>

            </div>

            {/* PDF Message Dialog */}
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
