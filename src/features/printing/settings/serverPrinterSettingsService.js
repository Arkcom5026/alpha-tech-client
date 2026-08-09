const asArray = (value) => Array.isArray(value) ? value : []

const createServerPrinterSettingsService = ({ api, discoverySelectionService = null } = {}) => {
  if (!api) throw new TypeError('printer settings api is required')

  const load = async () => {
    const requests = await Promise.allSettled([
      api.listDocumentPurposes(),
      api.listPrinterProfiles(),
      api.listPrintRoutes(),
      api.listDevices(),
      discoverySelectionService?.discover
        ? discoverySelectionService.discover({ documentPurpose: 'SALE_RECEIPT' })
        : Promise.resolve({ printers: [] }),
    ])
    const value = (index, fallback) => requests[index].status === 'fulfilled' ? requests[index].value : fallback
    const [purposes, profiles, routes, devices, discovery] = [
      value(0, []), value(1, []), value(2, []), value(3, []), value(4, { printers: [] }),
    ]
    const warnings = requests
      .map((result, index) => result.status === 'rejected'
        ? `${['ประเภทเอกสาร', 'โปรไฟล์', 'เส้นทาง', 'อุปกรณ์', 'Local Print Bridge'][index]}: ${result.reason?.message || 'โหลดไม่สำเร็จ'}`
        : null)
      .filter(Boolean)

    const activePurposes = asArray(purposes).filter((purpose) => (
      purpose.lifecycleState === 'ACTIVE' && purpose.metadata?.printEligible === true
    ))
    const printerDevices = asArray(devices).filter((device) => (
      device.kind === 'PRINTER' && !device.revokedAt
    ))

    return Object.freeze({
      purposes: Object.freeze(activePurposes),
      profiles: Object.freeze(asArray(profiles)),
      routes: Object.freeze(asArray(routes)),
      devices: Object.freeze(printerDevices),
      localPrinters: Object.freeze(asArray(discovery?.printers)),
      warnings: Object.freeze(warnings),
    })
  }

  return Object.freeze({
    load,
    configureRoute: (input) => api.configurePrintRoute(input),
    disableRoute: (input) => api.disablePrintRoute(input),
    createProfile: (input) => api.createPrinterProfile(input),
    updateProfile: (input) => api.updatePrinterProfile(input),
    assignDevice: (input) => api.assignPrinterProfile(input),
    registerLocalPrinter: ({ printer, workstationId }) => api.registerPrinterDevice({
      deviceId: printer.id,
      gatewayId: workstationId,
      name: printer.name,
      kind: 'PRINTER',
      connectionState: printer.isOnline ? 'ONLINE' : 'OFFLINE',
      capabilities: {
        print: true,
        cut: printer.capabilities?.cut === true,
        raw: printer.capabilities?.raw === true,
        driverManaged: printer.capabilities?.driverManaged === true,
      },
      transportKind: printer.connection || null,
      adapterKind: printer.driverName ? 'DRIVER' : null,
      metadata: {
        driverName: printer.driverName || null,
        paperWidthMm: printer.paperWidthMm || null,
        queueAuthority: printer.queueAuthority || null,
      },
    }),
  })
}

export { createServerPrinterSettingsService }
export default createServerPrinterSettingsService
