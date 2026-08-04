const PROFILE_KINDS = Object.freeze(['RECEIPT_58','RECEIPT_80','A4','LABEL','BARCODE','KITCHEN'])

const createPrintProfileAuthority = () => {
  const revisions = new Map()
  const published = new Map()

  const createRevision = ({ profileId, branchId, kind, revision, documentTypes, settings = {} }) => {
    if (!profileId) throw new TypeError('profileId is required')
    if (!Number.isInteger(branchId) || branchId <= 0) throw new TypeError('branchId must be a positive integer')
    if (!PROFILE_KINDS.includes(kind)) throw new TypeError('unsupported print profile kind')
    if (!Number.isInteger(revision) || revision <= 0) throw new TypeError('revision must be a positive integer')
    const key = `${branchId}:${profileId}:${revision}`
    if (revisions.has(key)) throw new Error('print profile revision already exists')
    const profile = Object.freeze({
      profileId, branchId, kind, revision,
      documentTypes: Object.freeze([...(documentTypes || [])]),
      settings: Object.freeze({ ...settings }),
      published: false,
    })
    revisions.set(key, profile)
    return profile
  }

  const publish = ({ profileId, branchId, revision }) => {
    const key = `${branchId}:${profileId}:${revision}`
    const source = revisions.get(key)
    if (!source) throw new Error('print profile revision not found')
    const profile = Object.freeze({ ...source, published: true })
    revisions.set(key, profile)
    published.set(`${branchId}:${profileId}`, profile)
    return profile
  }

  const resolve = ({ profileId, branchId, documentType }) => {
    const profile = published.get(`${branchId}:${profileId}`)
    if (!profile) return null
    if (!profile.documentTypes.includes(documentType)) throw Object.assign(new Error('document type is incompatible with print profile'), { code: 'PRINT_PROFILE_DOCUMENT_INCOMPATIBLE' })
    return profile
  }

  const projectReceiptHeight = ({ profile, contentHeightMm, feedMm = 8 }) => {
    if (!profile || !['RECEIPT_58','RECEIPT_80','KITCHEN'].includes(profile.kind)) return null
    const minimumMm = Number(profile.settings.minimumHeightMm || 40)
    return Math.max(minimumMm, Math.ceil(Number(contentHeightMm) + Number(feedMm)))
  }

  return Object.freeze({ createRevision, publish, resolve, projectReceiptHeight })
}

export { PROFILE_KINDS, createPrintProfileAuthority }
export default createPrintProfileAuthority
