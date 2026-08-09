import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const pageSource = readFileSync(
  new URL('../src/features/printing/settings/PrinterSettingsPage.jsx', import.meta.url),
  'utf8',
)
const panelSource = readFileSync(
  new URL('../src/features/printing/settings/ServerPrinterSettingsPanel.jsx', import.meta.url),
  'utf8',
)

test('printer settings route uses the shared page foundation and server-backed panel', () => {
  assert.match(pageSource, /import \{ Alert, Badge, Page, PageHeader \} from '@\/design-system'/)
  assert.match(pageSource, /<ServerPrinterSettingsPanel/)
  assert.match(pageSource, /settingsService=\{runtime\.serverPrinterSettingsService\}/)
})

test('server printer settings uses shared semantic form, feedback, and action components', () => {
  for (const component of ['Alert', 'Badge', 'Button', 'Card', 'Field', 'Input', 'Select']) {
    assert.match(panelSource, new RegExp(`<${component}(?:\\s|>)`))
  }

  assert.doesNotMatch(panelSource, /<button\b/)
  assert.doesNotMatch(panelSource, /<select\b/)
  assert.doesNotMatch(panelSource, /<input\b/)
})
