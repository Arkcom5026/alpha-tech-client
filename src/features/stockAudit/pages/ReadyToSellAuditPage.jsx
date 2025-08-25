// =============================
// client/src/features/stockAudit/pages/ReadyToSellAuditPage.jsx
// ปรับ classifyScanResult ให้รองรับ response { ok:false, error:... } จาก backend

import React, { useEffect, useRef, useState } from 'react'
import useStockAuditStore from '../store/stockAuditStore'
import ScanInput from '../components/ScanInput'
import AuditTable from '../components/AuditTable'
import ConfirmActionDialog from '@/components/shared/dialogs/ConfirmActionDialog'

const ReadyToSellAuditPage = () => {
  const scanRef = useRef(null)
  const audioCtxRef = useRef(null)

  const {
    sessionId, expectedCount, scannedCount, missingCount,
    expectedItems, expectedTotal, expectedPage, expectedPageSize,
    scannedItems, scannedTotal, scannedPage, scannedPageSize,
    startReadyAuditAction, loadItemsAction, scanBarcodeAction, confirmAuditAction, loadOverviewAction, scanSnAction,
    isStarting, isScanning, isConfirming, errorMessage,
  } = useStockAuditStore()

  const [scanMode, setScanMode] = useState('BARCODE')
  const [openConfirmLost, setOpenConfirmLost] = useState(false)
  const [openConfirmPending, setOpenConfirmPending] = useState(false)

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
    await playBeep({ freq: 900, duration: 0.15, type: 'triangle', volume: 0.6 })
    await playBeep({ freq: 1500, duration: 0.15, type: 'triangle', volume: 0.6 })
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
    const f   = 1900
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

  useEffect(() => {
    (async () => {
      try {
        const res = await startReadyAuditAction()
        if (res?.ok || res?.status === 409) {
          await loadItemsAction({ scanned: 0, q: '', page: 1, pageSize: expectedPageSize })
          await loadItemsAction({ scanned: 1, q: '', page: 1, pageSize: scannedPageSize })
        }
      } catch (err) {
        if (err?.response?.status === 409) {
          await loadItemsAction({ scanned: 0, q: '', page: 1, pageSize: expectedPageSize })
          await loadItemsAction({ scanned: 1, q: '', page: 1, pageSize: scannedPageSize })
        } else {
          console.error('startReadyAuditAction error:', err)
        }
      }
    })()
    if (scanRef.current) focusScan()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const classifyScanResult = (result, err) => {
    // normalize from both success body and AxiosError
    const code = String(result?.code ?? result?.status ?? result?.reason ?? '').toUpperCase()
    const statusCode = Number(result?.statusCode ?? result?.httpStatus ?? err?.response?.status ?? 0)
    const messageRaw = (result?.message ?? result?.msg ?? result?.error ?? err?.response?.data?.message ?? err?.response?.data?.error ?? '').toString()
    const message = messageRaw.toLowerCase()

    const flags = {
      ok: !!(result && (result.ok === true || result === true)),
      duplicate: false,
      notFound: false,
    }

    // HTTP code hints first
    if (statusCode === 409) flags.duplicate = true
    if (statusCode === 404 || statusCode === 422) flags.notFound = true

    // Code / reason tokens from backend
    const dupTokens = ['DUPLICATE','ALREADY','ALREADY_SCANNED']
    const nfTokens  = ['NOT_FOUND','NOT_IN_EXPECTED','UNEXPECTED','UNKNOWN_ITEM']
    if (dupTokens.some(t => code.includes(t))) flags.duplicate = true
    if (nfTokens.some(t => code.includes(t)))  flags.notFound = true

    // Heuristics from message (support TH/EN)
    const dupMsg = /สแกน.*แล้ว|ถูกสแกนไปแล้ว|already|duplicate/i.test(message)
    const nfMsg  = /ไม่อยู่ในชุดคาดหวัง|ไม่พบ|not\s*found|unexpected/i.test(message)
    if (dupMsg) flags.duplicate = true
    if (nfMsg)  flags.notFound = true

    // Prefer duplicate if both true
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
      const { ok, duplicate, notFound } = classifyScanResult(result)
      if (ok) {
        await playSuccess()
        await loadItemsAction({ scanned: 0, q: '', page: expectedPage, pageSize: expectedPageSize })
        await loadItemsAction({ scanned: 1, q: '', page: scannedPage, pageSize: scannedPageSize })
      } else if (duplicate) {
        await playDuplicate()
      } else if (notFound) {
        await playError()
      } else {
        console.warn('handleScan result unclassified:', result)
        await playError()
      }
    } catch (err) {
      const { duplicate, notFound } = classifyScanResult(null, err)
      if (duplicate) {
        await playDuplicate()
      } else if (notFound) {
        await playError()
      } else {
        console.error('handleScan exception (unclassified):', err)
        await playError()
      }
    } finally {
      focusScan()
    }
  }


  const doConfirmLost = async () => {
    if (!sessionId) return
    try {
      const result = await confirmAuditAction('MARK_LOST')
      if (result?.ok || result === true) await playSuccess()
      await loadOverviewAction(sessionId)
      await loadItemsAction({ scanned: 0, q: '', page: 1, pageSize: expectedPageSize })
      await loadItemsAction({ scanned: 1, q: '', page: 1, pageSize: scannedPageSize })
    } catch (err) {
      console.error('Confirm lost error:', err)
    } finally {
      setOpenConfirmLost(false)
      focusScan()
    }
  }

  const doConfirmPending = async () => {
    if (!sessionId) return
    try {
      const result = await confirmAuditAction('MARK_PENDING')
      if (result?.ok || result === true) await playSuccess()
      await loadOverviewAction(sessionId)
      await loadItemsAction({ scanned: 0, q: '', page: 1, pageSize: expectedPageSize })
      await loadItemsAction({ scanned: 1, q: '', page: 1, pageSize: scannedPageSize })
    } catch (err) {
      console.error('Confirm pending error:', err)
    } finally {
      setOpenConfirmPending(false)
      focusScan()
    }
  }

  // ---------- render ----------
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="font-medium">Session:</span>
        <span>{sessionId ?? '-'}</span>
        <span className="ml-4">Expected: <b>{expectedCount}</b></span>
        <span>Scanned: <b>{scannedCount}</b></span>
        <span>Missing: <b>{missingCount}</b></span>
        <span className="ml-4 text-gray-600">(F2 โฟกัสช่องสแกน · F3 สลับโหมด)</span>
      </div>

      <div className="flex justify-center gap-3">
        <button
          type="button"
          className={`px-5 py-2.5 rounded-lg text-white ${(isConfirming || expectedTotal === 0) ? 'bg-blue-500 opacity-60 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700'}`}
          disabled={isConfirming || expectedTotal === 0}
          onClick={() => setOpenConfirmLost(true)}
          title="บันทึกสินค้าที่ไม่ถูกสแกนเป็นสูญหาย และปิดรอบ"
        >
          บันทึกสินค้าสูญหาย
        </button>

        <button
          type="button"
          className={`px-5 py-2.5 rounded-lg text-white ${(isConfirming || expectedTotal === 0) ? 'bg-amber-400 opacity-60 cursor-not-allowed' : 'bg-amber-400 hover:bg-amber-600'}`}
          disabled={isConfirming || expectedTotal === 0}
          onClick={() => setOpenConfirmPending(true)}
          title="ปิดรอบ (ค้างตรวจ): สินค้าที่ไม่ถูกสแกนจะถูกบันทึกเป็นค้างตรวจ"
        >
          ปิดรอบ (ค้างตรวจ)
        </button>
      </div>

      {errorMessage && <div className="text-red-600 text-sm">{errorMessage}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Expected (left) */}
        <div className="rounded-xl border p-3">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <h3 className="font-semibold">Expected (ยังไม่สแกน) {expectedTotal}</h3>
            <div className="flex items-center gap-2">
              <ScanInput
                ref={scanRef}
                onSubmit={handleScan}
                disabled={isScanning}
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
                    onClick={() => setScanMode('BARCODE')}
                    className={`px-3 py-2 text-sm ${scanMode === 'BARCODE' ? 'bg-black text-white' : 'bg-white text-black'}`}
                    title="สแกนด้วยบาร์โค้ด (F3 สลับ)"
                  >บาร์โค้ด</button>
                  <button
                    type="button"
                    onClick={() => setScanMode('SN')}
                    className={`px-3 py-2 text-sm ${scanMode === 'SN' ? 'bg-black text-white' : 'bg-white text-black'}`}
                    title="สแกนด้วย SN (F3 สลับ)"
                  >SN</button>
                </div>
              </div>
              <button
                className="btn btn-sm"
                disabled={isStarting}
                onClick={async () => { await loadItemsAction({ scanned: 0, q: '', page: 1, pageSize: expectedPageSize }); focusScan(); }}
              >รีโหลด</button>
            </div>
          </div>

          <AuditTable
            items={expectedItems}
            total={expectedTotal}
            page={expectedPage}
            pageSize={expectedPageSize}
            onSearch={(q) => loadItemsAction({ scanned: 0, q, page: 1, pageSize: expectedPageSize })}
            onPageChange={(page) => loadItemsAction({ scanned: 0, q: '', page, pageSize: expectedPageSize })}
          />
        </div>

        {/* Scanned (right) */}
        <div className="rounded-xl border p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Scanned (สแกนแล้ว) {scannedTotal}</h3>
            <button
              className="btn btn-sm"
              onClick={async () => { await loadItemsAction({ scanned: 1, q: '', page: 1, pageSize: scannedPageSize }); focusScan(); }}
            >รีโหลด</button>
          </div>
          <AuditTable
            items={scannedItems}
            total={scannedTotal}
            page={scannedPage}
            pageSize={scannedPageSize}
            onSearch={(q) => loadItemsAction({ scanned: 1, q, page: 1, pageSize: scannedPageSize })}
            onPageChange={(page) => loadItemsAction({ scanned: 1, q: '', page, pageSize: scannedPageSize })}
          />
        </div>
      </div>

      {/* Confirm dialogs */}
      <ConfirmActionDialog
        open={openConfirmLost}
        title="ยืนยันบันทึกสินค้าสูญหาย"
        description={'จะบันทึกสินค้าที่ "ยังไม่ถูกสแกน" ทั้งหมดเป็นสถานะสูญหาย และปิดรอบทันที'}
        confirmText="ยืนยันบันทึกสูญหาย"
        onCancel={() => setOpenConfirmLost(false)}
        onConfirm={doConfirmLost}
        isLoading={isConfirming}
      />

      <ConfirmActionDialog
        open={openConfirmPending}
        title="ปิดรอบ (ค้างตรวจ)"
        description={'จะปิดรอบนี้ และบันทึกสินค้าที่ไม่ถูกสแกนทั้งหมดเป็นค้างตรวจ (Pending)'}
        confirmText="ยืนยันปิดรอบ"
        onCancel={() => setOpenConfirmPending(false)}
        onConfirm={doConfirmPending}
        isLoading={isConfirming}
      />
    </div>
  )
}

export default ReadyToSellAuditPage



