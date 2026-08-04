const createMockPrinterAdapter = ({ now = () => new Date(), latencyMs = 20 } = {}) => {
  const jobs = []

  const print = async ({ printer, printJob }) => {
    if (!printer?.isOnline) {
      throw new Error(`Printer is offline: ${printer?.id || 'unknown'}`)
    }

    await new Promise((resolve) => setTimeout(resolve, latencyMs))

    const result = Object.freeze({
      jobId: printJob.jobId,
      printerId: printer.id,
      status: 'PRINTED',
      printedAt: now().toISOString(),
      adapter: 'MOCK',
    })

    jobs.push(Object.freeze({ printJob, printer, result }))
    return result
  }

  return Object.freeze({
    print,
    listJobs: () => [...jobs],
  })
}

export { createMockPrinterAdapter }
export default createMockPrinterAdapter
