import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Box,
    Typography,
    CircularProgress,
    TableFooter,
} from '@mui/material';

// ฟังก์ชันสำหรับจัดรูปแบบตัวเลข
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

/**
 * คอมโพเนนต์สำหรับแสดงผลข้อมูลรายงานภาษีซื้อในรูปแบบตาราง
 * @param {object} props
 * @param {Array} props.data - ข้อมูลรายงานที่จะแสดง
 * @param {object} props.summary - ข้อมูลสรุปยอดรวม
 * @param {boolean} props.isLoading - สถานะกำลังโหลดข้อมูล
 */
export const InputTaxReportTable = ({ data, summary, isLoading }) => {
    // แสดงสถานะกำลังโหลด
    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>กำลังโหลดข้อมูล...</Typography>
            </Box>
        );
    }

    // แสดงเมื่อไม่พบข้อมูล
    if (!data || data.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', height: 200, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                    ไม่พบข้อมูล กรุณาเลือกเดือนและปีกด "แสดงรายงาน"
                </Typography>
            </Box>
        );
    }

    // ✅ หัวตารางที่นำคอลัมน์ "สาขา" ออกแล้ว
    const headers = [
        'วัน เดือน ปี',
        'เลขที่ใบกำกับภาษี',
        'ชื่อผู้ขาย',
        'เลขประจำตัวผู้เสียภาษีอากร',
        'มูลค่าสินค้าหรือบริการ',
        'ภาษีมูลค่าเพิ่ม',
        'รวม',
    ];

    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="input tax report table">
                <TableHead>
                    <TableRow>
                        {headers.map((header) => (
                            <TableCell key={header} align={['มูลค่าสินค้าหรือบริการ', 'ภาษีมูลค่าเพิ่ม', 'รวม'].includes(header) ? 'right' : 'left'}>
                                {header}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell>{item.supplierTaxInvoiceDate ? new Date(item.supplierTaxInvoiceDate).toLocaleDateString('th-TH') : '-'}</TableCell>
                            <TableCell>{item.supplierTaxInvoiceNumber || '-'}</TableCell>
                            <TableCell>{item.supplierName || 'N/A'}</TableCell>
                            <TableCell>{item.supplierTaxId || 'N/A'}</TableCell>
                            {/* ✅ ข้อมูลที่นำคอลัมน์ "สาขา" ออกแล้ว */}
                            <TableCell align="right">{formatNumber(item.totalAmount)}</TableCell>
                            <TableCell align="right">{formatNumber(item.vatAmount)}</TableCell>
                            <TableCell align="right">{formatNumber(item.grandTotal)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                    <TableRow sx={{ '& > *': { fontWeight: 'bold' } }}>
                        {/* ✅ ปรับ colSpan ให้ถูกต้องหลังจากลบคอลัมน์ */}
                        <TableCell colSpan={4} align="right">
                            ยอดรวม
                        </TableCell>
                        <TableCell align="right">{formatNumber(summary.totalAmount)}</TableCell>
                        <TableCell align="right">{formatNumber(summary.vatAmount)}</TableCell>
                        <TableCell align="right">{formatNumber(summary.grandTotal)}</TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </TableContainer>
    );
};
