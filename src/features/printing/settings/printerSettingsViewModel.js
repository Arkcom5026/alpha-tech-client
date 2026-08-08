import { SYSTEM_DOCUMENT_PURPOSES } from '../preferences/index.js'

const PURPOSE_LABELS = Object.freeze(Object.fromEntries(
  SYSTEM_DOCUMENT_PURPOSES.map((purpose) => [purpose.code, purpose.displayName]),
))

const describePrinter = (printer) => {
  const badges = []
  if (printer?.queueAuthority === 'SHARED_CONNECTION') badges.push('Shared Queue')
  if (printer?.queueAuthority === 'LOCAL_QUEUE') badges.push('Local Queue')
  if (printer?.capabilities?.driverManaged) badges.push('Driver Managed')
  if (printer?.capabilities?.raw) badges.push('RAW')
  if (printer?.paperWidthMm) badges.push(`${printer.paperWidthMm} มม.`)
  if (printer?.isOnline === false) badges.push('Offline')
  return badges
}

const createPrinterSettingsRows = ({ preferences = [], printers = [] } = {}) => {
  const preferenceByPurpose = new Map(
    preferences.map((preference) => [preference.documentPurpose, preference])
  )
  const printerById = new Map(printers.map((printer) => [printer.id, printer]))

  return SYSTEM_DOCUMENT_PURPOSES.map(({ code: documentPurpose }) => {
    const preference = preferenceByPurpose.get(documentPurpose) || null
    const printer = preference ? printerById.get(preference.printerProfileId) || null : null

    return Object.freeze({
      documentPurpose,
      label: PURPOSE_LABELS[documentPurpose] || documentPurpose,
      preference,
      printer,
      status: !preference ? 'NOT_CONFIGURED' : printer?.isOnline ? 'READY' : 'UNAVAILABLE',
      badges: printer ? Object.freeze(describePrinter(printer)) : Object.freeze([]),
    })
  })
}

export { PURPOSE_LABELS, createPrinterSettingsRows, describePrinter }
export default createPrinterSettingsRows
