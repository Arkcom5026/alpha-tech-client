import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const panel = readFileSync(resolve(here, '../src/features/printing/settings/PrinterSettingsPanel.jsx'), 'utf8')
const page = readFileSync(resolve(here, '../src/features/printing/settings/PrinterSettingsPage.jsx'), 'utf8')
const runtime = readFileSync(resolve(here, '../src/features/printing/settings/printerSettingsRuntime.js'), 'utf8')

assert.match(panel, /value: 'WORKSTATION'/)
assert.match(panel, /value: 'BRANCH'/)
assert.match(panel, /value: 'DOCUMENT_DEFAULT'/)
assert.doesNotMatch(panel, /value: 'USER'/)
assert.doesNotMatch(panel, /value: 'PLATFORM_DEFAULT'/)
assert.match(panel, /ระดับที่ใช้งานจริง/)
assert.match(panel, /เครื่องที่ใช้งานจริง/)
assert.match(panel, /printerScopeManagementService\.inspect/)
assert.match(panel, /printerScopeManagementService\.save/)
assert.match(panel, /printerScopeManagementService\.clear/)

assert.match(page, /printerScopeManagementService=\{runtime\.printerScopeManagementService\}/)
assert.match(runtime, /createPrinterScopeManagementService/)
assert.match(runtime, /printerScopeManagementService,/)

console.log('printer-settings-scope-ui.contract.test.js: PASS')
