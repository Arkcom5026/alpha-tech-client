const unwrapData = (response) => response?.data?.data ?? response?.data

const createPrinterSettingsApi = ({ client } = {}) => {
  if (!client) throw new TypeError('api client is required')
  return Object.freeze({
    listDocumentPurposes: async () => unwrapData(await client.get('/document-purposes', {
      params: { lifecycleState: 'ACTIVE' },
    })),
    listPrintRoutes: async () => unwrapData(await client.get('/document-purposes/print-routes')),
    configurePrintRoute: async ({ definitionId, printerProfileId, copies = 1 }) => unwrapData(
      await client.put(`/document-purposes/${definitionId}/print-route`, {
        printerProfileId,
        requiredCapability: 'PRINT',
        copies,
      }),
    ),
    disablePrintRoute: async ({ definitionId }) => unwrapData(
      await client.delete(`/document-purposes/${definitionId}/print-route`),
    ),
    listPrinterProfiles: async () => unwrapData(await client.get('/store-devices/printer-profiles')),
    createPrinterProfile: async (payload) => unwrapData(
      await client.post('/store-devices/printer-profiles', payload),
    ),
    updatePrinterProfile: async ({ profileId, ...payload }) => unwrapData(
      await client.patch(`/store-devices/printer-profiles/${profileId}`, payload),
    ),
    listDevices: async () => unwrapData(await client.get('/store-devices/devices')),
    registerPrinterDevice: async (payload) => unwrapData(
      await client.post('/store-devices/devices', payload),
    ),
    assignPrinterProfile: async ({ deviceId, printerProfileCode }) => unwrapData(
      await client.post(`/store-devices/devices/${encodeURIComponent(deviceId)}/printer-profile`, {
        printerProfileCode,
      }),
    ),
  })
}

export { createPrinterSettingsApi, unwrapData }
