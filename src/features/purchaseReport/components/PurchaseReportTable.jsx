
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
  Chip,
  Stack,
} from '@mui/material';

/**
 * ฟังก์ชันสำหรับจัดรูปแบบตัวเลขเงิน (มี comma + 2 ตำแหน่ง)
 */
const formatMoney = (num) => {
  const n = Number(num);
  if (!Number.isFinite(n)) return '0.00';
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

/**
 * ฟังก์ชันสำหรับจัดรูปแบบจำนวน (รองรับ Decimal ที่ถูกส่งมาเป็น number/string)
 * - ถ้าเป็นจำนวนเต็ม แสดงเป็นจำนวนเต็ม
 * - ถ้ามีทศนิยม แสดง 2 ตำแหน่ง
 */
const formatQty = (qty) => {
  const n = Number(qty);
  if (!Number.isFinite(n)) return '0';
  const isInt = Math.abs(n - Math.round(n)) < 1e-9;
  if (isInt) return n.toLocaleString('en-US', { maximumFractionDigits: 0 });
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const receiptStatusLabel = (s) => {
  if (!s) return '-';
  const map = {
    PENDING: 'รอดำเนินการ',
    COMPLETED: 'เสร็จสมบูรณ์',
    CANCELLED: 'ยกเลิก',
  };
  return map[s] || s;
};

const paymentStatusLabel = (s) => {
  if (!s) return '-';
  const map = {
    UNPAID: 'ค้างชำระ',
    PARTIALLY_PAID: 'ชำระบางส่วน',
    WAITING_APPROVAL: 'รอตรวจสอบ',
    PAID: 'ชำระแล้ว',
    CANCELLED: 'ยกเลิก',
  };
  return map[s] || s;
};

/**
 * Component ตารางสำหรับแสดงผลรายงานการจัดซื้อ
 */
export const PurchaseReportTable = ({ data, summary, isLoading }) => {
  const safeSummary = summary || { totalAmount: 0, totalItems: 0, uniqueReceipts: 0 };

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
            <TableCell>สถานะใบรับ</TableCell>
            <TableCell>สถานะชำระ</TableCell>
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
            <TableRow
              key={`${row.receiptId || 'r'}-${row.receiptCode || 'c'}-${row.productName || 'p'}-${index}`}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              hover
            >
              <TableCell component="th" scope="row">
                {row.receiptDate ? new Date(row.receiptDate).toLocaleDateString('th-TH') : '-'}
              </TableCell>

              <TableCell>{row.receiptCode || '-'}</TableCell>

              <TableCell>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip size="small" label={receiptStatusLabel(row.receiptStatus)} variant="outlined" />
                </Stack>
              </TableCell>

              <TableCell>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip size="small" label={paymentStatusLabel(row.paymentStatus)} variant="outlined" />
                </Stack>
              </TableCell>

              <TableCell>{row.productName || '-'}</TableCell>
              <TableCell>{row.supplierName || '-'}</TableCell>
              <TableCell align="right">{formatQty(row.quantity)}</TableCell>
              <TableCell>{row.unitName || '-'}</TableCell>
              <TableCell align="right">{formatMoney(row.costPrice)}</TableCell>
              <TableCell align="right">{formatMoney(row.totalCost)}</TableCell>
            </TableRow>
          ))}

          {/* Summary Row (ตารางมี 10 คอลัมน์ => colSpan ต้องรวมให้ครบ 10) */}
          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
            {/* 1..9 */}
            <TableCell colSpan={9} align="right">
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                ยอดรวมทั้งหมด
              </Typography>
            </TableCell>
            {/* 10 */}
            <TableCell align="right">
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {formatMoney(safeSummary.totalAmount)}
              </Typography>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};