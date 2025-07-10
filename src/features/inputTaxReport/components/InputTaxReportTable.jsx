// src/features/inputTaxReport/components/InputTaxReportTable.jsx
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
  CircularProgress,
  Typography,
} from '@mui/material';

/**
 * ฟังก์ชันสำหรับจัดรูปแบบตัวเลขให้มี comma
 * @param {number | null | undefined} num - ตัวเลข
 * @returns {string} - ตัวเลขที่จัดรูปแบบแล้ว
 */
const formatNumber = (num) => {
  if (typeof num !== 'number') return '0.00';
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

/**
 * ฟังก์ชันสำหรับแปลงรหัสสาขาเป็นข้อความที่อ่านง่าย
 * @param {string | null | undefined} code - รหัสสาขา
 * @returns {string} - ข้อความที่อ่านง่าย
 */
const formatBranchCode = (code) => {
    if (!code) return 'N/A';
    if (code === '00000') return 'สำนักงานใหญ่';
    return `สาขาที่ ${code}`;
}

/**
 * Component ตารางสำหรับแสดงผลรายงานภาษีซื้อ
 * @param {object} props
 * @param {Array} props.data - ข้อมูลรายงาน
 * @param {object} props.summary - ข้อมูลสรุปยอดรวม
 * @param {boolean} props.isLoading - สถานะกำลังโหลด
 */
export const InputTaxReportTable = ({ data, summary, isLoading }) => {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
        <Typography variant="h6" color="text.secondary">
          ไม่พบข้อมูลสำหรับรายงานภาษีซื้อในเดือนที่เลือก
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="input tax report table">
        <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
          <TableRow>
            <TableCell>วัน เดือน ปี</TableCell>
            <TableCell>เลขที่ใบกำกับภาษี</TableCell>
            <TableCell>ชื่อผู้ขาย</TableCell>
            <TableCell>เลขประจำตัวผู้เสียภาษีฯ</TableCell>
            <TableCell>สถานประกอบการ</TableCell>
            <TableCell align="right">มูลค่าสินค้า/บริการ</TableCell>
            <TableCell align="right">จำนวนเงินภาษีฯ</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell component="th" scope="row">
                {new Date(row.taxInvoiceDate).toLocaleDateString('th-TH')}
              </TableCell>
              <TableCell>{row.taxInvoiceNumber}</TableCell>
              <TableCell>{row.supplierName}</TableCell>
              <TableCell>{row.supplierTaxId}</TableCell>
              <TableCell>{formatBranchCode(row.supplierTaxBranchCode)}</TableCell>
              <TableCell align="right">{formatNumber(row.baseAmount)}</TableCell>
              <TableCell align="right">{formatNumber(row.vatAmount)}</TableCell>
            </TableRow>
          ))}

          {/* Summary Row */}
          <TableRow sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
            <TableCell colSpan={5} align="right">
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>ยอดรวม</Typography>
            </TableCell>
            <TableCell align="right">
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{formatNumber(summary.totalBaseAmount)}</Typography>
            </TableCell>
            <TableCell align="right">
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{formatNumber(summary.totalVatAmount)}</Typography>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};
