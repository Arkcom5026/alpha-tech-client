const createPrinterRegistry = ({ printers = [] } = {}) => {
  const records = new Map()

  for (const printer of printers) {
    if (!printer?.id || !printer?.name) continue
    records.set(String(printer.id), Object.freeze({
      id: String(printer.id),
      name: String(printer.name),
      driverName: String(printer.driverName || printer.name),
      connection: String(printer.connection || 'MOCK'),
      paperWidthMm: Number(printer.paperWidthMm || 80),
      capabilities: Object.freeze({
        cut: Boolean(printer.capabilities?.cut),
        cashDrawer: Boolean(printer.capabilities?.cashDrawer),
        status: Boolean(printer.capabilities?.status),
      }),
      isDefault: Boolean(printer.isDefault),
      isOnline: printer.isOnline !== false,
    }))
  }

  const list = () => Array.from(records.values())
  const get = (id) => records.get(String(id)) || null

  return Object.freeze({ list, get })
}

const createDefaultMockRegistry = () => createPrinterRegistry({
  printers: [
    {
      id: 'mock-epson-tm-t82x',
      name: 'EPSON TM-T82X Receipt (Mock)',
      driverName: 'EPSON TM-T82X Receipt',
      connection: 'MOCK',
      paperWidthMm: 80,
      capabilities: { cut: true, cashDrawer: true, status: true },
      isDefault: true,
      isOnline: true,
    },
  ],
})

export { createDefaultMockRegistry, createPrinterRegistry }
export default createPrinterRegistry
