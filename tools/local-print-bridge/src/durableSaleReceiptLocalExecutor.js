const fail = (code, message, statusCode = 400, detail = undefined) =>
  Object.assign(new Error(message), { code, statusCode, detail })

const requiredText = (value, code, field) => {
  if (typeof value !== 'string' || !value.trim()) {
    throw fail(code, `${field} is required`)
  }
  return value.trim()
}

const assertSaleReceiptEnvelope = (envelope) => {
  if (
    envelope?.schemaVersion !== 1
    || envelope?.job?.jobType !== 'PRINT_DOCUMENT'
    || typeof envelope?.job?.jobId !== 'string'
    || !envelope.job.jobId.trim()
    || envelope?.documentPurpose?.code !== 'SALE_RECEIPT'
    || !Number.isInteger(Number(envelope?.source?.id))
    || Number(envelope.source.id) <= 0
    || !Number.isInteger(Number(envelope?.print?.copies))
    || Number(envelope.print.copies) <= 0
    || !envelope?.projection
  ) {
    throw fail(
      'DURABLE_SALE_RECEIPT_EXECUTION_ENVELOPE_INVALID',
      'A certified SALE_RECEIPT durable execution envelope is required',
      409,
    )
  }
  return envelope
}

const assertRenderedArtifact = (artifact) => {
  if (
    artifact?.schemaVersion !== 1
    || artifact?.format !== 'PDF'
    || typeof artifact?.checksumSha256 !== 'string'
    || !/^[a-f0-9]{64}$/i.test(artifact.checksumSha256)
    || !Number.isInteger(Number(artifact?.byteLength))
    || Number(artifact.byteLength) <= 0
  ) {
    throw fail(
      'DURABLE_SALE_RECEIPT_RENDER_ARTIFACT_INVALID',
      'Certified Sale Receipt renderer returned an invalid PDF artifact',
      502,
    )
  }
  return artifact
}

const assertSubmission = (submission, expectedPrinterId, artifact) => {
  if (
    submission?.schemaVersion !== 1
    || submission?.submitted !== true
    || typeof submission?.printerId !== 'string'
    || submission.printerId !== expectedPrinterId
    || submission?.artifactChecksumSha256 !== artifact.checksumSha256
  ) {
    throw fail(
      'DURABLE_SALE_RECEIPT_SUBMISSION_INVALID',
      'Sale Receipt submitter returned invalid or mismatched submission evidence',
      502,
    )
  }
  return submission
}

const createDurableSaleReceiptLocalExecutor = ({
  renderer,
  submitter,
  now = () => Date.now(),
} = {}) => {
  if (!renderer || typeof renderer.render !== 'function') {
    throw fail(
      'DURABLE_SALE_RECEIPT_RENDERER_REQUIRED',
      'A certified local Sale Receipt renderer is required',
      500,
    )
  }
  if (!submitter || typeof submitter.submit !== 'function') {
    throw fail(
      'DURABLE_SALE_RECEIPT_SUBMITTER_REQUIRED',
      'A certified local Sale Receipt submitter is required',
      500,
    )
  }

  return Object.freeze({
    name: 'LOCAL_SALE_RECEIPT_PDF',

    async execute(executionEnvelope, options = {}) {
      const envelope = assertSaleReceiptEnvelope(executionEnvelope)
      const printerId = requiredText(
        options.printerId,
        'DURABLE_SALE_RECEIPT_PRINTER_ID_REQUIRED',
        'printerId',
      )
      const startedAt = Number(now())

      const artifact = assertRenderedArtifact(await renderer.render({
        executionEnvelope: envelope,
        printerId,
      }))

      const submission = assertSubmission(
        await submitter.submit({
          executionEnvelope: envelope,
          printerId,
          artifact,
        }),
        printerId,
        artifact,
      )

      const finishedAt = Number(now())
      const durationMs = Number.isFinite(startedAt) && Number.isFinite(finishedAt)
        ? Math.max(0, finishedAt - startedAt)
        : 0

      return Object.freeze({
        schemaVersion: 1,
        adapter: 'LOCAL_SALE_RECEIPT_PDF',
        status: 'SUCCEEDED',
        durationMs,
        evidence: Object.freeze({
          meaning: 'PRINT_SUBMISSION_ACCEPTED',
          physicalOutputConfirmed: false,
          submissionAccepted: true,
          printerId,
          documentPurposeCode: envelope.documentPurpose.code,
          jobId: envelope.job.jobId,
          sourceId: Number(envelope.source.id),
          copies: Number(envelope.print.copies),
          artifact: Object.freeze({
            format: artifact.format,
            checksumSha256: artifact.checksumSha256,
            byteLength: Number(artifact.byteLength),
          }),
          transport: submission.transport || null,
          submission: Object.freeze({ ...submission }),
        }),
        error: null,
      })
    },
  })
}

export {
  assertRenderedArtifact,
  assertSaleReceiptEnvelope,
  createDurableSaleReceiptLocalExecutor,
}

export default createDurableSaleReceiptLocalExecutor
