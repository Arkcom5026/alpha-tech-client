
// =============================
// client/src/features/stockAudit/pages/ReadyToSellAuditPage.jsx
// - ใช้ state แยกซ้าย/ขวาจาก useStockAuditStore (expected* / scanned*)
// - โหลดทั้ง 2 ตารางหลังเริ่มรอบ
// - รองรับสแกนแล้วรีเฟรชทั้ง 2 ตาราง

import { useEffect, useRef, useState } from 'react'
import useStockAuditStore from '../store/stockAuditStore'
import ScanInput from '../components/ScanInput'
import AuditTable from '../components/AuditTable'


export default function ReadyToSellAuditPage() {
  const scanRef = useRef(null)
  const {
    // overview
    sessionId, expectedCount, scannedCount, missingCount,

    // expected (ซ้าย)
    expectedItems, expectedTotal, expectedPage, expectedPageSize,
    // scanned (ขวา)
    scannedItems, scannedTotal, scannedPage, scannedPageSize,

    // actions
    startReadyAuditAction, loadItemsAction, scanBarcodeAction, confirmAuditAction, loadOverviewAction, scanSnAction,
    isStarting, isScanning, isConfirming, errorMessage,
  } = useStockAuditStore()

  // เพิ่ม state สำหรับโหมดสแกน (BARCODE | SN)
  const [scanMode, setScanMode] = useState('BARCODE')

  // 🔊 Success sound (Web Audio API)
  const audioCtxRef = useRef(null)
  const playSuccess = async () => {
    try {
      const AC = window.AudioContext || window.webkitAudioContext
      if (!AC) return
      if (!audioCtxRef.current) audioCtxRef.current = new AC()
      const ctx = audioCtxRef.current
      if (ctx.state === 'suspended' && ctx.resume) await ctx.resume()
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(880, now) // A5
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(0.08, now + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18)
      osc.connect(gain).connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.2)
    } catch { /* no-op */ }
  }

  useEffect(() => {
    ;(async () => {
      const res = await startReadyAuditAction()
      if (res?.ok) {
        await loadItemsAction({ scanned: 0, q: '', page: 1, pageSize: expectedPageSize })
        await loadItemsAction({ scanned: 1, q: '', page: 1, pageSize: scannedPageSize })
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // กด F2 เพื่อโฟกัสช่องสแกนทันที และกด F3 เพื่อสลับโหมด (BARCODE ↔ SN)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'F2') {
        e.preventDefault()
        if (scanRef.current && typeof scanRef.current.focus === 'function') {
          scanRef.current.focus()
        }
      } else if (e.key === 'F3') {
        e.preventDefault()
        setScanMode((m) => (m === 'BARCODE' ? 'SN' : 'BARCODE'))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const handleScan = async (value) => {
    if (!value) return
    const input = String(value).trim()

    let result
    if (scanMode === 'SN' && typeof scanSnAction === 'function') {
      result = await scanSnAction(input)
    } else {
      result = await scanBarcodeAction(input, { mode: scanMode })
    }

    // เล่นเสียงเมื่อสำเร็จ (รองรับทั้งรูปแบบ boolean หรือ { ok: true })
    const ok = typeof result === 'object' ? !!result?.ok : result !== false
    if (ok) await playSuccess()

    await loadItemsAction({ scanned: 0, q: '', page: expectedPage, pageSize: expectedPageSize })
    await loadItemsAction({ scanned: 1, q: '', page: scannedPage, pageSize: scannedPageSize })
  }


  const handleConfirmPending = async () => {
    if (!sessionId) return
    const okConfirm = window.confirm('ยืนยัน “ปิดรอบ (ค้างตรวจ)” หรือไม่? สินค้าที่ไม่ถูกสแกนจะถูกบันทึกเป็นค้างตรวจ (Pending)')
    if (!okConfirm) return
    const result = await confirmAuditAction('MARK_PENDING')
    if (result?.ok || result === true) await playSuccess()
    await loadOverviewAction(sessionId)
    await loadItemsAction({ scanned: 0, q: '', page: 1, pageSize: expectedPageSize })
    await loadItemsAction({ scanned: 1, q: '', page: 1, pageSize: scannedPageSize })
  }


  const handleConfirmLost = async () => {
    if (!sessionId) return
    const okConfirm = window.confirm('ยืนยันบันทึก "สูญหาย" สำหรับสินค้าที่ "ยังไม่ถูกสแกน" ทั้งหมดหรือไม่?')
    if (!okConfirm) return
    const result = await confirmAuditAction('MARK_LOST')
    if (result?.ok || result === true) await playSuccess()
    await loadOverviewAction(sessionId)
    await loadItemsAction({ scanned: 0, q: '', page: 1, pageSize: expectedPageSize })
    await loadItemsAction({ scanned: 1, q: '', page: 1, pageSize: scannedPageSize })
  }



  return (
    <div className="space-y-4">
      {/* สรุปยอดด้านบน */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="font-medium">Session:</span>
        <span>{sessionId ?? '-'}</span>
        <span className="ml-4">Expected: <b>{expectedCount}</b></span>
        <span>Scanned: <b>{scannedCount}</b></span>
        <span>Missing: <b>{missingCount}</b></span><span className="ml-4 text-gray-600">(F2 โฟกัสช่องสแกน · F3 สลับโหมด)</span>
      </div>

      {/* Action buttons centered */}
    
      <div className="flex justify-center gap-3">
      <button
          type="button"
          className={`px-5 py-2.5 rounded-lg text-white ${(isConfirming || expectedTotal === 0) ? 'bg-blue-500 opacity-60 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700'}`}
          disabled={isConfirming || expectedTotal === 0}
          onClick={handleConfirmLost}
          title="บันทึกสินค้าที่ยังไม่ถูกสแกนเป็นสูญหาย และปิดรอบ"
        >
          บันทึกสินค้าสูญหาย
        </button>
        
        <button
          type="button"
          className={`px-5 py-2.5 rounded-lg text-white ${(isConfirming || expectedTotal === 0) ? 'bg-amber-400 opacity-60 cursor-not-allowed' : 'bg-amber-400 hover:bg-amber-600'}`}
          disabled={isConfirming || expectedTotal === 0}
          onClick={handleConfirmPending}
          title="ปิดรอบ (ค้างตรวจ): สินค้าที่ไม่ถูกสแกนจะถูกบันทึกเป็นค้างตรวจ"
        >
          ปิดรอบ (ค้างตรวจ)
        </button>
      


      </div>

            {errorMessage && <div className="text-red-600 text-sm">{errorMessage}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* ซ้าย: Expected */}
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
              {/* ปุ่มสลับโหมดสแกน */}
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
                onClick={() => loadItemsAction({ scanned: 0, q: '', page: 1, pageSize: expectedPageSize })}
              >
                รีโหลด
              </button>
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

        {/* ขวา: Scanned */}
        <div className="rounded-xl border p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Scanned (สแกนแล้ว) {scannedTotal}</h3>
            <button
              className="btn btn-sm"
              onClick={() => loadItemsAction({ scanned: 1, q: '', page: 1, pageSize: scannedPageSize })}
            >
              รีโหลด
            </button>
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
    </div>
  )
}









