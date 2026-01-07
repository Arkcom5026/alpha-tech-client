// =============================
// client/src/features/stockAudit/pages/ReadyToSellAuditPage.jsx
// แก้ไข: เพิ่ม isStarting ใน Destructuring และปรับปรุงประสิทธิภาพการโหลดข้อมูล

import React, { useEffect, useRef, useState } from 'react'
import useStockAuditStore from '../store/stockAuditStore'
import ScanInput from '../components/ScanInput'
import AuditTable from '../components/AuditTable'
import ConfirmActionDialog from '@/components/shared/dialogs/ConfirmActionDialog'

const ReadyToSellAuditPage = () => {
  const scanRef = useRef(null)
  const audioCtxRef = useRef(null)

  // ดึง State และ Action จาก Store
  const {
    sessionId, expectedCount, scannedCount, missingCount,
    expectedItems, expectedTotal, expectedPage, expectedPageSize,
    scannedItems, scannedTotal, scannedPage, scannedPageSize,
    startReadyAuditAction, loadItemsAction, scanBarcodeAction, confirmAuditAction, loadOverviewAction, scanSnAction,
    cancelAuditAction, resetAuditStateAction,
    isScanning, isConfirming, errorMessage, isLoadingItems,
    isCancelling,
    isStarting, // ✅ เพิ่มตัวแปรนี้ที่เดิมขาดไป ทำให้เกิด Error
  } = useStockAuditStore()

  const [scanMode, setScanMode] = useState('BARCODE')
  const [openConfirmLost, setOpenConfirmLost] = useState(false)
  const [openConfirmPending, setOpenConfirmPending] = useState(false)
  const [openCancel, setOpenCancel] = useState(false)
  const [bannerMessage, setBannerMessage] = useState('')

  // ค่าค้นหาแยกสองตาราง (กัน bug เปลี่ยนหน้าแล้ว q หาย)
  const [expectedQ, setExpectedQ] = useState('')
  const [scannedQ, setScannedQ] = useState('')

  const initRef = useRef(false)

  // --- Functions: Scan Focus & Audio ---
  const focusScan = () => {
    const el = scanRef.current
    if (!el) return
    const fn = () => {
      try {
        if (typeof el.focus === 'function') el.focus()
        if (typeof el.select === 'function') el.select()
      } catch (err) {
        console.error('Focus error:', err)
      }
    }
    if (typeof window !== 'undefined' && 'requestAnimationFrame' in window) {
      window.requestAnimationFrame(fn)
    } else {
      setTimeout(fn, 0)
    }
  }

  const getAudioCtx = async () => {
    try {
      const AC = window.AudioContext || window.webkitAudioContext
      if (!AC) return null
      if (!audioCtxRef.current) audioCtxRef.current = new AC()
      const ctx = audioCtxRef.current
      if (ctx.state === 'suspended' && ctx.resume) await ctx.resume()
      return ctx
    } catch (err) {
      console.error('AudioContext error:', err)
      return null
    }
  }

  const playBeep = async ({ freq, duration, type = 'square', volume = 0.6 }) => {
    const ctx = await getAudioCtx()
    if (!ctx) return
    const start = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, start)
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(Math.min(volume, 1), start + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
    osc.connect(gain).connect(ctx.destination)
    osc.start(start)
    osc.stop(start + duration + 0.05)
    return new Promise((resolve) => setTimeout(resolve, duration * 1000 + 50))
  }

  const playNoise = async ({ duration = 0.3, volume = 0.5 }) => {
    const ctx = await getAudioCtx()
    if (!ctx) return
    const start = ctx.currentTime
    const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duration))
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.9
    const noise = ctx.createBufferSource()
    const gain = ctx.createGain()
    noise.buffer = buffer
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(Math.min(volume, 1), start + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
    noise.connect(gain).connect(ctx.destination)
    noise.start(start)
    noise.stop(start + duration + 0.02)
  }

  const playSuccess = async () => {
    await playBeep({ freq: 900, duration: 0.2, type: 'triangle', volume: 1 })
    await playBeep({ freq: 1500, duration: 0.2, type: 'triangle', volume: 1 })
  }

  const playDuplicate = async () => {  
    const ctx = await getAudioCtx()
    if (!ctx) return
    const now = ctx.currentTime
    const makeTone = (start, freq, duration, volume = 0.85) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'square'
      osc.frequency.setValueAtTime(freq, start)
      gain.gain.setValueAtTime(0.0001, start)
      gain.gain.exponentialRampToValueAtTime(volume, start + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
      osc.connect(gain).connect(ctx.destination)
      osc.start(start)
      osc.stop(start + duration + 0.05)
    }
    const dur = 0.25
    const gap = 0.12
    const f = 1900
    makeTone(now + 0.00, f, dur)
    makeTone(now + dur + gap, f, dur)
  }

  const playError = async () => {
    const ctx = await getAudioCtx()
    if (!ctx) return
    const start = ctx.currentTime
    const dur = 1.2
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(1000, start)
    osc.frequency.exponentialRampToValueAtTime(200, start + dur)
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.7, start + 0.05)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur)
    osc.connect(gain).connect(ctx.destination)
    osc.start(start)
    osc.stop(start + dur)
    await playNoise({ duration: 0.5, volume: 0.5 })
  }

  // --- Effects ---
  useEffect(() => {
    if (initRef.current) return
    initRef.current = true
    if (scanRef.current) focusScan()
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'F2') {
        e.preventDefault()
        focusScan()
      } else if (e.key === 'F3') {
        e.preventDefault()
        setScanMode((m) => (m === 'BARCODE' ? 'SN' : 'BARCODE'))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => { focusScan() }, [scanMode])

  // --- Handlers ---
  const classifyScanResult = (result, err) => {
    const code = String(result?.code ?? result?.status ?? result?.reason ?? '').toUpperCase()
    const statusCode = Number(result?.statusCode ?? result?.httpStatus ?? err?.response?.status ?? 0)
    const messageRaw = (result?.message ?? result?.msg ?? result?.error ?? err?.response?.data?.message ?? err?.response?.data?.error ?? '').toString()
    const message = messageRaw.toLowerCase()

    const flags = {
      ok: !!(result && (result.ok === true || result === true)),
      duplicate: false,
      notFound: false,
      resolvedPending: false,
    }

    if (statusCode === 409) flags.duplicate = true
    if (statusCode === 404 || statusCode === 422) flags.notFound = true

    const dupTokens = ['DUPLICATE','ALREADY','ALREADY_SCANNED']
    const nfTokens  = ['NOT_FOUND','NOT_IN_EXPECTED','UNEXPECTED','UNKNOWN_ITEM']
    const rpTokens  = ['RESOLVED_PENDING','PENDING_RESOLVED']
    if (dupTokens.some(t => code.includes(t))) flags.duplicate = true
    if (nfTokens.some(t => code.includes(t)))  flags.notFound = true
    if (rpTokens.some(t => code.includes(t)))  flags.resolvedPending = true

    const m = message
    if (m.includes('duplicate') || (m.includes('สแกน') && m.includes('แล้ว'))) flags.duplicate = true
    if (m.includes('ไม่พบ') || m.includes('not found') || m.includes('unexpected') || m.includes('ไม่อยู่ในชุดคาดหวัง')) flags.notFound = true
    if (m.includes('ค้างตรวจ') || (m.includes('pending') && m.includes('resolved'))) flags.resolvedPending = true

    if (flags.duplicate && flags.notFound) flags.notFound = false
    return flags
  }

  const handleScan = async (value) => {
    if (!value) { focusScan(); return }
    const input = String(value).trim()
    try {
      let result
      if (scanMode === 'SN' && typeof scanSnAction === 'function') {
        result = await scanSnAction(input)
      } else {
        result = await scanBarcodeAction(input, { mode: scanMode })
      }

      const { ok, duplicate, notFound, resolvedPending } = classifyScanResult(result)

      if (ok || resolvedPending) {
        await playSuccess()
        if (resolvedPending) {
          setBannerMessage('พบของค้างตรวจ – เคลียร์ให้แล้ว')
          setTimeout(() => setBannerMessage(''), 2500)
        }
        // โหลดข้อมูลทั้งสองตารางใหม่
        // รีเฟรช summary + ตาราง (ใช้ q ปัจจุบัน ไม่ล้างคำค้นหา)
        if (sessionId) await loadOverviewAction(sessionId)
        await Promise.all([
          loadItemsAction({ scanned: 0, q: expectedQ, page: expectedPage, pageSize: expectedPageSize }),
          loadItemsAction({ scanned: 1, q: scannedQ, page: scannedPage, pageSize: scannedPageSize })
        ])
      } else if (duplicate) {
        await playDuplicate()
      } else if (notFound) {
        await playError()
      } else {
        await playError()
      }
    } catch (err) {
      const { duplicate, notFound, resolvedPending } = classifyScanResult(null, err)
      if (resolvedPending) {
        await playSuccess()
        setBannerMessage('พบของค้างตรวจ – เคลียร์ให้แล้ว')
        setTimeout(() => setBannerMessage(''), 2500)
        // รีเฟรช summary + ตาราง (ใช้ q ปัจจุบัน ไม่ล้างคำค้นหา)
        if (sessionId) await loadOverviewAction(sessionId)
        await Promise.all([
          loadItemsAction({ scanned: 0, q: expectedQ, page: expectedPage, pageSize: expectedPageSize }),
          loadItemsAction({ scanned: 1, q: scannedQ, page: scannedPage, pageSize: scannedPageSize })
        ])
      } else if (duplicate) {
        await playDuplicate()
      } else if (notFound) {
        await playError()
      } else {
        console.error('Scan error:', err)
        await playError()
      }
    } finally {
      focusScan()
    }
  }

  const doConfirmLost = async () => {
    try {
      const res = await confirmAuditAction('MARK_LOST')
      if (res?.ok) {
        await playSuccess()
        await loadOverviewAction(sessionId)
        await Promise.all([
                        loadItemsAction({ scanned: 0, q: '', page: 1, pageSize: expectedPageSize }),
                        loadItemsAction({ scanned: 1, q: '', page: 1, pageSize: scannedPageSize })
                      ])
      }
    } catch (e) {
      await playError()
    } finally {
      setOpenConfirmLost(false)
      focusScan()
    }
  }

  const doConfirmPending = async () => {
    try {
      const res = await confirmAuditAction('MARK_PENDING')
      if (res?.ok) {
        await playSuccess()
        await loadOverviewAction(sessionId)
        await Promise.all([
          loadItemsAction({ scanned: 0, q: '', page: 1, pageSize: expectedPageSize }),
          loadItemsAction({ scanned: 1, q: '', page: 1, pageSize: scannedPageSize })
        ])
      }
    } catch (e) {
      await playError()
    } finally {
      setOpenConfirmPending(false)
      focusScan()
    }
  }

  const doCancelAudit = async () => {
    if (!sessionId) return
    try {
      const res = await cancelAuditAction(sessionId)
      if (res?.ok) {
        await playSuccess()
        if (typeof resetAuditStateAction === 'function') resetAuditStateAction()
      } else {
        await playError()
      }
    } catch (e) {
      await playError()
    } finally {
      setOpenCancel(false)
      focusScan()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <span className="font-medium">Session:</span>
          <span>{sessionId ?? '-'}</span>
          <span>Expected: <b>{expectedCount}</b></span>
          <span>Scanned: <b>{scannedCount}</b></span>
          <span>Missing: <b>{missingCount}</b></span>
          <span className="text-gray-500">(F2 โฟกัสช่องสแกน · F3 สลับโหมด)</span>
        </div>
        <div className="flex items-center gap-2">
          {sessionId && (
            <button
              type="button"
              className={`px-4 py-2 rounded-lg text-white ${isCancelling ? 'bg-gray-400 cursor-not-allowed' : 'bg-zinc-600 hover:bg-zinc-700'}`}
              onClick={() => setOpenCancel(true)}
              disabled={isCancelling || isConfirming}
              title="ยกเลิกรอบตรวจนับ (ไม่สรุปสูญหาย/ค้างตรวจ และล้างข้อมูลในหน้านี้)"
            >
              {isCancelling ? 'กำลังยกเลิก...' : 'ยกเลิกรอบ'}
            </button>
          )}

          {!sessionId && (
            <button
              type="button"
              className={`px-4 py-2 rounded-lg text-white ${isStarting ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'}`}
              onClick={async () => {
                try {
                  const res = await startReadyAuditAction()
                  if (res?.ok || res?.status === 409) {
                    // ใช้ sessionId จาก response เป็นหลัก (กัน state ยังไม่ sync)
                    const sid =
                      res?.sessionId ??
                      (typeof useStockAuditStore?.getState === 'function' ? useStockAuditStore.getState().sessionId : undefined) ??
                      sessionId
                    if (sid) {
                      await loadOverviewAction(sid)
                      await Promise.all([
                        loadItemsAction({ scanned: 0, q: '', page: 1, pageSize: expectedPageSize }),
                        loadItemsAction({ scanned: 1, q: '', page: 1, pageSize: scannedPageSize })
                      ])
                    }
                  }
                } catch (err) {
                  console.error('Start Audit Error:', err)
                } finally {
                  focusScan()
                }
              }}
              disabled={isStarting}
            >
              {isStarting ? 'กำลังเริ่มรอบ...' : 'เริ่มรอบตรวจนับ'}
            </button>
          )}
          <button
            type="button"
            className={`px-4 py-2 rounded-lg text-white ${isConfirming ? 'bg-blue-500 opacity-60 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            onClick={() => setOpenConfirmLost(true)}
            disabled={isConfirming || isCancelling || !sessionId}
          >
            บันทึกสินค้าสูญหาย
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded-lg text-white ${isConfirming ? 'bg-amber-500 opacity-60 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-600'}`}
            onClick={() => setOpenConfirmPending(true)}
            disabled={isConfirming || isCancelling || !sessionId}
          >
            ปิดรอบ (ค้างตรวจ)
          </button>
        </div>
      </div>

      {(errorMessage || bannerMessage) && (
        <div className="text-sm">
          {errorMessage && <span className="text-red-600">{errorMessage}</span>}
          {bannerMessage && <span className="ml-3 px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">{bannerMessage}</span>}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Expected Table */}
        <div className="rounded-xl border p-3">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <h3 className="font-semibold">Expected (ยังไม่สแกน) {expectedTotal}</h3>
            <div className="flex items-center gap-2">
              <ScanInput
                ref={scanRef}
                onSubmit={handleScan}
                disabled={isScanning || !sessionId}
                placeholder={scanMode === 'SN' ? 'สแกน/พิมพ์ SN (F3 สลับโหมด)' : 'สแกนบาร์โค้ด (F3 สลับโหมด)'}
                autoSubmit
                delay={140}
                className="border border-black rounded px-3 py-2 w-80 md:w-96"
              />
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">โหมด:</span>
                <div className="inline-flex rounded-lg overflow-hidden border">
                  <button
                    type="button"
                    className={`px-3 py-1 text-xs ${scanMode === 'BARCODE' ? 'bg-gray-900 text-white' : 'bg-white hover:bg-gray-50'}`}
                    onClick={() => setScanMode('BARCODE')}
                  >BARCODE</button>
                  <button
                    type="button"
                    className={`px-3 py-1 text-xs ${scanMode === 'SN' ? 'bg-gray-900 text-white' : 'bg-white hover:bg-gray-50'}`}
                    onClick={() => setScanMode('SN')}
                  >SN</button>
                </div>
              </div>
            </div>
          </div>

          <AuditTable
            items={expectedItems}
            total={expectedTotal}
            page={expectedPage}
            pageSize={expectedPageSize}
            loading={isLoadingItems}
            onSearch={(q) => {
              setExpectedQ(q)
              return loadItemsAction({ scanned: 0, q, page: 1, pageSize: expectedPageSize })
            }}
            onPageChange={(page) => loadItemsAction({ scanned: 0, q: expectedQ, page, pageSize: expectedPageSize })}
          />
        </div>

        {/* Scanned Table */}
        <div className="rounded-xl border p-3">
          <div className="flex items-center justify-between mb-2 py-2">
            <h3 className="font-semibold">Scanned {scannedTotal}</h3>
          </div>

          <AuditTable
            items={scannedItems}
            total={scannedTotal}
            page={scannedPage}
            pageSize={scannedPageSize}
            scanned={true}
            loading={isLoadingItems}
            onSearch={(q) => {
              setScannedQ(q)
              return loadItemsAction({ scanned: 1, q, page: 1, pageSize: scannedPageSize })
            }}
            onPageChange={(page) => loadItemsAction({ scanned: 1, q: scannedQ, page, pageSize: scannedPageSize })}
          />
        </div>
      </div>

      <ConfirmActionDialog
        open={openConfirmLost}
        onOpenChange={setOpenConfirmLost}
        title="บันทึกสินค้าสูญหาย"
        description="ของที่ยังไม่ถูกสแกนจะถูกบันทึกเป็นสูญหาย และปิดรอบตรวจทันที"
        confirmText={isConfirming ? 'กำลังบันทึก...' : 'ยืนยันบันทึกสูญหาย'}
        confirmVariant="primary"
        onConfirm={doConfirmLost}
        disabled={isConfirming || isCancelling || !sessionId}
      />

      <ConfirmActionDialog
        open={openConfirmPending}
        onOpenChange={setOpenConfirmPending}
        title="ปิดรอบ (ค้างตรวจ)"
        description="ปิดรอบโดยยังไม่สรุปเป็นสูญหาย ของที่ยังไม่ถูกสแกนจะถูกทำเครื่องหมายเป็นค้างตรวจ"
        confirmText={isConfirming ? 'กำลังบันทึก...' : 'ยืนยันปิดรอบ (ค้างตรวจ)'}
        confirmVariant="warning"
        onConfirm={doConfirmPending}
        disabled={isConfirming || isCancelling || !sessionId}
      />

      <ConfirmActionDialog
        open={openCancel}
        onOpenChange={setOpenCancel}
        title="ยกเลิกรอบตรวจนับ"
        description="ยกเลิกรอบนี้โดยไม่สรุปเป็นสูญหาย/ค้างตรวจ และล้างข้อมูลในหน้านี้ (สามารถเริ่มรอบใหม่ได้ทันที)"
        confirmText={isCancelling ? 'กำลังยกเลิก...' : 'ยืนยันยกเลิกรอบ'}
        confirmVariant="danger"
        onConfirm={doCancelAudit}
        disabled={isConfirming || isCancelling || !sessionId}
      />
    </div>
  )
}

export default ReadyToSellAuditPage







