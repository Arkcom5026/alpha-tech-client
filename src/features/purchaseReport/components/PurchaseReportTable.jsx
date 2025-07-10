// src/features/purchaseReport/components/PurchaseReportTable.jsx
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
 * @param {number} num - ตัวเลข
 * @returns {string} - ตัวเลขที่จัดรูปแบบแล้ว
 */
const formatNumber = (num) => {
  if (typeof num !== 'number') return 'N/A';
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

/**
 * Component ตารางสำหรับแสดงผลรายงานการจัดซื้อ
 * @param {object} props
 * @param {Array} props.data - ข้อมูลรายงานจาก API ใหม่
 * @param {object} props.summary - ข้อมูลสรุปยอดรวมจาก API ใหม่
 * @param {boolean} props.isLoading - สถานะกำลังโหลด
 */
export const PurchaseReportTable = ({ data, summary, isLoading }) => {
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
          ไม่พบข้อมูลสำหรับรายงานนี้
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="purchase report table">
        <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
          <TableRow>
            <TableCell>วันที่รับ</TableCell>
            <TableCell>เลขที่ใบรับ</TableCell>
            <TableCell>สินค้า</TableCell>
            <TableCell>ผู้ขาย</TableCell>            
            <TableCell align="right">จำนวน</TableCell>
            <TableCell>หน่วย</TableCell>
            <TableCell align="right">ราคา/หน่วย (ทุน)</TableCell>
            <TableCell align="right">ราคารวม</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={`${row.receiptId}-${row.productName}-${index}`} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell component="th" scope="row">
                {new Date(row.receiptDate).toLocaleDateString('th-TH')}
              </TableCell>
              <TableCell>{row.receiptCode}</TableCell>
              <TableCell>{row.productName}</TableCell>
              <TableCell>{row.supplierName}</TableCell>              
              <TableCell align="right">{row.quantity}</TableCell>
              <TableCell>{row.unitName}</TableCell>
              <TableCell align="right">{formatNumber(row.costPrice)}</TableCell>
              <TableCell align="right">{formatNumber(row.totalCost)}</TableCell>
            </TableRow>
          ))}

          {/* Summary Row */}
          <TableRow sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
            <TableCell colSpan={8} align="right">
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>ยอดรวมทั้งหมด</Typography>
            </TableCell>
            <TableCell align="right">
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{formatNumber(summary.totalAmount)}</Typography>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};
