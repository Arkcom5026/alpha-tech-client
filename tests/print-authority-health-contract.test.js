import { describe, expect, it, vi } from 'vitest'
import {
  createPrintAuthorityService,
  isBridgeReady,
} from '../src/features/printing/authority/printAuthorityService.js'

describe('print authority health contract', () => {
  it('accepts the current Local Print Bridge health payload', async () => {
    const health = {
      ok: true,
      service: 'alpha-tech-local-print-bridge',
      version: '0.4.0',
      mode: 'DRIVER_MANAGED_WITH_WINDOWS_DISCOVERY',
    }
    const transport = {
      health: vi.fn().mockResolvedValue(health),
      listPrinters: vi.fn(),
      dispatchPrintJob: vi.fn(),
    }
    const authority = createPrintAuthorityService({ transport })

    await expect(authority.verifyBridge()).resolves.toBe(health)
    expect(transport.health).toHaveBeenCalledTimes(1)
  })

  it('keeps compatibility with the original status payload draft', () => {
    expect(isBridgeReady({ status: 'ok' })).toBe(true)
  })

  it('rejects missing or unhealthy bridge readiness signals', async () => {
    expect(isBridgeReady(null)).toBe(false)
    expect(isBridgeReady({ ok: false })).toBe(false)
    expect(isBridgeReady({ status: 'error' })).toBe(false)

    const authority = createPrintAuthorityService({
      transport: {
        health: vi.fn().mockResolvedValue({ ok: false }),
        listPrinters: vi.fn(),
        dispatchPrintJob: vi.fn(),
      },
    })

    await expect(authority.verifyBridge()).rejects.toThrow(
      'Alpha-Tech Local Print Bridge is not ready'
    )
  })
})
