import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('Partner Store Activation UI v2 contract', () => {
  it('keeps invitation and public owner claim separate from provisioning', () => {
    const api = read('src/features/partnerStoreApplication/api/partnerStoreActivationApi.js');
    const review = read('src/features/partnerStoreApplication/pages/PartnerStoreApplicationReviewPage.jsx');
    const activation = read('src/features/partnerStoreApplication/pages/PartnerStoreActivationPage.jsx');
    const router = read('src/routes/AppRouter.jsx');

    expect(api).toContain('/activation-invitations');
    expect(api).toContain('/public/partner-store-applications/activation/claim');
    expect(review).toContain('issuePartnerStoreActivationInvitation');
    expect(review).toContain("provisioningStatus === 'PROVISIONED'");
    expect(review).toContain("activationStatus !== 'ACTIVE'");
    expect(review).toContain('ออกลิงก์เปิดใช้งาน');
    expect(review).toContain('ออกลิงก์ใหม่');
    expect(review).toContain('ลิงก์เก่าจะถูกยกเลิกเมื่อออกลิงก์ใหม่');

    expect(router).toContain("path: 'partner-portal/activate'");
    expect(router).toContain('<PartnerStoreActivationPage />');
    expect(activation).toContain('claimPartnerStoreActivation');
    expect(activation).toContain('ตั้งรหัสผ่านสำหรับบัญชีเจ้าของร้าน');
    expect(activation).toContain('const nextPassword = password');
    expect(activation).toContain('nextPassword.length < 8');
    expect(activation).toContain('password: nextPassword');
    expect(activation).toContain('feedback.actionSuccess(');
    expect(activation).toContain('feedback.actionError(');
    expect(activation).toContain("'partner-store:activation:success'");
    expect(activation).toContain("'partner-store:activation:error'");
    expect(activation).toContain("to=\"/login\"");
    expect(activation).not.toContain('useAuthStore');
    expect(activation).not.toContain('setAccessToken');
  });
});
