import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ConfirmActionDialog } from '@/design-system/composites'
import { feedback } from '@/design-system/feedback'
import { createPrinterSettingsRows } from './printerSettingsViewModel.js'

const STATUS_LABELS = Object.freeze({ NOT_CONFIGURED: 'ยังไม่ได้ตั้งค่า', READY: 'พร้อมใช้งาน', UNAVAILABLE: 'ไม่พบเครื่องพิมพ์เดิม' })
const SCOPE_OPTIONS = Object.freeze([
  Object.freeze({ value: 'WORKSTATION', label: 'เครื่องขายนี้' }),
  Object.freeze({ value: 'BRANCH', label: 'ทั้งสาขา' }),
  Object.freeze({ value: 'DOCUMENT_DEFAULT', label: 'ค่าเริ่มต้นของเอกสาร' }),
])
const AUTHORITY_LABELS = Object.freeze({ USER: 'ผู้ใช้งาน', WORKSTATION: 'เครื่องขาย', BRANCH: 'สาขา', DOCUMENT_DEFAULT: 'ค่าเริ่มต้นของเอกสาร', PLATFORM_DEFAULT: 'ค่าเริ่มต้นของระบบ' })
const messageFrom = (error, fallback) => error?.response?.data?.error?.message || error?.response?.data?.message || error?.message || fallback

