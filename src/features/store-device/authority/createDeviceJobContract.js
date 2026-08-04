const DEVICE_JOB_TYPES = Object.freeze([
  'PRINT_DOCUMENT',
  'PRINT_LABEL',
  'OPEN_CASH_DRAWER',
  'READ_BARCODE',
  'READ_SCALE',
  'UPDATE_CUSTOMER_DISPLAY',
])

const DEVICE_JOB_STATES = Object.freeze([
  'CREATED',
  'QUEUED',
  'DISPATCHED',
  'RECEIVED',
  'EXECUTING',
  'SUCCEEDED',
  'FAILED',
  'RETRYING',
  'CANCELLED',
])

const requireText = (value, field) => {
  const text = String(value || '').trim()
  if (!text) throw new TypeError(`${field} is required`)
  return text
}

const requirePositiveInteger = (value, field) => {
  const number = Number(value)
  if (!Number.isInteger(number) || number <= 0) throw new TypeError(`${field} must be a positive integer`)
  return number
}

const cloneJson = (value) => JSON.parse(JSON.stringify(value ?? {}))

const createDeviceJobContract = (input = {}) => {
  const jobType = requireText(input.jobType, 'jobType')
  if (!DEVICE_JOB_TYPES.includes(jobType)) throw new TypeError(`Unsupported jobType: ${jobType}`)

  return Object.freeze({
    jobId: requireText(input.jobId, 'jobId'),
    branchId: requirePositiveInteger(input.branchId, 'branchId'),
    requestedByUserId: input.requestedByUserId == null ? null : requirePositiveInteger(input.requestedByUserId, 'requestedByUserId'),
    originDeviceId: requireText(input.originDeviceId, 'originDeviceId'),
    targetProfileId: requireText(input.targetProfileId, 'targetProfileId'),
    preferredGatewayId: input.preferredGatewayId ? requireText(input.preferredGatewayId, 'preferredGatewayId') : null,
    jobType,
    state: 'CREATED',
    idempotencyKey: requireText(input.idempotencyKey || input.jobId, 'idempotencyKey'),
    payload: Object.freeze(cloneJson(input.payload)),
    createdAt: input.createdAt || new Date().toISOString(),
  })
}

export { DEVICE_JOB_STATES, DEVICE_JOB_TYPES, createDeviceJobContract }
export default createDeviceJobContract
