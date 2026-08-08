const asArray = (value) => Array.isArray(value) ? value : []

const createServerPrinterSettingsService = ({ api } = {}) => {
  if (!api) throw new TypeError('printer settings api is required')

  const load = async () => {
    const [purposes, profiles, routes, devices] = await Promise.all([
      api.listDocumentPurposes(),
      api.listPrinterProfiles(),
      api.listPrintRoutes(),
      api.listDevices(),
    ])

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
    })
  }

  return Object.freeze({
    load,
    configureRoute: (input) => api.configurePrintRoute(input),
    disableRoute: (input) => api.disablePrintRoute(input),
    createProfile: (input) => api.createPrinterProfile(input),
    updateProfile: (input) => api.updatePrinterProfile(input),
    assignDevice: (input) => api.assignPrinterProfile(input),
  })
}

export { createServerPrinterSettingsService }
export default createServerPrinterSettingsService
