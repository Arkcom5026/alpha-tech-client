


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

const refreshAuditTables = async (get, sessionId) => {
  const {
    expectedPage,
    expectedPageSize,
    scannedPage,
    scannedPageSize,
    expectedQuery,
    scannedQuery,
  } = get()

  await Promise.all([
    get().loadOverviewAction(sessionId),
    get().loadItemsAction({
      scanned: 0,
      q: expectedQuery.q,
      page: expectedPage,
      pageSize: expectedPageSize,
    }),
    get().loadItemsAction({
      scanned: 1,
      q: scannedQuery.q,
      page: scannedPage,
      pageSize: scannedPageSize,
    }),
  ])
}

const canUseOptimisticScan = (state) => {
  return (
    Number(state.expectedPage || 1) === 1 &&
    Number(state.scannedPage || 1) === 1 &&
    String(state.expectedQuery?.q || '').trim() === '' &&
    String(state.scannedQuery?.q || '').trim() === ''
  )
}

const findExpectedMatchIndex = (items, input, mode) => {
  const keyword = String(input || '').trim()
  if (!keyword) return -1

  return items.findIndex((it) => {
    const barcode = String(it?.barcode || '').trim()
    const sn = String(it?.stockItem?.serialNumber || '').trim()

    if (mode === 'SN') return sn === keyword
    return barcode === keyword || sn === keyword
  })
}

const applyOptimisticScanState = (set, get, input, mode, apiRes) => {
  const state = get()
  if (!canUseOptimisticScan(state)) return false

  const matchIndex = findExpectedMatchIndex(state.expectedItems || [], input, mode)
  if (matchIndex < 0) return false

  const matched = state.expectedItems[matchIndex]
  const apiItem = apiRes && apiRes.item ? apiRes.item : null
  const nextScannedItem = {
    ...matched,
    ...(apiItem || {}),
    isScanned: true,
    scannedAt: (apiItem && apiItem.scannedAt) || new Date().toISOString(),
  }

  const nextExpectedItems = [...(state.expectedItems || [])]
  nextExpectedItems.splice(matchIndex, 1)

  const alreadyInScanned = (state.scannedItems || []).some((it) => {
    const a = String(it?.barcode || '').trim()
    const b = String(nextScannedItem?.barcode || '').trim()
    const sa = String(it?.stockItem?.serialNumber || '').trim()
    const sb = String(nextScannedItem?.stockItem?.serialNumber || '').trim()
    return (a && b && a === b) || (sa && sb && sa === sb)
  })

  const nextScannedItems = alreadyInScanned
    ? [...(state.scannedItems || [])]
    : [nextScannedItem, ...(state.scannedItems || [])]

  const scannedCount = Number(state.scannedCount || 0) + 1
  const expectedCount = Number(state.expectedCount || 0)
  const missingCount = Math.max(0, expectedCount - scannedCount)
  const expectedTotal = Math.max(0, Number(state.expectedTotal || 0) - 1)
  const scannedTotal = Number(state.scannedTotal || 0) + (alreadyInScanned ? 0 : 1)

  set({
    expectedItems: nextExpectedItems,
    expectedTotal,
    scannedItems: nextScannedItems,
    scannedTotal,
    scannedCount,
    missingCount,
  })

  return true
}

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

    const existId = get().sessionId
    if (existId) {
      await refreshAuditTables(get, existId)
      set({ isStarting: false })
      return { ok: true, sessionId: existId, reused: true }
    }

    try {
      const res = await stockAuditApi.startReadyAudit()
      const sessionId = res?.sessionId
      if (!sessionId) throw new Error('sessionId not returned')

      set({
        sessionId,
        expectedCount: Number(res?.expectedCount || 0),
      })

      await refreshAuditTables(get, sessionId)
      return { ok: true, sessionId, reused: !!res?.reused }
    } catch (err) {
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
      const mode = opts && opts.mode === 'SN' ? 'SN' : 'BARCODE'

      if (mode === 'SN' && typeof stockAuditApi.scanAuditSn === 'function') {
        res = await stockAuditApi.scanAuditSn(sessionId, input)
      } else {
        res = await stockAuditApi.scanAuditBarcode(sessionId, input, opts)
      }

      if (!res || (res.scanned !== true && res.ok !== true)) {
        throw new Error('Scan failed')
      }

      const applied = applyOptimisticScanState(set, get, input, mode, res)
      if (!applied) {
        await Promise.all([
          get().loadOverviewAction(sessionId),
          get().loadItemsAction({ scanned: 0, q: expectedQuery.q, page: expectedPage, pageSize: expectedPageSize }),
          get().loadItemsAction({ scanned: 1, q: scannedQuery.q, page: scannedPage, pageSize: scannedPageSize }),
        ])
      }

      return { ok: true, optimistic: applied }
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
        res = await stockAuditApi.scanAuditBarcode(sessionId, input, { mode: 'SN' })
      }
      if (!res || (res.scanned !== true && res.ok !== true)) throw new Error('Scan failed')

      const applied = applyOptimisticScanState(set, get, input, 'SN', res)
      if (!applied) {
        await Promise.all([
          get().loadOverviewAction(sessionId),
          get().loadItemsAction({ scanned: 0, q: expectedQuery.q, page: expectedPage, pageSize: expectedPageSize }),
          get().loadItemsAction({ scanned: 1, q: scannedQuery.q, page: scannedPage, pageSize: scannedPageSize }),
        ])
      }

      return { ok: true, optimistic: applied }
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
      await Promise.all([
        get().loadOverviewAction(sessionId),
        get().loadItemsAction({ scanned: 0, q: '', page: 1, pageSize: expectedPageSize }),
        get().loadItemsAction({ scanned: 1, q: '', page: 1, pageSize: scannedPageSize }),
      ])
      
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





