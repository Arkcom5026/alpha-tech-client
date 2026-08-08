import { useCallback, useEffect, useMemo, useState } from 'react'

const getErrorMessage = (error, fallback) => (
  error?.response?.data?.error || error?.response?.data?.message || error?.message || fallback
)

const profileCodeOfDevice = (device) => device.metadata?.printerProfileCode || ''

const ServerPrinterSettingsPanel = ({
  branchId,
  workstationId,
  settingsService,
  printerTestService,
}) => {
  const [catalog, setCatalog] = useState({ purposes: [], profiles: [], routes: [], devices: [], localPrinters: [], warnings: [] })
  const [purposeId, setPurposeId] = useState('')
  const [profileId, setProfileId] = useState('')
  const [deviceId, setDeviceId] = useState('')
  const [deviceProfileCode, setDeviceProfileCode] = useState('')
  const [localPrinterId, setLocalPrinterId] = useState('')
  const [profileDraft, setProfileDraft] = useState({ code: '', displayName: '', manufacturer: '', modelName: '' })
  const [status, setStatus] = useState('IDLE')
  const [message, setMessage] = useState('')

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
    }
  }, [settingsService])

  useEffect(() => { load() }, [load])

  const selectedPurpose = catalog.purposes.find((item) => String(item.id) === purposeId) || null
  const selectedRoute = catalog.routes.find((item) => String(item.definitionId) === purposeId) || null
  const activeProfiles = catalog.profiles.filter((item) => item.isActive)
  const selectedProfile = catalog.profiles.find((item) => String(item.id) === profileId) || null
  const selectedRouteMatchesProfile = Boolean(
    selectedRoute?.isActive && String(selectedRoute.printerProfileId) === profileId,
  )
  const matchingDevices = useMemo(() => (
    selectedProfile
      ? catalog.devices.filter((device) => profileCodeOfDevice(device) === selectedProfile.normalizedCode)
      : []
  ), [catalog.devices, selectedProfile])
  const busy = ['LOADING', 'SAVING', 'TESTING'].includes(status)

  useEffect(() => {
    setProfileId(selectedRoute ? String(selectedRoute.printerProfileId) : '')
  }, [purposeId, selectedRoute])

  const perform = async (action, successMessage) => {
    setStatus('SAVING')
    setMessage('')
    try {
      await action()
      await load()
      setMessage(successMessage)
    } catch (error) {
      setStatus('ERROR')
      setMessage(getErrorMessage(error, 'บันทึกการตั้งค่าไม่สำเร็จ'))
    }
  }

  const saveRoute = () => {
    if (!purposeId || !profileId) return setMessage('กรุณาเลือกประเภทเอกสารและโปรไฟล์เครื่องพิมพ์')
    return perform(() => settingsService.configureRoute({
      definitionId: Number(purposeId),
      printerProfileId: Number(profileId),
    }), 'บันทึกเส้นทางการพิมพ์แล้ว')
  }

  const clearRoute = () => perform(
    () => settingsService.disableRoute({ definitionId: Number(purposeId) }),
    'ปิดเส้นทางการพิมพ์แล้ว',
  )

  const createProfile = () => {
    if (!profileDraft.code.trim() || !profileDraft.displayName.trim()) {
      return setMessage('กรุณาระบุรหัสและชื่อโปรไฟล์')
    }
    return perform(() => settingsService.createProfile({
      ...profileDraft,
      capabilities: { print: true },
      adapterKind: 'DRIVER',
      isActive: true,
    }), 'สร้างโปรไฟล์เครื่องพิมพ์แล้ว').then(() => {
      setProfileDraft({ code: '', displayName: '', manufacturer: '', modelName: '' })
    })
  }

  const assignDevice = () => {
    if (!deviceId || !deviceProfileCode) return setMessage('กรุณาเลือกเครื่องจริงและโปรไฟล์')
    return perform(() => settingsService.assignDevice({
      deviceId,
      printerProfileCode: deviceProfileCode,
    }), 'ผูกเครื่องจริงกับโปรไฟล์แล้ว')
  }

  const registerLocalPrinter = () => {
    const printer = catalog.localPrinters.find((item) => item.id === localPrinterId)
    if (!printer) return setMessage('กรุณาเลือกเครื่องพิมพ์ที่ Local Print Bridge ค้นพบ')
    return perform(
      () => settingsService.registerLocalPrinter({ printer, workstationId }),
      `ลงทะเบียน ${printer.name} กับสาขาแล้ว`,
    )
  }

  const testRoute = async () => {
    const readyDevice = matchingDevices.find((device) => device.connectionState === 'ONLINE')
    if (!readyDevice || !selectedPurpose) return setMessage('ยังไม่มีเครื่องจริงที่ออนไลน์สำหรับโปรไฟล์นี้')
    setStatus('TESTING')
    setMessage('กำลังส่งงานทดสอบพิมพ์...')
    try {
      await printerTestService.test({
        branchId,
        workstationId,
        documentPurpose: selectedPurpose.normalizedCode,
        printerProfileId: readyDevice.deviceId,
      })
      setStatus('READY')
      setMessage(`ทดสอบพิมพ์สำเร็จที่ ${readyDevice.name}`)
    } catch (error) {
      setStatus('ERROR')
      setMessage(getErrorMessage(error, 'ทดสอบพิมพ์ไม่สำเร็จ'))
    }
  }

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">เส้นทางการพิมพ์ตามประเภทเอกสาร</h2>
        <p className="mt-1 text-sm text-slate-600">ค่าที่บันทึกมีผลกับทุกผู้ใช้ในสาขานี้ และระบบจะเลือกเครื่องจริงที่ออนไลน์จากโปรไฟล์ที่กำหนด</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">ประเภทเอกสาร
            <select className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" value={purposeId} onChange={(event) => setPurposeId(event.target.value)} disabled={busy}>
              {catalog.purposes.map((purpose) => <option key={purpose.id} value={purpose.id}>{purpose.displayName}</option>)}
            </select>
            {!catalog.purposes.length && <span className="mt-1 block text-xs text-amber-700">ไม่พบประเภทเอกสารที่พร้อมพิมพ์</span>}
          </label>
          <label className="text-sm font-medium text-slate-700">โปรไฟล์เครื่องพิมพ์
            <select className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" value={profileId} onChange={(event) => setProfileId(event.target.value)} disabled={busy}>
              <option value="">ยังไม่กำหนด</option>
              {activeProfiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.displayName}</option>)}
            </select>
          </label>
        </div>
        <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
          สถานะ: {selectedRoute?.isActive ? 'กำหนดแล้ว' : 'ยังไม่กำหนด'} · เครื่องที่ตรงโปรไฟล์ {matchingDevices.length} เครื่อง · ออนไลน์ {matchingDevices.filter((item) => item.connectionState === 'ONLINE').length} เครื่อง
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50" onClick={saveRoute} disabled={busy || !profileId}>บันทึกเส้นทาง</button>
          <button type="button" className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50" onClick={testRoute} disabled={busy || !selectedRouteMatchesProfile}>ทดสอบพิมพ์</button>
          <button type="button" className="rounded-lg border border-slate-300 px-4 py-2 text-sm disabled:opacity-50" onClick={clearRoute} disabled={busy || !selectedRoute}>ปิดเส้นทาง</button>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">เครื่องพิมพ์ที่พบในเครื่องนี้</h2>
        <p className="mt-1 text-sm text-slate-600">นำเครื่องจาก Alpha-Tech Local Print Bridge มาลงทะเบียนกับสาขาก่อนผูกโปรไฟล์</p>
        <div className="mt-3 flex flex-col gap-3 md:flex-row">
          <select className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2" value={localPrinterId} onChange={(event) => setLocalPrinterId(event.target.value)} disabled={busy}>
            <option value="">เลือกเครื่องที่ค้นพบ</option>
            {catalog.localPrinters.map((printer) => <option key={printer.id} value={printer.id}>{printer.name} ({printer.isOnline ? 'ออนไลน์' : 'ออฟไลน์'})</option>)}
          </select>
          <button type="button" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50" onClick={registerLocalPrinter} disabled={busy || !localPrinterId}>ลงทะเบียนเครื่องนี้</button>
        </div>
        {!catalog.localPrinters.length && <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">ไม่พบเครื่องพิมพ์จาก Local Print Bridge กรุณาเปิด Bridge และตรวจสอบว่าเครื่องพิมพ์ติดตั้งใน Windows แล้ว</p>}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">โปรไฟล์รุ่นเครื่องพิมพ์</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {['code', 'displayName', 'manufacturer', 'modelName'].map((field) => (
            <label key={field} className="text-sm font-medium text-slate-700">{{ code: 'รหัส', displayName: 'ชื่อโปรไฟล์', manufacturer: 'ผู้ผลิต', modelName: 'รุ่น' }[field]}
              <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" value={profileDraft[field]} onChange={(event) => setProfileDraft((current) => ({ ...current, [field]: event.target.value }))} disabled={busy} />
            </label>
          ))}
        </div>
        <button type="button" className="mt-3 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50" onClick={createProfile} disabled={busy}>สร้างโปรไฟล์</button>
        {!catalog.profiles.length && <p className="mt-3 text-sm text-slate-500">ยังไม่มีโปรไฟล์ กรอกรหัสและชื่อเพื่อสร้างโปรไฟล์แรก เช่น RECEIPT_80MM</p>}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">ผูกเครื่องพิมพ์จริง</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">เครื่องที่ลงทะเบียน
            <select className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" value={deviceId} onChange={(event) => setDeviceId(event.target.value)} disabled={busy}>
              <option value="">เลือกเครื่อง</option>
              {catalog.devices.map((device) => <option key={device.deviceId} value={device.deviceId}>{device.name} ({device.connectionState})</option>)}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">โปรไฟล์
            <select className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" value={deviceProfileCode} onChange={(event) => setDeviceProfileCode(event.target.value)} disabled={busy}>
              <option value="">เลือกโปรไฟล์</option>
              {activeProfiles.map((profile) => <option key={profile.id} value={profile.normalizedCode}>{profile.displayName}</option>)}
            </select>
          </label>
        </div>
        <button type="button" className="mt-3 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50" onClick={assignDevice} disabled={busy}>ผูกเครื่องกับโปรไฟล์</button>
        {!catalog.devices.length && <p className="mt-3 text-sm text-amber-700">ยังไม่มีเครื่องที่ลงทะเบียน กรุณาลงทะเบียนจากรายการเครื่องที่พบด้านบนก่อน</p>}
      </section>

      {message && <p className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700" role="status">{message}</p>}
      <button type="button" className="text-sm text-slate-600 underline disabled:opacity-50" onClick={load} disabled={busy}>โหลดข้อมูลใหม่</button>
    </div>
  )
}

export default ServerPrinterSettingsPanel
