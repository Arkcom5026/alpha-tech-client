const stableClone = (value) => JSON.parse(JSON.stringify(value))

const hashText = (text) => {
  let hash = 2166136261
  for (const char of text) {
    hash ^= char.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

export const createStoreDevicePrintPipeline = ({ resolveProfile, createJob }) => {
  if (typeof resolveProfile !== 'function' || typeof createJob !== 'function') {
    throw new TypeError('resolveProfile and createJob are required')
  }

  return {
    async prepare({ branchId, document, documentType, profileId, contentHeightMm = 0 }) {
      if (!branchId || !document?.id) throw new TypeError('branchId and document.id are required')
      const snapshot = Object.freeze(stableClone(document))
      const profile = await resolveProfile({ branchId, profileId, documentType })
      if (!profile.compatibleDocumentTypes?.includes(documentType)) {
        const error = new Error('print profile is incompatible with document type')
        error.code = 'STORE_DEVICE_PRINT_PROFILE_INCOMPATIBLE'
        throw error
      }
      const projectedHeightMm = profile.roll
        ? Math.ceil(contentHeightMm + (profile.feedMm ?? 0))
        : profile.heightMm
      const fingerprint = hashText(JSON.stringify({ branchId, documentType, profileRevision: profile.revision, snapshot }))
      return Object.freeze({ branchId, documentType, snapshot, profile: stableClone(profile), projectedHeightMm, fingerprint })
    },

    async submit(prepared) {
      const idempotencyKey = `print:${prepared.branchId}:${prepared.documentType}:${prepared.snapshot.id}:${prepared.fingerprint}`
      return createJob({
        jobType: 'PRINT_DOCUMENT',
        source: 'DOCUMENT_PRINT_PIPELINE',
        idempotencyKey,
        targetProfileId: prepared.profile.id,
        requestSnapshot: stableClone(prepared),
      })
    },
  }
}

export default createStoreDevicePrintPipeline
