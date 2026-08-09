import { useMemo } from 'react'
import { Printer } from 'lucide-react'
import { Alert, Badge, Page, PageHeader } from '@/design-system'
import { useAuthStore } from '@/features/auth/store/authStore'
import ServerPrinterSettingsPanel from './ServerPrinterSettingsPanel.jsx'
import { createPrinterSettingsRuntime } from './printerSettingsRuntime.js'

const resolveEmployeeBranchId = (employee) =>
  employee?.branchId ?? employee?.branch?.id ?? null

const PrinterSettingsPage = () => {
  const employee = useAuthStore((state) => state.employee)
  const branchId = resolveEmployeeBranchId(employee)

  const runtime = useMemo(
    () =>
      createPrinterSettingsRuntime({
        storage: window.localStorage,
      }),
    [],
  )

  if (!branchId) {
    return (
      <Page>
        <div className="mx-auto max-w-6xl">
          <Alert tone="warning" title="ไม่พบข้อมูลสาขา">
            ไม่พบสาขาของผู้ใช้งาน
            จึงยังไม่สามารถบันทึกเครื่องพิมพ์ประจำเครื่องขายได้
          </Alert>
        </div>
      </Page>
    )
  }

  return (
    <Page>
      <div className="mx-auto max-w-6xl">
        <PageHeader
          title="ตั้งค่าเครื่องพิมพ์"
          description="กำหนดเส้นทาง โปรไฟล์ และเครื่องพิมพ์จริงสำหรับสาขา โดยไม่ผูกกับยี่ห้อหรือรุ่นของอุปกรณ์"
          actions={
            <div
              className="flex flex-wrap gap-2"
              aria-label="ขอบเขตการตั้งค่าเครื่องพิมพ์"
            >
              <Badge tone="neutral">สาขา: {String(branchId)}</Badge>
              <Badge tone="neutral">เครื่องขาย: {runtime.workstationId}</Badge>
            </div>
          }
        />

        <div className="mb-4 flex items-center gap-2 text-sm font-medium text-[hsl(var(--ads-brand))]">
          <Printer className="h-4 w-4" aria-hidden="true" />
          ศูนย์ควบคุมการพิมพ์ของสาขา
        </div>

        <ServerPrinterSettingsPanel
          branchId={String(branchId)}
          workstationId={runtime.workstationId}
          settingsService={runtime.serverPrinterSettingsService}
          printerTestService={runtime.printerTestService}
        />
      </div>
    </Page>
  )
}

export { PrinterSettingsPage }
export default PrinterSettingsPage
