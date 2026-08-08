import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const loginPage = read('src/features/auth/pages/LoginPage.jsx');
const registerPage = read('src/features/auth/pages/RegisterPage.jsx');
const forgotPasswordPage = read('src/features/auth/pages/ForgotPasswordPage.jsx');
const resetPasswordPage = read('src/features/auth/pages/ResetPasswordPage.jsx');
const staffSettingsPage = read('src/features/auth/pages/StaffSettingsPage.jsx');
const partnerWelcomePage = read('src/features/auth/pages/PartnerWelcomePage.jsx');
const authStore = read('src/features/auth/store/authStore.js');

describe('authentication workspace behavior lock', () => {
  it('preserves login identifier validation and remembered-session behavior', () => {
    expect(loginPage).toContain("const rememberedIdentifier = useAuthStore((state) => state.lastLoginIdentifier);");
    expect(loginPage).toContain("const rememberedSessionFlag = useAuthStore((state) => state.rememberMe);");
    expect(loginPage).toContain('normalizedPhoneValue.length >= 9 && normalizedPhoneValue.length <= 15');
    expect(loginPage).toContain("กรุณากรอกอีเมลหรือเบอร์โทรศัพท์ที่ถูกต้อง");
    expect(loginPage).toContain('rememberMe });');
  });

  it('preserves post-login redirect authority and branch readiness guards', () => {
    expect(loginPage).toContain("navigate('/superadmin/dashboard', { replace: true });");
    expect(loginPage).toContain("navigate(`/${branchSlug}/pos/dashboard`, { replace: true });");
    expect(loginPage).toContain("navigate(`/${currentSlug}/pos/dashboard`, { replace: true });");
    expect(loginPage).toContain("navigate(requestedPath || '/', { replace: true });");
    expect(loginPage).toContain("กำลังเตรียมข้อมูลร้าน กรุณารอสักครู่แล้วลองอีกครั้ง");
    expect(loginPage).toContain("ไม่สามารถระบุสิทธิ์ผู้ใช้งานได้ กรุณาติดต่อผู้ดูแลระบบ");
  });

  it('preserves customer registration contract and partner-portal cutover', () => {
    expect(registerPage).toContain("registerUser({ name, phone, email, password, role: 'customer' })");
    expect(registerPage).toContain("navigate('/partner-portal', { replace: true });");
    expect(registerPage).toContain("resolver: zodResolver(registerSchema)");
  });

  it('preserves forgot-password submission semantics', () => {
    expect(forgotPasswordPage).toContain("if (!identifier.trim())");
    expect(forgotPasswordPage).toContain("requestPasswordResetAction({ email: identifier.trim() })");
    expect(forgotPasswordPage).toContain("setIdentifier('');");
    expect(forgotPasswordPage).toContain('ระบบได้ส่งลิงก์สำหรับการตั้งรหัสผ่านใหม่ไปยังข้อมูลของคุณเรียบร้อยแล้ว');
  });

  it('preserves reset-password token, validation, cleanup, and redirect behavior', () => {
    expect(resetPasswordPage).toContain("const MIN_PASSWORD_LENGTH = 6;");
    expect(resetPasswordPage).toContain("searchParams.get('token')");
    expect(resetPasswordPage).toContain('clearResetPasswordStateAction();');
    expect(resetPasswordPage).toContain('password !== confirmPassword');
    expect(resetPasswordPage).toContain('window.setTimeout(() =>');
    expect(resetPasswordPage).toContain("navigate('/partner-portal', { replace: true });");
  });

  it('preserves staff and partner-welcome entry points during extraction', () => {
    expect(staffSettingsPage).toContain('SubEmployeeManager');
    expect(partnerWelcomePage.length).toBeGreaterThan(500);
  });

  it('preserves auth-store session, reset, register, and branch hydration authority', () => {
    for (const action of [
      'registerPartnerAction',
      'addSubEmployeeAction',
      'requestPasswordResetAction',
      'resetPasswordAction',
      'verifySessionAction',
    ]) {
      expect(authStore).toContain(action);
    }
    expect(authStore).toContain("apiClient.get('/auth/me')");
    expect(authStore).toContain('loadAndSetBranchById(Number(branchId))');
    expect(authStore).toContain("authBootstrapState: 'idle'");
  });
});
