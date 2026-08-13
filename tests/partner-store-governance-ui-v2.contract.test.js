'use strict'

const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8')

const api = read('src/features/partnerStoreApplication/api/partnerStoreApplicationApi.js')
const page = read('src/features/partnerStoreApplication/pages/PartnerStoreApplicationReviewPage.jsx')

const mustContain = (source, value, label) => {
  if (!source.includes(value)) throw new Error(`${label}: missing ${value}`)
}

mustContain(api, '/review', 'partner store review API')
mustContain(page, 'startReviewPartnerStoreApplication', 'review page')
mustContain(page, "item.status === 'PENDING'", 'pending review state')
mustContain(page, "item.status === 'UNDER_REVIEW'", 'under-review decision state')
mustContain(page, 'เริ่มตรวจสอบ', 'review transition copy')
mustContain(page, 'อนุมัติใบสมัคร', 'approval decision copy')

if (page.includes('อนุมัติและเปิดร้าน')) {
  throw new Error('approval UI must not imply provisioning or activation')
}

console.log('Partner Store Governance UI v2 Contract: PASS')
