
// ✅ stockApi.js — API สำหรับ StockDashboard (manual load per block)
import apiClient from '@/utils/apiClient';

// หมายเหตุ: endpoint ฝั่ง server ควรเป็น /api/stock/dashboard/*
// ถ้า server คุณใช้ path อื่น เปลี่ยนเฉพาะ path ในฟังก์ชันพวกนี้

// ✅ ดึงภาพรวมงานสต๊อก (IN_STOCK / CLAIMED / SOLD today / missing pending review)
export const getStockDashboardOverview = async () => {
  try {
    const res = await apiClient.get('/stock/dashboard/overview');
    return res?.data;
  } catch (err) {
    console.error('❌ getStockDashboardOverview error:', err);
    const msg =
      err?.response?.data?.error ||
      err?.response?.data?.message ||
      err?.message ||
      'ไม่สามารถโหลดข้อมูลภาพรวมงานสต๊อกได้';
    throw new Error(msg);
  }
};

// ✅ ดึงรอบตรวจนับที่กำลังทำอยู่ (ถ้ามี)
export const getStockDashboardAuditInProgress = async () => {
  try {
    const res = await apiClient.get('/stock/dashboard/audit-in-progress');
    return res?.data;
  } catch (err) {
    console.error('❌ getStockDashboardAuditInProgress error:', err);
    const msg =
      err?.response?.data?.error ||
      err?.response?.data?.message ||
      err?.message ||
      'ไม่สามารถโหลดข้อมูลการตรวจนับได้';
    throw new Error(msg);
  }
};

// ✅ ดึงภาพรวมความเสี่ยงสต๊อก (LOST / DAMAGED / USED / RETURNED)
export const getStockDashboardRisk = async () => {
  try {
    const res = await apiClient.get('/stock/dashboard/risk');
    return res?.data;
  } catch (err) {
    console.error('❌ getStockDashboardRisk error:', err);
    const msg =
      err?.response?.data?.error ||
      err?.response?.data?.message ||
      err?.message ||
      'ไม่สามารถโหลดข้อมูลความเสี่ยงสต๊อกได้';
    throw new Error(msg);
  }
};











