
// features/stockAudit/api/stockAuditApi.js
// ✅ ปรับรูปแบบให้ “เหมือน customerApi”
// - ใช้ apiClient ตรง ๆ แล้วคืนค่า res.data
// - ไม่ prefix '/api' (เพราะ apiClient.baseURL = '/api')
// - ใช้ axios params สำหรับ query แทนการประกอบ URL เอง
// - เพิ่มรองรับการสแกน **SN** โดยตรง (scanAuditSn)

import apiClient from '@/utils/apiClient'

// เริ่มรอบเช็คสต๊อกพร้อมขาย (สร้าง Expected Snapshot)
export const startReadyAudit = async () => {
  try {
    const { data } = await apiClient.post('/stock-audit/ready/start')
    // ปกติคืน 201 + { sessionId, expectedCount }
    return { sessionId: data.sessionId, expectedCount: data.expectedCount, reused: false }
  } catch (err) {
    // ถ้ามี DRAFT เดิม เซิร์ฟเวอร์จะตอบ 409 + { sessionId, expectedCount }
    if (err?.response?.status === 409) {
      const d = err.response?.data || {}
      return { sessionId: d.sessionId, expectedCount: d.expectedCount ?? 0, reused: true }
    }
    // อื่น ๆ ให้โยนต่อให้ caller จัดการ
    throw err
  }
}


// ดึงภาพรวมของ Session (expected, scanned, missing)
export const getAuditOverview = async (sessionId) => {
  try {
    const res = await apiClient.get(`/stock-audit/${sessionId}/overview`)
    return res.data
  } catch (error) {
    console.error('❌ [getAuditOverview] error:', error)
    throw error
  }
}

// ยิงบาร์โค้ดใน Session
export const scanAuditBarcode = async (sessionId, barcode, opts = {}) => {
  try {
    const res = await apiClient.post(`/stock-audit/${sessionId}/scan`, {
      barcode,
      // เผื่อ backend รองรับ mode (เช่น 'BARCODE' | 'SN')
      ...(opts?.mode ? { mode: opts.mode } : {}),
    })
    return res.data
  } catch (error) {
    console.error('❌ [scanAuditBarcode] error:', error)
    throw error
  }
}

// สแกนด้วย Serial Number โดยตรง (ถ้า backend เปิด endpoint นี้)
export const scanAuditSn = async (sessionId, sn) => {
  try {
    const res = await apiClient.post(`/stock-audit/${sessionId}/scan-sn`, { sn })
    return res.data
  } catch (error) {
    console.error('❌ [scanAuditSn] error:', error)
    throw error
  }
}


// ยืนยันผลการเช็ค (MARK_PENDING | MARK_LOST)
export const confirmAudit = async (sessionId, strategy = 'MARK_PENDING') => {
  try {
    const res = await apiClient.post(`/stock-audit/${sessionId}/confirm`, { strategy })
    return res.data
  } catch (error) {
    console.error('❌ [confirmAudit] error:', error)
    throw error
  }
}

// ดึงรายการ Expected/Scanned + ค้นหา/แบ่งหน้า (ใช้ axios params)
export const getAuditItems = async (sessionId, params = {}) => {
  try {
    const { scanned, q, page, pageSize } = params || {}
    const res = await apiClient.get(`/stock-audit/${sessionId}/items`, {
      params: { scanned, q, page, pageSize },
    })
    return res.data
  } catch (error) {
    console.error('❌ [getAuditItems] error:', error)
    throw error
  }
}

