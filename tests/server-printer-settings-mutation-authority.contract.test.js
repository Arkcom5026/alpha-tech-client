import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const filePath = path.resolve('src/features/printing/settings/ServerPrinterSettingsPanel.jsx')
const source = fs.readFileSync(filePath, 'utf8')

describe('Server printer settings mutation authority', () => {
  it('owns settings/test commands synchronously', () => {
    expect(source).toContain('const actionRef = useRef(null)')
    expect(source).toContain('if (busy || actionRef.current) return false')
    expect(source).toContain('if (busy || actionRef.current) return')
    expect(source).toContain('actionRef.current = eventKey')
  })

  it('makes refresh outcome observable without throwing read failures into persistence semantics', () => {
    expect(source).toContain('return { ok: true, error: null }')
    expect(source).toContain('return { ok: false, error }')
    expect(source).toContain('const refreshResult = await load()')
  })

  it('announces persistence success before classifying refresh failure', () => {
    const successIndex = source.indexOf('feedback.actionSuccess(successMessage, `${eventKey}:success`)')
    const refreshIndex = source.indexOf('const refreshResult = await load()')
    expect(successIndex).toBeGreaterThan(-1)
    expect(refreshIndex).toBeGreaterThan(successIndex)
    expect(source).toContain('`${eventKey}:refresh:error`')
    expect(source).toContain('แต่โหลดการตั้งค่าล่าสุดไม่สำเร็จ')
  })

  it('snapshots mutation/test commands before invocation', () => {
    expect(source).toContain('const command = { definitionId: Number(purposeId), printerProfileId: Number(profileId) }')
    expect(source).toContain('const command = { definitionId: Number(purposeId) }')
    expect(source).toContain("const command = { ...profileDraft, capabilities: { print: true }, adapterKind: 'DRIVER', isActive: true }")
    expect(source).toContain('const command = { deviceId, printerProfileCode: deviceProfileCode }')
    expect(source).toContain('printerTestService.test(command)')
  })
})
