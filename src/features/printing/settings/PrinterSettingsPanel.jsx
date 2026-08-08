import { useCallback, useEffect, useMemo, useState } from 'react'
import { createPrinterSettingsRows } from './printerSettingsViewModel.js'

const STATUS_LABELS = Object.freeze({
  NOT_CONFIGURED: 'ยังไม่ได้ตั้งค่า',
  READY: 'พร้อมใช้งาน',
  UNAVAILABLE: 'ไม่พบเครื่องพิมพ์เดิม',
})

const SCOPE_OPTIONS = Object.freeze([
  Object.freeze({ value: 'WORKSTATION', label: 'เครื่องขายนี้' }),
  Object.freeze({ value: 'BRANCH', label: 'ทั้งสาขา' }),
  Object.freeze({ value: 'DOCUMENT_DEFAULT', label: 'ค่าเริ่มต้นของเอกสาร' }),
])

const AUTHORITY_LABELS = Object.freeze({
  USER: 'ผู้ใช้งาน',
  WORKSTATION: 'เครื่องขาย',
  BRANCH: 'สาขา',
  DOCUMENT_DEFAULT: 'ค่าเริ่มต้นของเอกสาร',
  PLATFORM_DEFAULT: 'ค่าเริ่มต้นของระบบ',
})

