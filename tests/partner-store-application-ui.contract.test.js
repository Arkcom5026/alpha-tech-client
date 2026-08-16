import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

describe('partner store application UI contract', () => {
  it('keeps public application non-operational and governance-driven', () => {
    const api = read('src/features/partnerStoreApplication/api/partnerStoreApplicationApi.js');
    const apply = read('src/features/partnerStoreApplication/pages/PartnerStoreApplicationPage.jsx');
    const review = read('src/features/partnerStoreApplication/pages/PartnerStoreApplicationReviewPage.jsx');
    const router = read('src/routes/AppRouter.jsx');
    const superadmin = read('src/routes/superadmin/superAdminRoutes.jsx');
    const superadminMenu = read('src/config/sidebarSuperadminItems.js');

    expect(api).toContain("'/public/partner-store-applications'");
    expect(api).toContain("'/partner-store/applications'");
    expect(api).toContain('/review');
    expect(api).toContain('/approve');
    expect(api).toContain('/reject');
    expect(apply).toContain('businessAddress');
    expect(apply).toContain('contactPhone');
    expect(apply).toContain('ยังไม่สร้างร้านหรือบัญชีเข้าใช้งานระบบ');
    expect(apply).toContain('ขั้นตอนเปิดใช้งานและกำหนดบัญชีเจ้าของร้านแยกต่างหาก');
    expect(apply).toContain('Application received');
    expect(apply).toContain('const submittingRef = useRef(false)');
    expect(apply).toContain('if (submitting || submittingRef.current) return');
    expect(apply).toContain('const payload = {');
    expect(apply).toContain('fieldset disabled={interactionBusy}');
    expect(apply).toContain('feedback.actionSuccess(');
    expect(apply).toContain('feedback.actionError(');
    expect(review).toContain('เริ่มตรวจสอบ');
    expect(review).toContain('อนุมัติใบสมัคร');
    expect(review).not.toContain('อนุมัติและเปิดร้าน');
    expect(review).toContain('ปฏิเสธ');
    expect(review).toContain('Owner User ID');
    expect(review).toContain("activationStatus === 'ACTIVE'");
    expect(router).toContain("'partner-portal/apply'");
    expect(superadmin).toContain("path: 'partner-store-applications'");
    expect(superadmin).toContain('<PartnerStoreApplicationReviewPage />');
    expect(superadmin).toContain('../governance/partner-store-applications');
    expect(superadminMenu).toContain('ใบสมัครร้านพาร์ทเนอร์');
    expect(superadminMenu).toContain('${basePath}/governance/partner-store-applications');
    expect(apply).not.toContain("'/auth/register'");
  });
});
