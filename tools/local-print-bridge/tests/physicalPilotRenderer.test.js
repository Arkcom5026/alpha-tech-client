import assert from 'node:assert/strict'
import test from 'node:test'
import { PILOT_TEXT, renderPhysicalPilotEscPos } from '../src/physicalPilotRenderer.js'

test('renders one-shot ASCII pilot with feed and partial cut', () => {
  const bytes = renderPhysicalPilotEscPos()
  assert.equal(Buffer.isBuffer(bytes), true)
  assert.equal(bytes.includes(Buffer.from(PILOT_TEXT, 'ascii')), true)
  assert.equal(bytes.includes(Buffer.from([0x1b, 0x64, 0x03])), true)
  assert.equal(bytes.subarray(-3).equals(Buffer.from([0x1d, 0x56, 0x01])), true)
})

test('can render pilot without cut for unit isolation', () => {
  const bytes = renderPhysicalPilotEscPos({ partialCut: false })
  assert.equal(bytes.subarray(-3).equals(Buffer.from([0x1d, 0x56, 0x01])), false)
})