const PrinterSettingsPanel = ({ branchId, workstationId, discoverySelectionService, printerScopeManagementService = null, printerTestService }) => {
  const [printers, setPrinters] = useState([])
  const [preferences, setPreferences] = useState([])
  const [selectedPurpose, setSelectedPurpose] = useState('SALE_RECEIPT')
  const [selectedScope, setSelectedScope] = useState('WORKSTATION')
  const [selectedPrinterId, setSelectedPrinterId] = useState('')
  const [resolvedPrinter, setResolvedPrinter] = useState(null)
  const [resolvedAuthority, setResolvedAuthority] = useState(null)
  const [status, setStatus] = useState('IDLE')
  const [message, setMessage] = useState('')
  const [clearConfirmationOpen, setClearConfirmationOpen] = useState(false)
  const actionRef = useRef(false)

  const load = useCallback(async ({ allowDuringMutation = false, reportError = true } = {}) => {
    if (actionRef.current && !allowDuringMutation) return { ok: false, busy: true }

    setStatus('LOADING')
    setMessage('')
    try {
      if (printerScopeManagementService) {
        const inspection = await printerScopeManagementService.inspect({ scopeType: selectedScope, branchId, workstationId, documentPurpose: selectedPurpose })
        setPrinters(inspection.printers)
        setPreferences(inspection.preference ? [inspection.preference] : [])
        setSelectedPrinterId(inspection.preference?.printerProfileId || '')
        setResolvedPrinter(inspection.resolved?.printer || null)
        setResolvedAuthority(inspection.resolved?.authorityLevel || null)
      } else {
        const resolution = await discoverySelectionService.resolve({ branchId, workstationId, documentPurpose: selectedPurpose })
        setPrinters(resolution.printers)
        setPreferences(resolution.preference ? [resolution.preference] : [])
        setSelectedPrinterId(resolution.preference?.printerProfileId || '')
        setResolvedPrinter(resolution.selectedPrinter || null)
        setResolvedAuthority(resolution.preference ? 'WORKSTATION' : null)
      }
      setStatus('READY')
      return { ok: true }
    } catch (error) {
      const errorMessage = messageFrom(error, 'ไม่สามารถค้นหาเครื่องพิมพ์ได้')
      setStatus('ERROR')
      setMessage(errorMessage)
      if (reportError) feedback.actionError(error, 'ไม่สามารถค้นหาเครื่องพิมพ์ได้', 'printer-settings:load:error')
      return { ok: false, error, message: errorMessage }
    }
  }, [branchId, discoverySelectionService, printerScopeManagementService, selectedPurpose, selectedScope, workstationId])

  useEffect(() => { load() }, [load])

  const rows = useMemo(() => createPrinterSettingsRows({ preferences, printers }), [preferences, printers])
  const selectedRow = rows.find((row) => row.documentPurpose === selectedPurpose)
  const availablePrinters = printers.filter((printer) => printer.isOnline !== false)
  const isBusy = actionRef.current || ['LOADING', 'SAVING', 'TESTING'].includes(status)

  const saveSelection = async () => {
    if (!selectedPrinterId || isBusy) {
      if (!selectedPrinterId) setMessage('กรุณาเลือกเครื่องพิมพ์')
      return
    }

    const request = {
      scopeType: selectedScope,
      branchId,
      workstationId,
      documentPurpose: selectedPurpose,
      printerProfileId: selectedPrinterId,
    }

    actionRef.current = true
    setStatus('SAVING')
    setMessage('')
    try {
      if (printerScopeManagementService) {
        await printerScopeManagementService.save(request)
      } else {
        await discoverySelectionService.select({
          branchId: request.branchId,
          workstationId: request.workstationId,
          documentPurpose: request.documentPurpose,
          printerProfileId: request.printerProfileId,
        })
      }
      feedback.actionSuccess('บันทึกเครื่องพิมพ์เรียบร้อยแล้ว', 'printer-settings:save:success')

      const refresh = await load({ allowDuringMutation: true, reportError: false })
      if (!refresh.ok) {
        const refreshMessage = 'บันทึกเครื่องพิมพ์สำเร็จแล้ว แต่โหลดสถานะล่าสุดไม่สำเร็จ กรุณากดค้นหาใหม่'
        setMessage(refreshMessage)
        feedback.error(refreshMessage)
        return
      }
      setMessage('บันทึกเครื่องพิมพ์เรียบร้อยแล้ว')
    } catch (error) {
      setStatus('ERROR')
      setMessage(messageFrom(error, 'บันทึกเครื่องพิมพ์ไม่สำเร็จ'))
      feedback.actionError(error, 'บันทึกเครื่องพิมพ์ไม่สำเร็จ', 'printer-settings:save:error')
    } finally {
      actionRef.current = false
    }
  }

  const testSelection = async () => {
    if (!selectedPrinterId || isBusy) {
      if (!selectedPrinterId) setMessage('กรุณาเลือกเครื่องพิมพ์ก่อนทดสอบ')
      return
    }

    const request = {
      branchId,
      workstationId,
      documentPurpose: selectedPurpose,
      printerProfileId: selectedPrinterId,
    }

    actionRef.current = true
    setStatus('TESTING')
    setMessage('กำลังส่งงานทดสอบพิมพ์...')
    try {
      const outcome = await printerTestService.test(request)
      const adapter = outcome.result.adapter ? ` ผ่าน ${outcome.result.adapter}` : ''
      setStatus('READY')
      setMessage(`ทดสอบพิมพ์สำเร็จ${adapter}`)
      feedback.actionSuccess(`ทดสอบพิมพ์สำเร็จ${adapter}`, 'printer-settings:test:success')
    } catch (error) {
      setStatus('ERROR')
      setMessage(messageFrom(error, 'ทดสอบพิมพ์ไม่สำเร็จ'))
      feedback.actionError(error, 'ทดสอบพิมพ์ไม่สำเร็จ', 'printer-settings:test:error')
    } finally {
      actionRef.current = false
    }
  }

  const clearSelection = async () => {
    if (isBusy) return

    const request = {
      scopeType: selectedScope,
      branchId,
      workstationId,
      documentPurpose: selectedPurpose,
    }

    actionRef.current = true
    setStatus('SAVING')
    setMessage('')
    try {
      if (printerScopeManagementService) {
        await Promise.resolve(printerScopeManagementService.clear(request))
      } else {
        await Promise.resolve(discoverySelectionService.clear({
          branchId: request.branchId,
          workstationId: request.workstationId,
          documentPurpose: request.documentPurpose,
        }))
      }
      setSelectedPrinterId('')
      setClearConfirmationOpen(false)
      feedback.actionSuccess('ล้างการตั้งค่าเครื่องพิมพ์เรียบร้อยแล้ว', 'printer-settings:clear:success')

      const refresh = await load({ allowDuringMutation: true, reportError: false })
      if (!refresh.ok) {
        const refreshMessage = 'ล้างการตั้งค่าสำเร็จแล้ว แต่โหลดสถานะล่าสุดไม่สำเร็จ กรุณากดค้นหาใหม่'
        setMessage(refreshMessage)
        feedback.error(refreshMessage)
        return
      }
      setMessage('ล้างการตั้งค่าแล้ว')
    } catch (error) {
      setStatus('ERROR')
      setMessage(messageFrom(error, 'ล้างการตั้งค่าเครื่องพิมพ์ไม่สำเร็จ'))
      feedback.actionError(error, 'ล้างการตั้งค่าเครื่องพิมพ์ไม่สำเร็จ', 'printer-settings:clear:error')
    } finally {
      actionRef.current = false
    }
  }

  const selectClass = 'w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100'

  return (
    <>
      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div><h2 className="text-lg font-semibold text-slate-900">ตั้งค่าเครื่องพิมพ์ตามประเภทเอกสาร</h2><p className="text-sm text-slate-600">กำหนดเครื่องพิมพ์ตามระดับที่ต้องการ ระบบจะแสดงระดับที่มีอำนาจจริงเมื่อใช้งาน</p></div>
        <div className={`grid gap-3 ${printerScopeManagementService ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
          {printerScopeManagementService && <label className="space-y-1 text-sm font-medium text-slate-700">ระดับการตั้งค่า<select className={selectClass} value={selectedScope} onChange={(event) => { setSelectedScope(event.target.value); setSelectedPrinterId('') }} disabled={isBusy}>{SCOPE_OPTIONS.map((scope) => <option key={scope.value} value={scope.value}>{scope.label}</option>)}</select></label>}
          <label className="space-y-1 text-sm font-medium text-slate-700">ประเภทเอกสาร<select className={selectClass} value={selectedPurpose} onChange={(event) => { setSelectedPurpose(event.target.value); setSelectedPrinterId('') }} disabled={isBusy}>{rows.map((row) => <option key={row.documentPurpose} value={row.documentPurpose}>{row.label}</option>)}</select></label>
          <label className="space-y-1 text-sm font-medium text-slate-700">เครื่องพิมพ์<select className={selectClass} value={selectedPrinterId} onChange={(event) => setSelectedPrinterId(event.target.value)} disabled={isBusy}><option value="">เลือกเครื่องพิมพ์</option>{availablePrinters.map((printer) => <option key={printer.id} value={printer.id}>{printer.name}</option>)}</select></label>
        </div>
        <div className="rounded-lg border border-emerald-100 bg-emerald-50/40 p-3 text-sm text-slate-700">
          <div>สถานะระดับนี้: {STATUS_LABELS[selectedRow?.status] || selectedRow?.status}</div>
          {selectedRow?.preference && <div>เครื่องที่บันทึกระดับนี้: {selectedRow.preference.printerName}</div>}
          {resolvedAuthority && <div>ระดับที่ใช้งานจริง: {AUTHORITY_LABELS[resolvedAuthority] || resolvedAuthority}</div>}
          {resolvedPrinter && <div>เครื่องที่ใช้งานจริง: {resolvedPrinter.name}</div>}
          {selectedRow?.badges?.length > 0 && <div>{selectedRow.badges.join(' · ')}</div>}
        </div>
        {message && <p className="text-sm text-slate-700" role="status">{message}</p>}
        <div className="flex flex-wrap gap-2">
          <button type="button" className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-100 disabled:opacity-50" onClick={testSelection} disabled={isBusy || !selectedPrinterId}>{status === 'TESTING' ? 'กำลังทดสอบ...' : 'ทดสอบพิมพ์'}</button>
          <button type="button" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50" onClick={saveSelection} disabled={isBusy}>{status === 'SAVING' ? 'กำลังบันทึก...' : 'บันทึกเครื่องพิมพ์'}</button>
          <button type="button" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50" onClick={() => load()} disabled={isBusy}>ค้นหาใหม่</button>
          <button type="button" className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50" onClick={() => !isBusy && setClearConfirmationOpen(true)} disabled={isBusy || !selectedRow?.preference}>ล้างการตั้งค่าระดับนี้</button>
        </div>
      </section>
      <ConfirmActionDialog open={clearConfirmationOpen} title="ล้างการตั้งค่าเครื่องพิมพ์" description="ยืนยันล้างการตั้งค่าเครื่องพิมพ์ของระดับนี้หรือไม่? ระบบจะกลับไปใช้ค่า authority ลำดับถัดไปที่มีอยู่" confirmLabel="ล้างการตั้งค่า" intent="destructive" loading={status === 'SAVING'} loadingLabel="กำลังล้าง..." onClose={() => {
        if (!isBusy) setClearConfirmationOpen(false)
      }} onConfirm={clearSelection} />
    </>
  )
}

export { AUTHORITY_LABELS, PrinterSettingsPanel, SCOPE_OPTIONS }
export default PrinterSettingsPanel