const PrinterSettingsPanel = ({
  branchId,
  workstationId,
  discoverySelectionService,
  printerScopeManagementService = null,
  printerTestService,
}) => {
  const [printers, setPrinters] = useState([])
  const [preferences, setPreferences] = useState([])
  const [selectedPurpose, setSelectedPurpose] = useState('RECEIPT')
  const [selectedScope, setSelectedScope] = useState('WORKSTATION')
  const [selectedPrinterId, setSelectedPrinterId] = useState('')
  const [resolvedPrinter, setResolvedPrinter] = useState(null)
  const [resolvedAuthority, setResolvedAuthority] = useState(null)
  const [status, setStatus] = useState('IDLE')
  const [message, setMessage] = useState('')

  const load = useCallback(async () => {
    setStatus('LOADING')
    setMessage('')
    try {
      if (printerScopeManagementService) {
        const inspection = await printerScopeManagementService.inspect({
          scopeType: selectedScope,
          branchId,
          workstationId,
          documentPurpose: selectedPurpose,
        })
        setPrinters(inspection.printers)
        setPreferences(inspection.preference ? [inspection.preference] : [])
        setSelectedPrinterId(inspection.preference?.printerProfileId || '')
        setResolvedPrinter(inspection.resolved?.printer || null)
        setResolvedAuthority(inspection.resolved?.authorityLevel || null)
      } else {
        const resolution = await discoverySelectionService.resolve({
          branchId,
          workstationId,
          documentPurpose: selectedPurpose,
        })
        setPrinters(resolution.printers)
        setPreferences(resolution.preference ? [resolution.preference] : [])
        setSelectedPrinterId(resolution.preference?.printerProfileId || '')
        setResolvedPrinter(resolution.selectedPrinter || null)
        setResolvedAuthority(resolution.preference ? 'WORKSTATION' : null)
      }
      setStatus('READY')
    } catch (error) {
      setStatus('ERROR')
      setMessage(error.message || 'ไม่สามารถค้นหาเครื่องพิมพ์ได้')
    }
  }, [branchId, discoverySelectionService, printerScopeManagementService, selectedPurpose, selectedScope, workstationId])

  useEffect(() => {
    load()
  }, [load])

  const rows = useMemo(
    () => createPrinterSettingsRows({ preferences, printers }),
    [preferences, printers]
  )

  const selectedRow = rows.find((row) => row.documentPurpose === selectedPurpose)
  const availablePrinters = printers.filter((printer) => printer.isOnline !== false)
  const isBusy = ['LOADING', 'SAVING', 'TESTING'].includes(status)

  const saveSelection = async () => {
    if (!selectedPrinterId) {
      setMessage('กรุณาเลือกเครื่องพิมพ์')
      return
    }

    setStatus('SAVING')
    setMessage('')
    try {
      if (printerScopeManagementService) {
        await printerScopeManagementService.save({
          scopeType: selectedScope,
          branchId,
          workstationId,
          documentPurpose: selectedPurpose,
          printerProfileId: selectedPrinterId,
        })
      } else {
        await discoverySelectionService.select({
          branchId,
          workstationId,
          documentPurpose: selectedPurpose,
          printerProfileId: selectedPrinterId,
        })
      }
      setMessage('บันทึกเครื่องพิมพ์เรียบร้อยแล้ว')
      await load()
    } catch (error) {
      setStatus('ERROR')
      setMessage(error.message || 'บันทึกเครื่องพิมพ์ไม่สำเร็จ')
    }
  }

  const testSelection = async () => {
    if (!selectedPrinterId) {
      setMessage('กรุณาเลือกเครื่องพิมพ์ก่อนทดสอบ')
      return
    }

    setStatus('TESTING')
    setMessage('กำลังส่งงานทดสอบพิมพ์...')
    try {
      const outcome = await printerTestService.test({
        branchId,
        workstationId,
        documentPurpose: selectedPurpose,
        printerProfileId: selectedPrinterId,
      })
      const adapter = outcome.result.adapter ? ` ผ่าน ${outcome.result.adapter}` : ''
      setStatus('READY')
      setMessage(`ทดสอบพิมพ์สำเร็จ${adapter}`)
    } catch (error) {
      setStatus('ERROR')
      setMessage(error.message || 'ทดสอบพิมพ์ไม่สำเร็จ')
    }
  }

  const clearSelection = async () => {
    if (printerScopeManagementService) {
      printerScopeManagementService.clear({
        scopeType: selectedScope,
        branchId,
        workstationId,
        documentPurpose: selectedPurpose,
      })
    } else {
      discoverySelectionService.clear({
        branchId,
        workstationId,
        documentPurpose: selectedPurpose,
      })
    }
    setSelectedPrinterId('')
    setMessage('ล้างการตั้งค่าแล้ว')
    await load()
  }

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">ตั้งค่าเครื่องพิมพ์ตามประเภทเอกสาร</h2>
        <p className="text-sm text-slate-600">
          กำหนดเครื่องพิมพ์ตามระดับที่ต้องการ ระบบจะแสดงระดับที่มีอำนาจจริงเมื่อใช้งาน
        </p>
      </div>

      <div className={`grid gap-3 ${printerScopeManagementService ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
        {printerScopeManagementService && (
          <label className="space-y-1 text-sm font-medium text-slate-700">
            ระดับการตั้งค่า
            <select
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              value={selectedScope}
              onChange={(event) => {
                setSelectedScope(event.target.value)
                setSelectedPrinterId('')
              }}
              disabled={isBusy}
            >
              {SCOPE_OPTIONS.map((scope) => (
                <option key={scope.value} value={scope.value}>{scope.label}</option>
              ))}
            </select>
          </label>
        )}

        <label className="space-y-1 text-sm font-medium text-slate-700">
          ประเภทเอกสาร
          <select
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            value={selectedPurpose}
            onChange={(event) => {
              setSelectedPurpose(event.target.value)
              setSelectedPrinterId('')
            }}
            disabled={isBusy}
          >
            {rows.map((row) => (
              <option key={row.documentPurpose} value={row.documentPurpose}>
                {row.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-sm font-medium text-slate-700">
          เครื่องพิมพ์
          <select
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            value={selectedPrinterId}
            onChange={(event) => setSelectedPrinterId(event.target.value)}
            disabled={isBusy}
          >
            <option value="">เลือกเครื่องพิมพ์</option>
            {availablePrinters.map((printer) => (
              <option key={printer.id} value={printer.id}>
                {printer.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
        <div>สถานะระดับนี้: {STATUS_LABELS[selectedRow?.status] || selectedRow?.status}</div>
        {selectedRow?.preference && <div>เครื่องที่บันทึกระดับนี้: {selectedRow.preference.printerName}</div>}
        {resolvedAuthority && (
          <div>ระดับที่ใช้งานจริง: {AUTHORITY_LABELS[resolvedAuthority] || resolvedAuthority}</div>
        )}
        {resolvedPrinter && <div>เครื่องที่ใช้งานจริง: {resolvedPrinter.name}</div>}
        {selectedRow?.badges?.length > 0 && <div>{selectedRow.badges.join(' · ')}</div>}
      </div>

      {message && <p className="text-sm text-slate-700" role="status">{message}</p>}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          onClick={testSelection}
          disabled={isBusy || !selectedPrinterId}
        >
          {status === 'TESTING' ? 'กำลังทดสอบ...' : 'ทดสอบพิมพ์'}
        </button>
        <button
          type="button"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          onClick={saveSelection}
          disabled={isBusy}
        >
          บันทึกเครื่องพิมพ์
        </button>
        <button
          type="button"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-50"
          onClick={load}
          disabled={isBusy}
        >
          ค้นหาใหม่
        </button>
        <button
          type="button"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-50"
          onClick={clearSelection}
          disabled={isBusy || !selectedRow?.preference}
        >
          ล้างการตั้งค่าระดับนี้
        </button>
      </div>
    </section>
  )
}

export { AUTHORITY_LABELS, PrinterSettingsPanel, SCOPE_OPTIONS }
export default PrinterSettingsPanel
