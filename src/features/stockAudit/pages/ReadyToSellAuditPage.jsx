
// =============================
// client/src/features/stockAudit/pages/ReadyToSellAuditPage.jsx
// - ใช้ state แยกซ้าย/ขวาจาก useStockAuditStore (expected* / scanned*)
// - โหลดทั้ง 2 ตารางหลังเริ่มรอบ
// - รองรับสแกนแล้วรีเฟรชทั้ง 2 ตาราง

import { useEffect, useRef } from 'react'
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
    startReadyAuditAction, loadItemsAction, scanBarcodeAction, confirmAuditAction, loadOverviewAction,
    isStarting, isScanning, isConfirming, errorMessage,
  } = useStockAuditStore()

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

  // กด F2 เพื่อโฟกัสช่องยิงบาร์โค้ดทันที
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'F2') {
        e.preventDefault()
        if (scanRef.current && typeof scanRef.current.focus === 'function') {
        scanRef.current.focus()
      }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const handleScan = async (value) => {
    if (!value) return
    await scanBarcodeAction(value)
    await loadItemsAction({ scanned: 0, q: '', page: expectedPage, pageSize: expectedPageSize })
    await loadItemsAction({ scanned: 1, q: '', page: scannedPage, pageSize: scannedPageSize })
  }


  const handleConfirmPending = async () => {
    if (!sessionId) return
    const ok = window.confirm('ยืนยัน “ปิดรอบ (ค้างตรวจ)” หรือไม่? สินค้าที่ไม่ถูกสแกนจะถูกบันทึกเป็นค้างตรวจ (Pending)')
    if (!ok) return
    await confirmAuditAction('MARK_PENDING')
    await loadOverviewAction(sessionId)
    await loadItemsAction({ scanned: 0, q: '', page: 1, pageSize: expectedPageSize })
    await loadItemsAction({ scanned: 1, q: '', page: 1, pageSize: scannedPageSize })
  }


  const handleConfirmLost = async () => {
    if (!sessionId) return
    const ok = window.confirm('ยืนยันบันทึก "สูญหาย" สำหรับสินค้าที่ "ยังไม่ถูกสแกน" ทั้งหมดหรือไม่?')
    if (!ok) return
    await confirmAuditAction('MARK_LOST')
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
        <span>Missing: <b>{missingCount}</b></span>
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
                placeholder="แสกนบาร์โค้ด"
                autoSubmit
                delay={180}
                //className="w-80 md:w-96 h-11 text-base"
                className="border border-black rounded px-3 py-2 w-80 md:w-96"
              />
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








