import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Cable,
  Link2,
  Plus,
  Printer,
  RefreshCw,
  Save,
  Unplug,
} from 'lucide-react'
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Field,
  Input,
  Select,
  feedback,
} from '@/design-system'
import { ConfirmActionDialog } from '@/design-system/composites'

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.error?.message ||
  error?.response?.data?.message ||
  (typeof error?.response?.data?.error === 'string' ? error.response.data.error : null) ||
  error?.message ||
  fallback

const profileCodeOfDevice = (device) => device.metadata?.printerProfileCode || ''

const PROFILE_FIELDS = Object.freeze([
  Object.freeze({ key: 'code', label: 'รหัส' }),
  Object.freeze({ key: 'displayName', label: 'ชื่อโปรไฟล์' }),
  Object.freeze({ key: 'manufacturer', label: 'ผู้ผลิต' }),
  Object.freeze({ key: 'modelName', label: 'รุ่น' }),
])

const ServerPrinterSettingsPanel = ({ branchId, workstationId, settingsService, printerTestService }) => {
  const [catalog, setCatalog] = useState({ purposes: [], profiles: [], routes: [], devices: [], localPrinters: [], warnings: [] })
  const [purposeId, setPurposeId] = useState('')
  const [profileId, setProfileId] = useState('')
  const [deviceId, setDeviceId] = useState('')
  const [deviceProfileCode, setDeviceProfileCode] = useState('')
  const [localPrinterId, setLocalPrinterId] = useState('')
  const [profileDraft, setProfileDraft] = useState({ code: '', displayName: '', manufacturer: '', modelName: '' })
  const [status, setStatus] = useState('IDLE')
  const [message, setMessage] = useState('')
  const [clearRouteConfirmationOpen, setClearRouteConfirmationOpen] = useState(false)

  const load = useCallback(async () => {
    setStatus('LOADING')
    setMessage('')
    try {
      const next = await settingsService.load()
      setCatalog(next)
      setPurposeId((current) => current || String(next.purposes[0]?.id || ''))
      setDeviceId((current) => current || String(next.devices[0]?.deviceId || ''))
      setLocalPrinterId((current) => current || String(next.localPrinters[0]?.id || ''))
      if (next.warnings.length) setMessage(next.warnings.join(' · '))
      setStatus('READY')
    } catch (error) {
      setStatus('ERROR')
      setMessage(getErrorMessage(error, 'โหลดการตั้งค่าเครื่องพิมพ์ไม่สำเร็จ'))
      feedback.actionError(error, 'โหลดการตั้งค่าเครื่องพิมพ์ไม่สำเร็จ', 'server-printer-settings:load:error')
    }
  }, [settingsService])

  useEffect(() => { load() }, [load])

  const selectedPurpose = catalog.purposes.find((item) => String(item.id) === purposeId) || null
  const selectedRoute = catalog.routes.find((item) => String(item.definitionId) === purposeId) || null
  const activeProfiles = catalog.profiles.filter((item) => item.isActive)
  const selectedProfile = catalog.profiles.find((item) => String(item.id) === profileId) || null
  const selectedRouteMatchesProfile = Boolean(selectedRoute?.isActive && String(selectedRoute.printerProfileId) === profileId)
  const matchingDevices = useMemo(
    () => selectedProfile
      ? catalog.devices.filter((device) => profileCodeOfDevice(device) === selectedProfile.normalizedCode)
      : [],
    [catalog.devices, selectedProfile],
  )
  const busy = ['LOADING', 'SAVING', 'TESTING'].includes(status)

  useEffect(() => {
    setProfileId(selectedRoute ? String(selectedRoute.printerProfileId) : '')
  }, [purposeId, selectedRoute])

  const perform = async (action, successMessage, eventKey) => {
    if (busy) return false
    setStatus('SAVING')
    setMessage('')
    try {
      await action()
      await load()
      setMessage(successMessage)
      feedback.actionSuccess(successMessage, `${eventKey}:success`)
      return true
    } catch (error) {
      setStatus('ERROR')
      setMessage(getErrorMessage(error, 'บันทึกการตั้งค่าไม่สำเร็จ'))
      feedback.actionError(error, 'บันทึกการตั้งค่าเครื่องพิมพ์ไม่สำเร็จ', `${eventKey}:error`)
      return false
    }
  }

  const saveRoute = () => {
    if (!purposeId || !profileId) return setMessage('กรุณาเลือกประเภทเอกสารและโปรไฟล์เครื่องพิมพ์')
    return perform(
      () => settingsService.configureRoute({ definitionId: Number(purposeId), printerProfileId: Number(profileId) }),
      'บันทึกเส้นทางการพิมพ์แล้ว',
      'server-printer-settings:route:save',
    )
  }

  const clearRoute = async () => {
    const ok = await perform(
      () => settingsService.disableRoute({ definitionId: Number(purposeId) }),
      'ปิดเส้นทางการพิมพ์แล้ว',
      'server-printer-settings:route:disable',
    )
    if (ok) setClearRouteConfirmationOpen(false)
  }

  const createProfile = async () => {
    if (!profileDraft.code.trim() || !profileDraft.displayName.trim()) return setMessage('กรุณาระบุรหัสและชื่อโปรไฟล์')
    const ok = await perform(
      () => settingsService.createProfile({ ...profileDraft, capabilities: { print: true }, adapterKind: 'DRIVER', isActive: true }),
      'สร้างโปรไฟล์เครื่องพิมพ์แล้ว',
      'server-printer-settings:profile:create',
    )
    if (ok) setProfileDraft({ code: '', displayName: '', manufacturer: '', modelName: '' })
  }

  const assignDevice = () => {
    if (!deviceId || !deviceProfileCode) return setMessage('กรุณาเลือกเครื่องจริงและโปรไฟล์')
    return perform(
      () => settingsService.assignDevice({ deviceId, printerProfileCode: deviceProfileCode }),
      'ผูกเครื่องจริงกับโปรไฟล์แล้ว',
      'server-printer-settings:device:assign',
    )
  }

  const registerLocalPrinter = () => {
    const printer = catalog.localPrinters.find((item) => item.id === localPrinterId)
    if (!printer) return setMessage('กรุณาเลือกเครื่องพิมพ์ที่ Local Print Bridge ค้นพบ')
    return perform(
      () => settingsService.registerLocalPrinter({ printer, workstationId }),
      `ลงทะเบียน ${printer.name} กับสาขาแล้ว`,
      'server-printer-settings:local-printer:register',
    )
  }

  const testRoute = async () => {
    const readyDevice = matchingDevices.find((device) => device.connectionState === 'ONLINE')
    if (!readyDevice || !selectedPurpose) return setMessage('ยังไม่มีเครื่องจริงที่ออนไลน์สำหรับโปรไฟล์นี้')
    if (busy) return
    setStatus('TESTING')
    setMessage('กำลังส่งงานทดสอบพิมพ์...')
    try {
      await printerTestService.test({ branchId, workstationId, documentPurpose: selectedPurpose.normalizedCode, printerProfileId: readyDevice.deviceId })
      setStatus('READY')
      setMessage(`ทดสอบพิมพ์สำเร็จที่ ${readyDevice.name}`)
      feedback.actionSuccess(`ทดสอบพิมพ์สำเร็จที่ ${readyDevice.name}`, 'server-printer-settings:test:success')
    } catch (error) {
      setStatus('ERROR')
      setMessage(getErrorMessage(error, 'ทดสอบพิมพ์ไม่สำเร็จ'))
      feedback.actionError(error, 'ทดสอบพิมพ์ไม่สำเร็จ', 'server-printer-settings:test:error')
    }
  }

  return (
    <>
      <div className="space-y-5">
        <Card>
          <CardHeader className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[hsl(var(--ads-text-strong))]">เส้นทางการพิมพ์ตามประเภทเอกสาร</h2>
              <p className="mt-1 text-sm text-[hsl(var(--ads-text-muted))]">ค่าที่บันทึกมีผลกับทุกผู้ใช้ในสาขานี้ และระบบจะเลือกเครื่องจริงที่ออนไลน์จากโปรไฟล์ที่กำหนด</p>
            </div>
            <Link2 className="h-5 w-5 shrink-0 text-[hsl(var(--ads-text-muted))]" aria-hidden="true" />
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field id="printer-purpose" label="ประเภทเอกสาร" hint={!catalog.purposes.length ? 'ไม่พบประเภทเอกสารที่พร้อมพิมพ์' : undefined}>
                <Select value={purposeId} onChange={(event) => setPurposeId(event.target.value)} disabled={busy}>
                  {catalog.purposes.map((purpose) => <option key={purpose.id} value={purpose.id}>{purpose.displayName}</option>)}
                </Select>
              </Field>
              <Field id="printer-profile" label="โปรไฟล์เครื่องพิมพ์">
                <Select value={profileId} onChange={(event) => setProfileId(event.target.value)} disabled={busy}>
                  <option value="">ยังไม่กำหนด</option>
                  {activeProfiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.displayName}</option>)}
                </Select>
              </Field>
            </div>
            <div className="flex flex-wrap items-center gap-2 rounded-[var(--ads-radius-md)] border border-[hsl(var(--ads-border-default))] bg-[hsl(var(--ads-surface-subtle))] p-4">
              <Badge tone={selectedRoute?.isActive ? 'success' : 'neutral'}>{selectedRoute?.isActive ? 'กำหนดเส้นทางแล้ว' : 'ยังไม่กำหนดเส้นทาง'}</Badge>
              <Badge>ตรงโปรไฟล์ {matchingDevices.length} เครื่อง</Badge>
              <Badge tone="info">ออนไลน์ {matchingDevices.filter((item) => item.connectionState === 'ONLINE').length} เครื่อง</Badge>
            </div>
          </CardBody>
          <CardFooter className="justify-stretch sm:justify-end">
            <Button onClick={saveRoute} disabled={busy || !profileId} className="w-full sm:w-auto"><Save className="h-4 w-4" aria-hidden="true" />บันทึกเส้นทาง</Button>
            <Button variant="secondary" onClick={testRoute} disabled={busy || !selectedRouteMatchesProfile} loading={status === 'TESTING'} loadingLabel="กำลังทดสอบ..." className="w-full sm:w-auto"><Printer className="h-4 w-4" aria-hidden="true" />ทดสอบพิมพ์</Button>
            <Button variant="ghost" onClick={() => setClearRouteConfirmationOpen(true)} disabled={busy || !selectedRoute} className="w-full text-[hsl(var(--ads-danger))] sm:w-auto"><Unplug className="h-4 w-4" aria-hidden="true" />ปิดเส้นทาง</Button>
          </CardFooter>
        </Card>

        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader><h2 className="text-lg font-semibold text-[hsl(var(--ads-text-strong))]">เครื่องพิมพ์ที่พบในเครื่องนี้</h2><p className="mt-1 text-sm text-[hsl(var(--ads-text-muted))]">นำเครื่องจาก Alpha-Tech Local Print Bridge มาลงทะเบียนกับสาขาก่อนผูกโปรไฟล์</p></CardHeader>
            <CardBody className="space-y-4">
              <Field id="local-printer" label="เครื่องพิมพ์จาก Local Print Bridge"><Select value={localPrinterId} onChange={(event) => setLocalPrinterId(event.target.value)} disabled={busy}><option value="">เลือกเครื่องที่ค้นพบ</option>{catalog.localPrinters.map((printer) => <option key={printer.id} value={printer.id}>{printer.name} ({printer.isOnline ? 'ออนไลน์' : 'ออฟไลน์'})</option>)}</Select></Field>
              {!catalog.localPrinters.length && <Alert tone="warning">ไม่พบเครื่องพิมพ์จาก Local Print Bridge กรุณาเปิด Bridge และตรวจสอบว่าเครื่องพิมพ์ติดตั้งใน Windows แล้ว</Alert>}
            </CardBody>
            <CardFooter><Button onClick={registerLocalPrinter} disabled={busy || !localPrinterId}><Cable className="h-4 w-4" aria-hidden="true" />ลงทะเบียนเครื่องนี้</Button></CardFooter>
          </Card>

          <Card>
            <CardHeader><h2 className="text-lg font-semibold text-[hsl(var(--ads-text-strong))]">ผูกเครื่องพิมพ์จริง</h2><p className="mt-1 text-sm text-[hsl(var(--ads-text-muted))]">กำหนดโปรไฟล์ให้เครื่องที่ลงทะเบียน เพื่อให้ระบบเลือกใช้งานได้ถูกต้อง</p></CardHeader>
            <CardBody className="space-y-4">
              <Field id="registered-printer" label="เครื่องที่ลงทะเบียน"><Select value={deviceId} onChange={(event) => setDeviceId(event.target.value)} disabled={busy}><option value="">เลือกเครื่อง</option>{catalog.devices.map((device) => <option key={device.deviceId} value={device.deviceId}>{device.name} ({device.connectionState})</option>)}</Select></Field>
              <Field id="device-profile" label="โปรไฟล์"><Select value={deviceProfileCode} onChange={(event) => setDeviceProfileCode(event.target.value)} disabled={busy}><option value="">เลือกโปรไฟล์</option>{activeProfiles.map((profile) => <option key={profile.id} value={profile.normalizedCode}>{profile.displayName}</option>)}</Select></Field>
              {!catalog.devices.length && <Alert tone="warning">ยังไม่มีเครื่องที่ลงทะเบียน กรุณาลงทะเบียนจากรายการเครื่องที่พบก่อน</Alert>}
            </CardBody>
            <CardFooter><Button onClick={assignDevice} disabled={busy}><Link2 className="h-4 w-4" aria-hidden="true" />ผูกเครื่องกับโปรไฟล์</Button></CardFooter>
          </Card>
        </div>

        <Card>
          <CardHeader><h2 className="text-lg font-semibold text-[hsl(var(--ads-text-strong))]">โปรไฟล์รุ่นเครื่องพิมพ์</h2><p className="mt-1 text-sm text-[hsl(var(--ads-text-muted))]">สร้างโปรไฟล์กลางเพื่อใช้กับเครื่องพิมพ์รุ่นเดียวกัน โดยไม่ผูกกับเครื่องจริงเพียงเครื่องเดียว</p></CardHeader>
          <CardBody className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {PROFILE_FIELDS.map((field) => <Field key={field.key} id={`printer-profile-${field.key}`} label={field.label}><Input value={profileDraft[field.key]} onChange={(event) => setProfileDraft((current) => ({ ...current, [field.key]: event.target.value }))} disabled={busy} /></Field>)}
            </div>
            {!catalog.profiles.length && <Alert tone="info">ยังไม่มีโปรไฟล์ กรอกรหัสและชื่อเพื่อสร้างโปรไฟล์แรก เช่น RECEIPT_80MM</Alert>}
          </CardBody>
          <CardFooter><Button onClick={createProfile} disabled={busy}><Plus className="h-4 w-4" aria-hidden="true" />สร้างโปรไฟล์</Button></CardFooter>
        </Card>

        {message && <Alert tone={status === 'ERROR' ? 'danger' : 'info'}>{message}</Alert>}
        <div className="flex justify-end"><Button variant="ghost" onClick={load} disabled={busy}><RefreshCw className={`h-4 w-4 ${status === 'LOADING' ? 'animate-spin' : ''}`} aria-hidden="true" />โหลดข้อมูลใหม่</Button></div>
      </div>

      <ConfirmActionDialog
        open={clearRouteConfirmationOpen}
        title="ปิดเส้นทางการพิมพ์"
        description="ยืนยันปิดเส้นทางการพิมพ์ของประเภทเอกสารนี้หรือไม่? เอกสารจะไม่มี route ระดับนี้จนกว่าจะกำหนดใหม่"
        confirmLabel="ปิดเส้นทาง"
        intent="destructive"
        loading={status === 'SAVING'}
        loadingLabel="กำลังปิด..."
        onClose={() => {
          if (status !== 'SAVING') setClearRouteConfirmationOpen(false)
        }}
        onConfirm={clearRoute}
      />
    </>
  )
}

export default ServerPrinterSettingsPanel