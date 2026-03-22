
// src/features/stockAudit/api/stockAuditApi.js

import apiClient from '@/utils/apiClient'

// เริ่มรอบเช็คสต๊อกพร้อมขาย (สร้าง Expected Snapshot)
export const startReadyAudit = async () => {
  const { data, status } = await apiClient.post(
    '/stock-audit/ready/start',
    {},
    {
      validateStatus: (s) => (s >= 200 && s < 300) || s === 409,
    }
  )

  if (status === 409) {
    return {
      sessionId: data.sessionId,
      expectedCount: data.expectedCount || 0,
      reused: true,
    }
  }

  return {
    sessionId: data.sessionId,
    expectedCount: data.expectedCount,
    reused: false,
  }
}

// ดึงภาพรวมของ Session (expected, scanned, missing)
export const getAuditOverview = async (sessionId) => {
  const res = await apiClient.get(`/stock-audit/${sessionId}/overview`)
  return res.data
}

// ยิงบาร์โค้ดใน Session
export const scanAuditBarcode = async (sessionId, barcode, opts = {}) => {
  const payload = { barcode }
  if (opts && opts.mode) {
    payload.mode = opts.mode
  }

  const res = await apiClient.post(`/stock-audit/${sessionId}/scan`, payload)
  return res.data
}

// สแกนด้วย Serial Number โดยตรง
export const scanAuditSn = async (sessionId, sn) => {
  const res = await apiClient.post(`/stock-audit/${sessionId}/scan-sn`, { sn })
  return res.data
}

// ยืนยันผลการเช็ค (MARK_PENDING | MARK_LOST)
export const confirmAudit = async (sessionId, strategy = 'MARK_PENDING') => {
  const res = await apiClient.post(`/stock-audit/${sessionId}/confirm`, { strategy })
  return res.data
}

// ดึงรายการ Expected/Scanned + ค้นหา/แบ่งหน้า
export const getAuditItems = async (sessionId, params = {}) => {
  const scanned = params && params.scanned
  const q = params && params.q
  const page = params && params.page
  const pageSize = params && params.pageSize

  const res = await apiClient.get(`/stock-audit/${sessionId}/items`, {
    params: { scanned, q, page, pageSize },
  })
  return res.data
}

// ยกเลิกรอบตรวจนับ (Soft-cancel)
export const cancelAudit = async (sessionId, payload = {}) => {
  const res = await apiClient.post(`/stock-audit/${sessionId}/cancel`, payload)
  return res.data
}
