

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
export const PurchaseReportTable = ({ data, summary, isLoading, onRowClick }) => {
  // ✅ Receipt-level summary (aligned with BE)
  const safeSummary = summary || { receiptCount: 0, itemCount: 0, totalAmount: 0 };

  const handleRowClick = (row) => {
    try {
      if (typeof onRowClick === 'function') onRowClick(row);
    } catch (_) {
      // ignore
    }
  };

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
      <Table sx={{ minWidth: 650 }} aria-label="purchase receipt report table">
        <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
          <TableRow>
            <TableCell>วันที่รับ</TableCell>
            <TableCell>เลขที่ใบรับ</TableCell>
            <TableCell>อ้างอิง PO</TableCell>
            <TableCell>ผู้ขาย</TableCell>
            <TableCell>สถานะใบรับ</TableCell>
            <TableCell>สถานะชำระ</TableCell>
            <TableCell align="right">จำนวนรายการ</TableCell>
            <TableCell align="right">ยอดรวมใบรับ</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {data.map((row, index) => {
            const clickable = typeof onRowClick === 'function' && Number.isFinite(Number(row?.receiptId));

            return (
              <TableRow
                key={`${row.receiptId || 'r'}-${row.receiptCode || 'c'}-${index}`}
                sx={{
                  '&:last-child td, &:last-child th': { border: 0 },
                  cursor: clickable ? 'pointer' : 'default',
                }}
                hover
                onClick={clickable ? () => handleRowClick(row) : undefined}
              >
                <TableCell component="th" scope="row">
                  {row.receiptDate ? new Date(row.receiptDate).toLocaleDateString('th-TH') : '-'}
                </TableCell>

                <TableCell>{row.receiptCode || '-'}</TableCell>
                <TableCell>{row.poCode || '-'}</TableCell>
                <TableCell>{row.supplierName || '-'}</TableCell>

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

                <TableCell align="right">{formatQty(row.itemCount)}</TableCell>
                <TableCell align="right">{formatMoney(row.totalAmount)}</TableCell>
              </TableRow>
            );
          })}

          {/* Summary Row (ตารางมี 8 คอลัมน์ => colSpan ต้องรวมให้ครบ 8) */}
          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
            {/* 1..7 */}
            <TableCell colSpan={7} align="right">
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                ยอดรวมทั้งหมด
              </Typography>
            </TableCell>
            {/* 8 */}
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

