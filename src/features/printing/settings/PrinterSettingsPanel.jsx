import { useCallback, useEffect, useMemo, useState } from 'react'
import { createPrinterSettingsRows } from './printerSettingsViewModel.js'

const STATUS_LABELS = Object.freeze({
  NOT_CONFIGURED: 'ยังไม่ได้ตั้งค่า',
  READY: 'พร้อมใช้งาน',
  UNAVAILABLE: 'ไม่พบเครื่องพิมพ์เดิม',
})

const PrinterSettingsPanel = ({
  branchId,
  workstationId,
  discoverySelectionService,
}) => {
  const [printers, setPrinters] = useState([])
  const [preferences, setPreferences] = useState([])
  const [selectedPurpose, setSelectedPurpose] = useState('RECEIPT')
  const [selectedPrinterId, setSelectedPrinterId] = useState('')
  const [status, setStatus] = useState('IDLE')
  const [message, setMessage] = useState('')

  const load = useCallback(async () => {
    setStatus('LOADING')
    setMessage('')
    try {
      const discovery = await discoverySelectionService.discover({ documentPurpose: selectedPurpose })
      const saved = discoverySelectionService.listPreferences({ branchId, workstationId })
      setPrinters(discovery.printers)
      setPreferences(saved)
      setStatus('READY')
    } catch (error) {
      setStatus('ERROR')
      setMessage(error.message || 'ไม่สามารถค้นหาเครื่องพิมพ์ได้')
    }
  }, [branchId, discoverySelectionService, selectedPurpose, workstationId])

  useEffect(() => {
    load()
  }, [load])

  const rows = useMemo(
    () => createPrinterSettingsRows({ preferences, printers }),
    [preferences, printers]
  )

  const selectedRow = rows.find((row) => row.documentPurpose === selectedPurpose)
  const availablePrinters = printers.filter((printer) => printer.isOnline !== false)

  const saveSelection = async () => {
    if (!selectedPrinterId) {
      setMessage('กรุณาเลือกเครื่องพิมพ์')
      return
    }

    setStatus('SAVING')
    setMessage('')
    try {
      await discoverySelectionService.saveSelection({
        branchId,
        workstationId,
        documentPurpose: selectedPurpose,
        printerProfileId: selectedPrinterId,
      })
      setMessage('บันทึกเครื่องพิมพ์เรียบร้อยแล้ว')
      await load()
    } catch (error) {
      setStatus('ERROR')
      setMessage(error.message || 'บันทึกเครื่องพิมพ์ไม่สำเร็จ')
    }
  }

  const clearSelection = async () => {
    discoverySelectionService.clearSelection({
      branchId,
      workstationId,
      documentPurpose: selectedPurpose,
    })
    setSelectedPrinterId('')
    setMessage('ล้างการตั้งค่าแล้ว')
    await load()
  }

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">ตั้งค่าเครื่องพิมพ์ประจำเครื่องขาย</h2>
        <p className="text-sm text-slate-600">
          เลือกเครื่องพิมพ์แยกตามประเภทเอกสาร ระบบจะจำค่าตามสาขาและเครื่องขายนี้
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-1 text-sm font-medium text-slate-700">
          ประเภทเอกสาร
          <select
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            value={selectedPurpose}
            onChange={(event) => {
              setSelectedPurpose(event.target.value)
              setSelectedPrinterId('')
            }}
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
            disabled={status === 'LOADING' || status === 'SAVING'}
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
        <div>สถานะ: {STATUS_LABELS[selectedRow?.status] || selectedRow?.status}</div>
        {selectedRow?.preference && <div>เครื่องที่บันทึก: {selectedRow.preference.printerName}</div>}
        {selectedRow?.badges?.length > 0 && <div>{selectedRow.badges.join(' · ')}</div>}
      </div>

      {message && <p className="text-sm text-slate-700" role="status">{message}</p>}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          onClick={saveSelection}
          disabled={status === 'LOADING' || status === 'SAVING'}
        >
          บันทึกเครื่องพิมพ์
        </button>
        <button
          type="button"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
          onClick={load}
        >
          ค้นหาใหม่
        </button>
        <button
          type="button"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
          onClick={clearSelection}
          disabled={!selectedRow?.preference}
        >
          ล้างการตั้งค่า
        </button>
      </div>
    </section>
  )
}

export { PrinterSettingsPanel }
export default PrinterSettingsPanel
