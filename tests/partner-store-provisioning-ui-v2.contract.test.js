import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

describe('partner store provisioning UI v2 contract', () => {
  it('keeps provisioning separate from approval and account activation', () => {
    const page = read('src/features/partnerStoreApplication/pages/PartnerStoreApplicationReviewPage.jsx');
    expect(page).toContain('provisionPartnerStoreApplication');
    expect(page).toContain("item.status === 'APPROVED'");
    expect(page).toContain("['NOT_STARTED', 'FAILED']");
    expect(page).toContain('Provisioning:');
    expect(page).toContain('สร้างร้าน');
    expect(page).toContain('Provisioning จะสร้าง Branch และ Capability เท่านั้น ไม่เปิดบัญชีเจ้าของร้าน');
    expect(page).toContain('ร้านถูกสร้างแล้ว สามารถออกลิงก์ให้เจ้าของร้านตั้งรหัสผ่านได้');
    expect(page).toContain('issuePartnerStoreActivationInvitation');
  });
});
