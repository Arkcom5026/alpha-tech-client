import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('Partner Store Governance UI v2 contract', () => {
  it('enforces review-before-decision semantics without provisioning copy', () => {
    const api = read('src/features/partnerStoreApplication/api/partnerStoreApplicationApi.js');
    const page = read('src/features/partnerStoreApplication/pages/PartnerStoreApplicationReviewPage.jsx');

    expect(api).toContain('/review');
    expect(page).toContain('startReviewPartnerStoreApplication');
    expect(page).toContain("item.status === 'PENDING'");
    expect(page).toContain("item.status === 'UNDER_REVIEW'");
    expect(page).toContain('เริ่มตรวจสอบ');
    expect(page).toContain('อนุมัติใบสมัคร');
    expect(page).not.toContain('อนุมัติและเปิดร้าน');
  });
});
