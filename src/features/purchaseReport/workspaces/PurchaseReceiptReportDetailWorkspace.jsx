












// ============================================================
// 📁 FILE: src/features/purchaseReport/pages/PurchaseReceiptReportDetailPage.jsx
// ✅ Receipt Detail Report (RC) — Production-grade, minimal-disruption
// - Data source: purchaseReportStore (no direct API calls)
// - Route expected: /pos/reports/purchase/receipts/:receiptId
// ============================================================

import React, { useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import {
  Box,
  Paper,
  Typography,
  Divider,
  Stack,
  Chip,
  Button,  CircularProgress,
} from '@mui/material';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { usePurchaseReportStore } from '../store/purchaseReportStore';
import { shallow } from 'zustand/shallow';
import PurchaseReceiptItemsTable from '../components/PurchaseReceiptItemsTable';

// ------------------------------
// Helpers (local, UI-only)
// ------------------------------
const __DEV__ = (() => {
  try {
    return !!import.meta?.env?.DEV;
  } catch (_) {
    return false;
  }
})();

const devLog = (...args) => {
  try {
    if (__DEV__) console.log(...args);
  } catch (_) {
    // ignore
  }
};

const devWarn = (...args) => {
  try {
    if (__DEV__) console.warn(...args);
  } catch (_) {
    // ignore
  }
};


const safeNumber = (v) => {
  const n = v == null ? 0 : Number(v);
  return Number.isFinite(n) ? n : 0;
};

const formatMoney = (v) => {
  const n = safeNumber(v);
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};



const receiptStatusLabel = (s) => {
  const v = String(s || '').toUpperCase();
  if (v === 'COMPLETED' || v === 'RECEIVED') return 'สำเร็จ';
  if (v === 'CANCELLED') return 'ยกเลิก';
  if (v === 'PENDING' || v === 'PARTIALLY_RECEIVED') return 'รอดำเนินการ';
  return s || '-';
};

const paymentStatusLabel = (s) => {
  const v = String(s || '').toUpperCase();
  if (v === 'PAID') return 'ชำระแล้ว';
  if (v === 'PARTIALLY_PAID') return 'ชำระบางส่วน';
  if (v === 'UNPAID') return 'ค้างชำระ';
  return s || '-';
};

const PurchaseReceiptReportDetailPage = () => {
  // 🔎 DEBUG: render counter (helps confirm infinite re-render)
  const renderCountRef = useRef(0);
  renderCountRef.current += 1;
  if (__DEV__ && (renderCountRef.current === 1 || renderCountRef.current % 25 === 0)) {
    devWarn('[PurchaseReceiptReportDetailPage] render count', renderCountRef.current);
  }

  const navigate = useNavigate();
  const { receiptId } = useParams();

  // ✅ IMPORTANT: Avoid object selector here (can cause getSnapshot warning / infinite re-render)
// Select each field individually to keep snapshot stable.
const receiptDetail = usePurchaseReportStore((s) => s.receiptDetail);
const receiptDetailItems = usePurchaseReportStore((s) => s.receiptDetailItems);
const detailLoading = usePurchaseReportStore((s) => s.detailLoading);
const detailError = usePurchaseReportStore((s) => s.detailError);
const fetchPurchaseReceiptDetailAction = usePurchaseReportStore((s) => s.fetchPurchaseReceiptDetailAction);

  const rid = useMemo(() => {
    const n = receiptId == null ? NaN : Number(receiptId);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [receiptId]);

  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const lastLoadedRidRef = useRef(null);

  // 🔎 DEBUG: subscribe to store changes (NO setState, safe)
  useEffect(() => {
    if (!__DEV__) return undefined;

    try {
      const unsub = usePurchaseReportStore.subscribe(
        (s) => ({
          detailReceiptId: s.detailReceiptId,
          detailLoading: s.detailLoading,
          detailError: s.detailError,
          receiptId: s.receiptDetail?.id ?? null,
          itemsLen: Array.isArray(s.receiptDetailItems) ? s.receiptDetailItems.length : -1,
        }),
        (next, prev) => {
          devLog('[purchaseReportStore] detail state change', { prev, next });
        },
        {
          equalityFn: shallow,
        }
      );
      return () => {
        try {
          unsub?.();
        } catch (_) {
          // ignore
        }
      };
    } catch (e) {
      devWarn('[PurchaseReceiptReportDetailPage] subscribe failed', e);
      return undefined;
    }
  }, []);


  useEffect(() => {
    // ✅ Fetch once per rid (StrictMode-safe) and avoid any store-driven loops
    if (!rid) return;
    if (lastLoadedRidRef.current === rid) return;

    lastLoadedRidRef.current = rid;

    try {
      if (typeof fetchPurchaseReceiptDetailAction === 'function') {
        // 🔎 DEBUG: confirm fetch trigger
        devLog('[PurchaseReceiptReportDetailPage] fetch detail start', {
          rid,
          lastLoaded: lastLoadedRidRef.current,
          hasAction: typeof fetchPurchaseReceiptDetailAction === 'function',
        });

        fetchPurchaseReceiptDetailAction(rid);

        devLog('[PurchaseReceiptReportDetailPage] fetch dispatched', { rid });
      }
    } catch (_) {
      // ignore
    }
  }, [rid, fetchPurchaseReceiptDetailAction]);

  const header = receiptDetail || null;
  const items = Array.isArray(receiptDetailItems) ? receiptDetailItems : [];

  const computed = useMemo(() => {
    const itemCount = items.length;
    const totalAmount = items.reduce((sum, it) => sum + safeNumber(it?.totalCost), 0);
    return {
      itemCount,
      totalAmount,
    };
  }, [items]);

  const effectiveTotal = safeNumber(header?.totalAmount) > 0 ? safeNumber(header?.totalAmount) : computed.totalAmount;
  const paidAmount = safeNumber(header?.paidAmount);
  const remainingAmount = Math.max(0, effectiveTotal - paidAmount);

  // ------------------------------
  // Render states
  // ------------------------------
  if (!rid) {
    return (
      <Box sx={{ p: 2 }}>
        <Paper sx={{ p: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={goBack}>
              กลับ
            </Button>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              รายละเอียดใบรับสินค้า
            </Typography>
          </Stack>
          <Typography color="error">receiptId ไม่ถูกต้อง</Typography>
        </Paper>
      </Box>
    );
  }

  if (detailLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 240 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (detailError) {
    return (
      <Box sx={{ p: 2 }}>
        <Paper sx={{ p: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={goBack}>
              กลับ
            </Button>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              รายละเอียดใบรับสินค้า
            </Typography>
          </Stack>
          <Typography color="error">{String(detailError)}</Typography>
        </Paper>
      </Box>
    );
  }

  if (!header) {
    return (
      <Box sx={{ p: 2 }}>
        <Paper sx={{ p: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={goBack}>
              กลับ
            </Button>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              รายละเอียดใบรับสินค้า
            </Typography>
          </Stack>
          <Typography color="text.secondary">ไม่พบข้อมูลใบรับสินค้าที่ต้องการ</Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={2}>
        {/* Header */}
        <Paper sx={{ p: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={goBack}>
                กลับ
              </Button>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.1 }}>
                  รายละเอียดใบรับสินค้า (RC)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ใช้สำหรับตรวจสอบรายการสินค้าในใบรับ และยอดรวมของเอกสาร
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Chip size="small" label={receiptStatusLabel(header.receiptStatus)} variant="outlined" />
              <Chip size="small" label={paymentStatusLabel(header.paymentStatus)} variant="outlined" />
            </Stack>
          </Stack>

          <Divider sx={{ my: 1.5 }} />

          {/* Meta */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 1.5 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary">
                เลขที่ใบรับ
              </Typography>
              <Typography sx={{ fontWeight: 800 }}>{header.receiptCode || '-'}</Typography>
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary">
                วันที่รับ
              </Typography>
              <Typography sx={{ fontWeight: 800 }}>
                {header.receiptDate ? new Date(header.receiptDate).toLocaleDateString('th-TH') : '-'}
              </Typography>
            </Box>

            <Box sx={{ flex: 2 }}>
              <Typography variant="caption" color="text.secondary">
                ผู้ขาย
              </Typography>
              <Typography sx={{ fontWeight: 800 }}>{header.supplierName || '-'}</Typography>
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary">
                อ้างอิง PO
              </Typography>
              <Typography sx={{ fontWeight: 800 }}>{header.poCode || '-'}</Typography>
            </Box>
          </Stack>

          {/* Totals */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Chip
              variant="outlined"
              label={`จำนวนรายการ: ${Number(computed.itemCount || 0).toLocaleString('en-US')}`}
            />
            <Chip variant="outlined" label={`ยอดรวม: ${formatMoney(effectiveTotal)}`} />
            <Chip variant="outlined" label={`จ่ายแล้ว: ${formatMoney(paidAmount)}`} />
            <Chip variant="outlined" label={`คงเหลือ: ${formatMoney(remainingAmount)}`} />
          </Stack>
        </Paper>

        {/* Items table */}
        <PurchaseReceiptItemsTable
          items={items}
          totalAmount={effectiveTotal}
          title="รายการสินค้าในใบรับ"
        />
      </Stack>
    </Box>
  );
};

export default PurchaseReceiptReportDetailPage;










