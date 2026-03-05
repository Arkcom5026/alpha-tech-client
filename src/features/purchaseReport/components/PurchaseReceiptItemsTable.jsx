




// ============================================================
// 📁 FILE: src/features/purchaseReport/components/PurchaseReceiptItemsTable.jsx
// ✅ Receipt Items Table — Reusable component for RC detail
// - Pure presentational component
// - No direct API calls
// ============================================================

import React, { useMemo } from 'react';

import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';

// ------------------------------
// Helpers
// ------------------------------
const safeNumber = (v) => {
  const n = v == null ? 0 : Number(v);
  return Number.isFinite(n) ? n : 0;
};

const formatMoney = (v) => {
  const n = safeNumber(v);
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatQty = (v) => {
  const n = safeNumber(v);
  const hasDecimal = Math.abs(n % 1) > 0;
  return n.toLocaleString('en-US', {
    minimumFractionDigits: hasDecimal ? 2 : 0,
    maximumFractionDigits: hasDecimal ? 2 : 0,
  });
};

/**
 * @param {Object} props
 * @param {Array}  props.items - [{ id, productName, quantity, unitName, costPrice, totalCost }]
 * @param {number} props.totalAmount - optional override total; if not provided, sums totalCost
 * @param {string} props.title - optional title
 */
const PurchaseReceiptItemsTable = ({ items, totalAmount, title }) => {
  const safeItems = Array.isArray(items) ? items : [];

  const computedTotal = useMemo(() => {
    return safeItems.reduce((sum, it) => sum + safeNumber(it?.totalCost), 0);
  }, [safeItems]);

  const effectiveTotal = safeNumber(totalAmount) > 0 ? safeNumber(totalAmount) : computedTotal;

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 1 }}>
        {title || 'รายการสินค้าในใบรับ'}
      </Typography>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small" aria-label="purchase receipt items">
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ width: 70 }}>#</TableCell>
              <TableCell>สินค้า</TableCell>
              <TableCell align="right" sx={{ width: 140 }}>
                จำนวน
              </TableCell>
              <TableCell sx={{ width: 120 }}>หน่วย</TableCell>
              <TableCell align="right" sx={{ width: 160 }}>
                ราคา/หน่วย (ทุน)
              </TableCell>
              <TableCell align="right" sx={{ width: 170 }}>
                รวมบรรทัด
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {safeItems.map((it, idx) => (
              <TableRow key={it?.id || idx} hover>
                <TableCell>{idx + 1}</TableCell>
                <TableCell>{it?.productName || '-'}</TableCell>
                <TableCell align="right">{formatQty(it?.quantity)}</TableCell>
                <TableCell>{it?.unitName || '-'}</TableCell>
                <TableCell align="right">{formatMoney(it?.costPrice)}</TableCell>
                <TableCell align="right">{formatMoney(it?.totalCost)}</TableCell>
              </TableRow>
            ))}

            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell colSpan={5} align="right">
                <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
                  ยอดรวมทั้งหมด
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
                  {formatMoney(effectiveTotal)}
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default PurchaseReceiptItemsTable;








