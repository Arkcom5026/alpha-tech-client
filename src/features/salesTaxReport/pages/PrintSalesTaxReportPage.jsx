import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Button, CircularProgress, TableFooter } from '@mui/material';
import useSalesTaxReportStore from '../store/salesTaxReportStore';

// --- ฟังก์ชันช่วยเหลือ ---
const formatCurrency = (amount) => {
  if (typeof amount !== 'number') return '0.00';
  return new Intl.NumberFormat('th-TH', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

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


// --- คอมโพเนนต์หลักของหน้าพิมพ์ ---
const PrintSalesTaxReportPage = () => {
    const printRef = useRef();
    const { data, loading, error, clearReport } = useSalesTaxReportStore();
    
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isHydrated, setIsHydrated] = useState(false);
    const [companyInfo, setCompanyInfo] = useState({
        name: 'กำลังโหลดข้อมูลบริษัท...',
        address: 'กำลังโหลดที่อยู่...',
        taxId: 'กำลังโหลดเลขผู้เสียภาษี...',
    });
    const [isContentReady, setIsContentReady] = useState(false);

    useEffect(() => {
        setIsHydrated(true);

        const params = new URLSearchParams(window.location.search);
        setStartDate(params.get('startDate') || '');
        setEndDate(params.get('endDate') || '');

        try {
            const branchStorage = localStorage.getItem('branch-storage');
            if (branchStorage) {
                const parsedStorage = JSON.parse(branchStorage);
                const currentBranch = parsedStorage.state?.currentBranch;
                if (currentBranch) {
                    setCompanyInfo({
                        name: currentBranch.name || 'ไม่พบชื่อบริษัท',
                        address: currentBranch.address || 'ไม่พบที่อยู่',
                        taxId: currentBranch.taxId || 'ไม่พบเลขผู้เสียภาษี',
                    });
                }
            }
        } catch (error) {
            console.error("Failed to parse branch-storage from localStorage", error);
            setCompanyInfo({
                name: 'เกิดข้อผิดพลาดในการโหลดข้อมูลบริษัท',
                address: '',
                taxId: '',
            });
        }
    }, []);

    useEffect(() => {
        if (isHydrated && !loading && data) {
            setIsContentReady(true);
        } else {
            setIsContentReady(false);
        }
    }, [isHydrated, loading, data]);

    const handleGoBack = () => {
        clearReport();
        window.location.href = '/pos/reports/saletax';
    };

    const handlePrint = () => {
        window.print();
    };

    const { totalSalesValue, totalSalesVat, totalReturnsValue, totalReturnsVat, netValue, netVat, grandTotal } = useMemo(() => {
        if (!data) return { totalSalesValue: 0, totalSalesVat: 0, totalReturnsValue: 0, totalReturnsVat: 0, netValue: 0, netVat: 0, grandTotal: 0 };
        const totalSalesValue = data.sales?.reduce((sum, item) => sum + item.value, 0) || 0;
        const totalSalesVat = data.sales?.reduce((sum, item) => sum + item.vat, 0) || 0;
        const totalReturnsValue = data.returns?.reduce((sum, item) => sum + item.value, 0) || 0;
        const totalReturnsVat = data.returns?.reduce((sum, item) => sum + item.vat, 0) || 0;
        const netValue = totalSalesValue - totalReturnsValue;
        const netVat = totalSalesVat - totalReturnsVat;
        const grandTotal = netValue + netVat;
        return { totalSalesValue, totalSalesVat, totalReturnsValue, totalReturnsVat, netValue, netVat, grandTotal };
    }, [data]);

    // ✅ แก้ไข: เพิ่มคอลัมน์ "รวม" และปรับความกว้าง
    const salesHeaders = [
        { label: 'ลำดับ', align: 'center', width: '2%' },
        { label: 'วันที่', align: 'center', width: '21%' },
        { label: 'เลขที่เอกสาร', align: 'center', width: '21%' },
        { label: 'ชื่อผู้ซื้อ', align: 'left', width: '24%' },
        { label: 'มูลค่า', align: 'right', width: '10%' },
        { label: 'ภาษี (VAT)', align: 'right', width: '12%' },
	{ label: 'รวม', align: 'right', width: '10%' },
    ];
    const returnsHeaders = [
        { label: 'ลำดับ', align: 'center', width: '2%' },
        { label: 'วันที่', align: 'center', width: '21%' },
        { label: 'เลขที่ใบลดหนี้', align: 'center', width: '21%' },
        { label: 'อ้างอิงใบกำกับ', align: 'left', width: '24%' },
        { label: 'มูลค่า', align: 'right', width: '10%' },
        { label: 'ภาษี (VAT)', align: 'right', width: '12%' },
	{ label: 'รวม', align: 'right', width: '10%' },
    ];
    
    const salesCount = data?.sales?.length || 0;
    const returnsCount = data?.returns?.length || 0;

    const targetRowCount = 27;
    const emptyRowCount = returnsCount > 0
        ? Math.max(0, targetRowCount - returnsCount)
        : Math.max(0, targetRowCount - salesCount);

    return (
        <div className="report-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
            <style>
                {`
                .report-table {
                    border-collapse: collapse;
                    width: 100%;
                }
                .report-table th, .report-table td {
                    border: 1px solid #ddd;
                    font-family: 'TH Sarabun New', sans-serif;
                    padding: 4px 6px;
                }
                .report-table thead tr {
                    background-color: #f0f0f0 !important;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }

                @media print {
                    body, html, .report-container {
                        background-color: #fff !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    .print-hidden { display: none !important; }
                    @page { 
                        size: A4;
                        margin: 10mm; 
                        @bottom-right {
                            content: "หน้า " counter(page) " / " counter(pages);
                            font-family: 'TH Sarabun New', sans-serif;
                            font-size: 10pt;
                            color: #000;
                        }
                    }
                    .printable-area { 
                        box-shadow: none !important; 
                        border: none !important;
                        padding: 0 !important;
                    }
                    thead { display: table-header-group; }
                    tr { page-break-inside: avoid; }
                }
                `}
            </style>
            
            <Box sx={{ position: 'fixed', top: 80, right: 30, display: 'flex', gap: 2, zIndex: 1000 }} className="print-hidden">
                <Button variant="outlined" startIcon={<BackIcon />} onClick={handleGoBack}>กลับ</Button>
                <Button variant="contained" color="primary" startIcon={<PrintIcon />} onClick={handlePrint} disabled={!isContentReady}>พิมพ์</Button>
            </Box>

            {!isContentReady && (
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 120px)' }} className="print-hidden">
                    <CircularProgress />
                    <Typography sx={{ mt: 2, fontFamily: 'TH Sarabun New, sans-serif' }}>กำลังเตรียมข้อมูล...</Typography>
                </Box>
            )}

            <div ref={printRef} style={{ visibility: isContentReady ? 'visible' : 'hidden' }}>
                <Box
                    sx={{
                        width: '210mm',
                        minHeight: '297mm',
                        backgroundColor: 'white',
                        fontFamily: 'TH Sarabun New, sans-serif',
                        fontSize: 16,
                        display: 'flex',
                        flexDirection: 'column',
                        '@media screen': {
                            boxShadow: 3,
                        }
                    }}
                    className="printable-area"
                >
                    {/* Header Section */}
                    <Box sx={{ textAlign: 'center', borderBottom: '1px solid black', pb: 1, mb: 2 }}>
                        <Typography variant="h6" component="h1" sx={{ fontWeight: 'bold', fontFamily: 'TH Sarabun New, sans-serif' }}>รายงานภาษีขาย</Typography>
                        <Typography sx={{ fontFamily: 'TH Sarabun New, sans-serif' }}>สำหรับเดือนภาษี {formatDate(startDate)} ถึง {formatDate(endDate)}</Typography>
                        <Box sx={{ textAlign: 'left', mt: 2 }}>
                            <Typography sx={{ fontWeight: 'bold', fontFamily: 'TH Sarabun New, sans-serif' }}>{companyInfo.name}</Typography>
                            <Typography sx={{ fontFamily: 'TH Sarabun New, sans-serif' }}>ที่อยู่: {companyInfo.address}</Typography>
                            <Typography sx={{ fontFamily: 'TH Sarabun New, sans-serif' }}>เลขประจำตัวผู้เสียภาษีอากร: {companyInfo.taxId}</Typography>
                        </Box>
                    </Box>

                    {/* Content Section */}
                    <Box sx={{ flexGrow: 1 }}>
                        {/* Sales Table */}
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, fontFamily: 'TH Sarabun New, sans-serif' }}>รายการขาย (ใบกำกับภาษี)</Typography>
                        <Table size="small" className="report-table">
                            <TableHead>
                                <TableRow>
                                    {salesHeaders.map((header, i) => <TableCell key={i} align="center" sx={{ fontWeight: 'bold', width: header.width }}>{header.label}</TableCell>)}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {salesCount > 0 ? data.sales.map((item, index) => (
                                    <TableRow key={`sale-${index}`}>
                                        <TableCell align="center">{index + 1}</TableCell>
                                        <TableCell align="center">{formatDate(item.date)}</TableCell>
                                        <TableCell align="center">{item.invoiceNumber}</TableCell>
                                        <TableCell align="left">{item.customerName}</TableCell>
                                        <TableCell align="center">{formatCurrency(item.value)}</TableCell>
                                        <TableCell align="center">{formatCurrency(item.vat)}</TableCell>
                                        <TableCell align="center">{formatCurrency(item.value + item.vat)}</TableCell>
                                    </TableRow>
                                )) : <TableRow><TableCell colSpan={7} align="center">ไม่พบข้อมูล</TableCell></TableRow>}
                                
                                {returnsCount === 0 && [...Array(emptyRowCount)].map((_, idx) => (
                                    <TableRow key={`empty-sale-${idx}`}>
                                        {[...Array(7)].map((_, cellIdx) => (
                                            <TableCell key={cellIdx}>&nbsp;</TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                            {/* ✅ เพิ่ม: TableFooter */}
                            {salesCount > 0 && (
                                <TableFooter>
                                    <TableRow>
                                        <TableCell colSpan={4} align="right" sx={{fontWeight: 'bold'}}>ยอดรวม</TableCell>
                                        <TableCell align="right" sx={{fontWeight: 'bold'}}>{formatCurrency(totalSalesValue)}</TableCell>
                                        <TableCell align="right" sx={{fontWeight: 'bold'}}>{formatCurrency(totalSalesVat)}</TableCell>
                                        <TableCell align="right" sx={{fontWeight: 'bold'}}>{formatCurrency(totalSalesValue + totalSalesVat)}</TableCell>
                                    </TableRow>
                                </TableFooter>
                            )}
                        </Table>

                        {returnsCount > 0 && (
                            <Box sx={{ pageBreakBefore: 'always', pt: 2 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, fontFamily: 'TH Sarabun New, sans-serif' }}>รายการคืน (ใบลดหนี้)</Typography>
                                <Table size="small" className="report-table">
                                    <TableHead>
                                        <TableRow>
                                            {returnsHeaders.map((header, i) => <TableCell key={i} align="center" sx={{ fontWeight: 'bold', width: header.width }}>{header.label}</TableCell>)}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {data.returns.map((item, index) => (
                                            <TableRow key={`return-${index}`}>
                                                <TableCell align="center">{index + 1}</TableCell>
                                                <TableCell align="center">{formatDate(item.date)}</TableCell>
                                                <TableCell align="center">{item.creditNoteNumber}</TableCell>
                                                <TableCell align="left">{item.originalInvoiceNumber}</TableCell>
                                                <TableCell align="right">{formatCurrency(item.value)}</TableCell>
                                                <TableCell align="right">{formatCurrency(item.vat)}</TableCell>
                                                <TableCell align="right">{formatCurrency(item.value + item.vat)}</TableCell>
                                            </TableRow>
                                        ))}
                                        {[...Array(emptyRowCount)].map((_, idx) => (
                                            <TableRow key={`empty-return-${idx}`}>
                                                {[...Array(7)].map((_, cellIdx) => (
                                                    <TableCell key={cellIdx}>&nbsp;</TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                    {/* ✅ เพิ่ม: TableFooter */}
                                    <TableFooter>
                                        <TableRow>
                                            <TableCell colSpan={4} align="right" sx={{fontWeight: 'bold'}}>ยอดรวม</TableCell>
                                            <TableCell align="right" sx={{fontWeight: 'bold'}}>{formatCurrency(totalReturnsValue)}</TableCell>
                                            <TableCell align="right" sx={{fontWeight: 'bold'}}>{formatCurrency(totalReturnsVat)}</TableCell>
                                            <TableCell align="right" sx={{fontWeight: 'bold'}}>{formatCurrency(totalReturnsValue + totalReturnsVat)}</TableCell>
                                        </TableRow>
                                    </TableFooter>
                                </Table>
                            </Box>
                        )}
                    </Box>

                    {/* Footer Section */}
                    <Box sx={{ mt: 'auto', pageBreakInside: 'avoid' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid black', pt: 2 }}>
                            <Box sx={{ textAlign: 'center', width: '40%', border: '1px solid #ccc', padding: '10px', borderRadius: '4px' }}>
                                <Typography sx={{ mb: 2, fontFamily: 'TH Sarabun New, sans-serif' }}>ผู้จัดทำ/ผู้ตรวจสอบ</Typography>
                                <Box sx={{ borderBottom: '1px dotted black', height: '1px', width: '80%', margin: '0 auto 8px auto' }} />
                                <Typography sx={{ fontFamily: 'TH Sarabun New, sans-serif' }}>วันที่: ......../......../........</Typography>
                            </Box>
                            <Box sx={{ width: '48%', textAlign: 'right' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography sx={{ fontFamily: 'TH Sarabun New, sans-serif' }}>มูลค่ารวม (สุทธิ)</Typography>
                                    <Typography sx={{ fontWeight: 'bold', fontFamily: 'TH Sarabun New, sans-serif' }}>{formatCurrency(netValue)}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography sx={{ fontFamily: 'TH Sarabun New, sans-serif' }}>ภาษีขายรวม (สุทธิ)</Typography>
                                    <Typography sx={{ fontWeight: 'bold', fontFamily: 'TH Sarabun New, sans-serif' }}>{formatCurrency(netVat)}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: '1px solid black', mt: 1, pt: 1 }}>
                                    <Typography sx={{ fontWeight: 'bold', fontFamily: 'TH Sarabun New, sans-serif' }}>ยอดรวมทั้งสิ้น</Typography>
                                    <Typography sx={{ fontWeight: 'bold', fontFamily: 'TH Sarabun New, sans-serif' }}>{formatCurrency(grandTotal)}</Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </div>
        </div>
    );
};

export default PrintSalesTaxReportPage;
