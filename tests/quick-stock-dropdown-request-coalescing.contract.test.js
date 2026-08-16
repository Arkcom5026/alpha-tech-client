import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(
  new URL('../src/features/receiving/quick-stock/store/quickStockRuntimeStore.js', import.meta.url),
  'utf8'
)

assert.match(
  source,
  /const dropdownInFlightByKey = new Map\(\)/,
  'QuickStock dropdown reads must maintain an in-flight registry'
)
assert.match(
  source,
  /const existingRequest = dropdownInFlightByKey\.get\(requestKey\);\s*if \(existingRequest\) return existingRequest;/s,
  'same dropdown query must reuse the existing in-flight promise'
)
assert.match(
  source,
  /const requestId = \+\+dropdownRequestSequence/,
  'dropdown reads must sequence canonical state ownership'
)
assert.match(
  source,
  /if \(requestId === dropdownRequestSequence\)/,
  'stale dropdown completions must not overwrite newer canonical state'
)
assert.match(
  source,
  /dropdownRequestSequence \+= 1;\s*dropdownInFlightByKey\.clear\(\);/s,
  'reset must invalidate outstanding dropdown ownership and coalescing state'
)

console.log('Quick Stock Dropdown Request Coalescing Contract: PASS')
