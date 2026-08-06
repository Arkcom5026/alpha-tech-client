import { useMemo } from 'react'
import { useAuthStore } from '@/features/auth/store/authStore'
import PrinterSettingsPanel from './PrinterSettingsPanel.jsx'
import { createPrinterSettingsRuntime } from './printerSettingsRuntime.js'

const resolveEmployeeBranchId = (employee) => (
  employee?.branchId ?? employee?.branch?.id ?? null
)

const PrinterSettingsPage = () => {
  const employee = useAuthStore((state) => state.employee)
  const branchId = resolveEmployeeBranchId(employee)

  const runtime = useMemo(() => createPrinterSettingsRuntime({
    storage: window.localStorage,
  }), [])

  if (!branchId) {
    return (
      <div className="p-4 md:p-6">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          ไม่พบสาขาของผู้ใช้งาน จึงยังไม่สามารถบันทึกเครื่องพิมพ์ประจำเครื่องขายได้
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h1 className="text-xl font-black text-slate-900">ตั้งค่าเครื่องพิมพ์</h1>
          <p className="mt-1 text-sm text-slate-600">
            เลือกเครื่องพิมพ์สำหรับสาขาและเครื่องขายนี้ โดยไม่ผูกกับยี่ห้อหรือรุ่นของอุปกรณ์
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
            <span className="rounded-lg bg-slate-100 px-2 py-1">สาขา: {String(branchId)}</span>
            <span className="rounded-lg bg-slate-100 px-2 py-1">เครื่องขาย: {runtime.workstationId}</span>
          </div>
        </div>

        <PrinterSettingsPanel
          branchId={String(branchId)}
          workstationId={runtime.workstationId}
          discoverySelectionService={runtime.discoverySelectionService}
        />
      </div>
    </main>
  )
}

export { PrinterSettingsPage }
export default PrinterSettingsPage
