

// =============================
// features/stockAudit/store/useStockAuditStore.js
// ✅ Zustand Store (ES Modules) — มี default export ชัดเจน
// - Action ลงท้าย ...Action
// - เรียก API ผ่าน stockAuditApi เท่านั้น
// - มี guard ป้องกันยิงซ้ำ และข้อความ error/info ให้ UI ใช้แสดง

import { create } from 'zustand'
import * as stockAuditApi from '@/features/stockAudit/api/stockAuditApi'

// helper ดึงข้อความผิดพลาดจาก axios/backend
const getApiMessage = (err, fallback) =>
  err?.response?.data?.message || err?.message || fallback

/** @typedef {'MARK_PENDING'|'MARK_LOST'} ConfirmStrategy */

const useStockAuditStore = create((set, get) => ({
  // ----- State -----
  sessionId: null,
  expectedCount: 0,
  scannedCount: 0,
  missingCount: 0,

  // แยกสโตร์รายการเป็น 2 ชุด เพื่อให้ 2 ตารางอยู่พร้อมกันได้
  expectedItems: [],
  expectedTotal: 0,
  expectedPage: 1,
  expectedPageSize: 50,
  expectedQuery: { q: '' },

  scannedItems: [],
  scannedTotal: 0,
  scannedPage: 1,
  scannedPageSize: 50,
  scannedQuery: { q: '' },

  // backward-compat (เผื่อ component เก่าอ้างอิง)
  items: [],
  total: 0,
  page: 1,
  pageSize: 50,
  lastQuery: { scanned: 0, q: '' },

  // flags
  isStarting: false,
  isLoadingOverview: false,
  isLoadingItems: false,
  isScanning: false,
  isConfirming: false,
  isCancelling: false,

  // messages
  errorMessage: '',
  

  // ----- Actions -----
  resetAuditStateAction: () => set({
    sessionId: null,
    expectedCount: 0,
    scannedCount: 0,
    missingCount: 0,

    expectedItems: [],
    expectedTotal: 0,
    expectedPage: 1,
    expectedPageSize: 50,
    expectedQuery: { q: '' },

    scannedItems: [],
    scannedTotal: 0,
    scannedPage: 1,
    scannedPageSize: 50,
    scannedQuery: { q: '' },

    items: [],
    total: 0,
    page: 1,
    pageSize: 50,
    lastQuery: { scanned: 0, q: '' },

    isStarting: false,
    isLoadingOverview: false,
    isLoadingItems: false,
    isScanning: false,
    isConfirming: false,
    isCancelling: false,
    errorMessage: '',
    
  }),

  startReadyAuditAction: async () => {
    set({ isStarting: true, errorMessage: '' })
    // ถ้ามี session เดิมอยู่แล้ว ไม่ต้องเรียก API ซ้ำ (กัน 409 และลด log)
    const existId = get().sessionId
    if (existId) {
      await get().loadOverviewAction(existId)
      await get().loadItemsAction({ scanned: 0, q: '', page: 1, pageSize: get().expectedPageSize })
      await get().loadItemsAction({ scanned: 1, q: '', page: 1, pageSize: get().scannedPageSize })
      
      set({ isStarting: false })
      return { ok: true, sessionId: existId }
    }
    try {
      const res = await stockAuditApi.startReadyAudit()
      const sessionId = res.sessionId
      set({ sessionId, expectedCount: res.expectedCount })
      await get().loadOverviewAction(sessionId)
      // เติมข้อมูลให้ทั้ง 2 ตารางทันที
      await get().loadItemsAction({ scanned: 0, q: '', page: 1, pageSize: get().expectedPageSize })
      await get().loadItemsAction({ scanned: 1, q: '', page: 1, pageSize: get().scannedPageSize })
      return { ok: true, sessionId }
    } catch (err) {
      const status = err?.response?.status
      const data = err?.response?.data
      if (status === 409 && data?.sessionId) {
        const sessionId = data.sessionId
        // มี DRAFT อยู่แล้ว → ใช้ session เดิมต่อ
        set({ sessionId, expectedCount: data.expectedCount ?? 0 })
        await get().loadOverviewAction(sessionId)
        await get().loadItemsAction({ scanned: 0, q: '', page: 1, pageSize: get().expectedPageSize })
        await get().loadItemsAction({ scanned: 1, q: '', page: 1, pageSize: get().scannedPageSize })
        return { ok: true, sessionId }
      }
      const message = getApiMessage(err, 'Start audit failed')
      set({ errorMessage: message })
      return { ok: false, error: message }
    } finally {
      set({ isStarting: false })
    }
  },

  loadOverviewAction: async (sessionId) => {
    if (!sessionId) return { ok: false, error: 'sessionId required' }
    set({ isLoadingOverview: true, errorMessage: '' })
    try {
      const res = await stockAuditApi.getAuditOverview(sessionId)
      const s = res?.session || {}
      const expectedCount = Number(s.expectedCount || 0)
      const scannedCount  = Number(s.scannedCount  || 0)
      const missingCount  = Number(res?.missingCount ?? Math.max(0, expectedCount - scannedCount))
      set({ expectedCount, scannedCount, missingCount })
      return { ok: true }
    } catch (err) {
      const message = getApiMessage(err, 'Load overview failed')
      set({ errorMessage: message })
      return { ok: false, error: message }
    } finally {
      set({ isLoadingOverview: false })
    }
  },

  loadItemsAction: async ({ scanned = 0, q = '', page = 1, pageSize = 50 } = {}) => {
    const { sessionId } = get()
    if (!sessionId) return { ok: false, error: 'sessionId required' }
    set({ isLoadingItems: true, errorMessage: '' })
    try {
      const res = await stockAuditApi.getAuditItems(sessionId, { scanned, q, page, pageSize })
      if (Number(scanned) === 0) {
        set({
          expectedItems: res.items || [],
          expectedTotal: res.total || 0,
          expectedPage: res.page || page,
          expectedPageSize: res.pageSize || pageSize,
          expectedQuery: { q },

          // backward-compat (บาง component อาจยังอ่านตัวเดิม)
          items: res.items || [],
          total: res.total || 0,
          page: res.page || page,
          pageSize: res.pageSize || pageSize,
          lastQuery: { scanned, q },
        })
      } else {
        set({
          scannedItems: res.items || [],
          scannedTotal: res.total || 0,
          scannedPage: res.page || page,
          scannedPageSize: res.pageSize || pageSize,
          scannedQuery: { q },

          // backward-compat
          items: res.items || [],
          total: res.total || 0,
          page: res.page || page,
          pageSize: res.pageSize || pageSize,
          lastQuery: { scanned, q },
        })
      }
      return { ok: true }
    } catch (err) {
      const message = getApiMessage(err, 'Load items failed')
      set({ errorMessage: message })
      return { ok: false, error: message }
    } finally {
      set({ isLoadingItems: false })
    }
  },

  scanBarcodeAction: async (barcode, opts = {}) => {
    const {
      sessionId,
      isScanning,
      expectedPage,
      expectedPageSize,
      scannedPage,
      scannedPageSize,
      expectedQuery,
      scannedQuery,
    } = get()
    if (!sessionId) return { ok: false, error: 'sessionId required' }
    const input = String(barcode || '').trim()
    if (!input) return { ok: false, error: 'barcode required' }
    if (isScanning) return { ok: false, error: 'Scanning in progress' }

    set({ isScanning: true, errorMessage: '' })
    try {
      let res
      // ถ้า component ส่ง mode=SN มา และมี API สำหรับ SN ให้เรียกใช้โดยตรง
      if (opts?.mode === 'SN' && typeof stockAuditApi.scanAuditSn === 'function') {
        res = await stockAuditApi.scanAuditSn(sessionId, input)
      } else {
        // โหมด BARCODE หรือ fallback → ใช้ endpoint เดิม (บางระบบ backend อาจ auto-detect ได้)
        res = await stockAuditApi.scanAuditBarcode(sessionId, input, opts)
      }

      if (res?.scanned !== true && res?.ok !== true) throw new Error('Scan failed')
      await get().loadOverviewAction(sessionId)
      // รีโหลดทั้ง 2 ตารางเพื่อให้ซ้าย/ขวาอัปเดตพร้อมกัน
      await get().loadItemsAction({ scanned: 0, q: expectedQuery.q, page: expectedPage, pageSize: expectedPageSize })
      await get().loadItemsAction({ scanned: 1, q: scannedQuery.q, page: scannedPage, pageSize: scannedPageSize })
      return { ok: true }
    } catch (err) {
      const message = getApiMessage(err, 'Scan failed')
      set({ errorMessage: message })
      return { ok: false, error: message }
    } finally {
      set({ isScanning: false })
    }
  },

  // ✅ สแกนด้วย Serial Number โดยตรง (ถ้ามี API รองรับ) — ถ้าไม่มีจะ fallback ไป endpoint เดิม
  scanSnAction: async (sn) => {
    const {
      sessionId,
      isScanning,
      expectedPage,
      expectedPageSize,
      scannedPage,
      scannedPageSize,
      expectedQuery,
      scannedQuery,
    } = get()
    if (!sessionId) return { ok: false, error: 'sessionId required' }
    const input = String(sn || '').trim()
    if (!input) return { ok: false, error: 'sn required' }
    if (isScanning) return { ok: false, error: 'Scanning in progress' }

    set({ isScanning: true, errorMessage: '' })
    try {
      let res
      if (typeof stockAuditApi.scanAuditSn === 'function') {
        res = await stockAuditApi.scanAuditSn(sessionId, input)
      } else {
        // fallback: ใช้ endpoint เดิม พร้อมส่ง hint ว่าเป็น SN
        res = await stockAuditApi.scanAuditBarcode(sessionId, input, { mode: 'SN' })
      }
      if (res?.scanned !== true && res?.ok !== true) throw new Error('Scan failed')

      await get().loadOverviewAction(sessionId)
      await get().loadItemsAction({ scanned: 0, q: expectedQuery.q, page: expectedPage, pageSize: expectedPageSize })
      await get().loadItemsAction({ scanned: 1, q: scannedQuery.q, page: scannedPage, pageSize: scannedPageSize })
      return { ok: true }
    } catch (err) {
      const message = getApiMessage(err, 'Scan SN failed')
      set({ errorMessage: message })
      return { ok: false, error: message }
    } finally {
      set({ isScanning: false })
    }
  }, 
  
  

  cancelAuditAction: async (sid, payload = {}) => {
    const sessionId = sid || get().sessionId
    if (!sessionId) return { ok: false, error: 'sessionId required' }

    // กันยิงซ้ำ
    if (get().isCancelling) return { ok: false, error: 'Cancelling in progress' }

    set({ isCancelling: true, errorMessage: '' })
    try {
      if (typeof stockAuditApi.cancelAudit !== 'function') {
        throw new Error('cancelAudit API not implemented')
      }

      const res = await stockAuditApi.cancelAudit(sessionId, payload)
      // รองรับ response แบบ { ok:true } หรือ { cancelled:true }
      const ok = res?.ok === true || res?.cancelled === true || res?.status === 'CANCELLED'
      if (!ok) throw new Error('Cancel failed')

      // เคลียร์ state ให้กลับไปก่อนเริ่มรอบทันที (FE ก็เรียกซ้ำได้ ไม่เป็นไร)
      get().resetAuditStateAction()
      return { ok: true }
    } catch (err) {
      const message = getApiMessage(err, 'Cancel failed')
      set({ errorMessage: message })
      return { ok: false, error: message }
    } finally {
      set({ isCancelling: false })
    }
  },

  confirmAuditAction: async (strategy = 'MARK_PENDING') => {
    const { sessionId, expectedPageSize, scannedPageSize } = get()
    if (!sessionId) return { ok: false, error: 'sessionId required' }
    set({ isConfirming: true, errorMessage: '' })
    try {
      const res = await stockAuditApi.confirmAudit(sessionId, strategy)
      if (res.confirmed !== true) throw new Error('Confirm failed')
      await get().loadOverviewAction(sessionId)
      // ✅ รีโหลดทั้ง 2 ตารางให้สอดคล้องกับ flow ของการสแกน
      await get().loadItemsAction({ scanned: 0, q: '', page: 1, pageSize: expectedPageSize })
      await get().loadItemsAction({ scanned: 1, q: '', page: 1, pageSize: scannedPageSize })
      
      return { ok: true }
    } catch (err) {
      const message = getApiMessage(err, 'Confirm failed')
      set({ errorMessage: message })
      return { ok: false, error: message }
    } finally {
      set({ isConfirming: false })
    }
  },
}))

export default useStockAuditStore








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

// ✅ ยกเลิกรอบตรวจนับ (Soft-cancel) — ไม่สรุปสูญหาย/ค้างตรวจ
export const cancelAudit = async (sessionId, payload = {}) => {
  try {
    const res = await apiClient.post(`/stock-audit/${sessionId}/cancel`, payload)
    return res.data
  } catch (error) {
    console.error('❌ [cancelAudit] error:', error)
    throw error
  }
}
