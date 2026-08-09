// ✅ stockApi.js — API สำหรับ StockDashboard (manual load per block)
import apiClient from '@/utils/apiClient';

// Server mounts stock dashboard routes at /api/stock/*.
// apiClient already supplies the /api prefix.

const getErrorMessage = (err, fallback) =>
  String(
    err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      fallback
  );

// ✅ ดึงภาพรวมงานสต๊อก (IN_STOCK / CLAIMED / SOLD today / missing pending review)
export const getStockDashboardOverview = async () => {
  try {
    const res = await apiClient.get('/stock/overview');
    return res?.data;
  } catch (err) {
    console.error('❌ getStockDashboardOverview error:', err);
    throw new Error(getErrorMessage(err, 'ไม่สามารถโหลดข้อมูลภาพรวมงานสต๊อกได้'));
  }
};

// ✅ ดึงรอบตรวจนับที่กำลังทำอยู่ (ถ้ามี)
export const getStockDashboardAuditInProgress = async () => {
  try {
    const res = await apiClient.get('/stock/audit-in-progress');
    return res?.data;
  } catch (err) {
    console.error('❌ getStockDashboardAuditInProgress error:', err);
    throw new Error(getErrorMessage(err, 'ไม่สามารถโหลดข้อมูลการตรวจนับได้'));
  }
};

// ✅ ดึงภาพรวมความเสี่ยงสต๊อก (LOST / DAMAGED / USED / RETURNED)
export const getStockDashboardRisk = async () => {
  try {
    const res = await apiClient.get('/stock/risk');
    return res?.data;
  } catch (err) {
    console.error('❌ getStockDashboardRisk error:', err);
    throw new Error(getErrorMessage(err, 'ไม่สามารถโหลดข้อมูลความเสี่ยงสต๊อกได้'));
  }
};
