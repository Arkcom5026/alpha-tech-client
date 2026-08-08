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

const loginWorkspace = read('src/features/auth/workspaces/LoginWorkspace.jsx');
const registerWorkspace = read('src/features/auth/workspaces/RegisterWorkspace.jsx');
const forgotPasswordWorkspace = read('src/features/auth/workspaces/ForgotPasswordWorkspace.jsx');
const resetPasswordWorkspace = read('src/features/auth/workspaces/ResetPasswordWorkspace.jsx');
const staffSettingsWorkspace = read('src/features/auth/workspaces/StaffSettingsWorkspace.jsx');
const partnerWelcomeWorkspace = read('src/features/auth/workspaces/PartnerWelcomeWorkspace.jsx');
const authStore = read('src/features/auth/store/authStore.js');

describe('authentication workspace behavior lock', () => {
  it('preserves login identifier validation and remembered-session behavior', () => {
    expect(loginWorkspace).toContain("const rememberedIdentifier = useAuthStore((state) => state.lastLoginIdentifier);");
    expect(loginWorkspace).toContain("const rememberedSessionFlag = useAuthStore((state) => state.rememberMe);");
    expect(loginWorkspace).toContain('normalizedPhoneValue.length >= 9 && normalizedPhoneValue.length <= 15');
    expect(loginWorkspace).toContain('กรุณากรอกอีเมลหรือเบอร์โทรศัพท์ที่ถูกต้อง');
    expect(loginWorkspace).toContain('rememberMe });');
  });

  it('preserves post-login redirect authority and branch readiness guards', () => {
    expect(loginWorkspace).toContain("navigate('/superadmin/dashboard', { replace: true });");
    expect(loginWorkspace).toContain("navigate(`/${branchSlug}/pos/dashboard`, { replace: true });");
    expect(loginWorkspace).toContain("navigate(`/${currentSlug}/pos/dashboard`, { replace: true });");
    expect(loginWorkspace).toContain("navigate(requestedPath || '/', { replace: true });");
    expect(loginWorkspace).toContain('กำลังเตรียมข้อมูลร้าน กรุณารอสักครู่แล้วลองอีกครั้ง');
    expect(loginWorkspace).toContain('ไม่สามารถระบุสิทธิ์ผู้ใช้งานได้ กรุณาติดต่อผู้ดูแลระบบ');
  });

  it('preserves customer registration contract and partner-portal cutover', () => {
    expect(registerWorkspace).toContain("registerUser({ name, phone, email, password, role: 'customer' })");
    expect(registerWorkspace).toContain("navigate('/partner-portal', { replace: true });");
    expect(registerWorkspace).toContain('resolver: zodResolver(registerSchema)');
  });

  it('preserves forgot-password submission semantics', () => {
    expect(forgotPasswordWorkspace).toContain('if (!identifier.trim())');
    expect(forgotPasswordWorkspace).toContain('requestPasswordResetAction({ email: identifier.trim() })');
    expect(forgotPasswordWorkspace).toContain("setIdentifier('');");
    expect(forgotPasswordWorkspace).toContain('ระบบได้ส่งลิงก์สำหรับการตั้งรหัสผ่านใหม่ไปยังข้อมูลของคุณเรียบร้อยแล้ว');
  });

  it('preserves reset-password token, validation, cleanup, and redirect behavior', () => {
    expect(resetPasswordWorkspace).toContain('const MIN_PASSWORD_LENGTH = 6;');
    expect(resetPasswordWorkspace).toContain("searchParams.get('token')");
    expect(resetPasswordWorkspace).toContain('clearResetPasswordStateAction();');
    expect(resetPasswordWorkspace).toContain('password !== confirmPassword');
    expect(resetPasswordWorkspace).toContain('window.setTimeout(() =>');
    expect(resetPasswordWorkspace).toContain("navigate('/partner-portal', { replace: true });");
  });

  it('preserves staff and partner-welcome entry points during extraction', () => {
    expect(staffSettingsWorkspace).toContain('SubEmployeeManager');
    expect(partnerWelcomeWorkspace.length).toBeGreaterThan(500);
  });

  it('cuts route-facing pages over to workspace boundaries', () => {
    expect(loginPage).toContain("../workspaces/LoginWorkspace");
    expect(registerPage).toContain("../workspaces/RegisterWorkspace");
    expect(forgotPasswordPage).toContain("../workspaces/ForgotPasswordWorkspace");
    expect(resetPasswordPage).toContain("../workspaces/ResetPasswordWorkspace");
    expect(staffSettingsPage).toContain("../workspaces/StaffSettingsWorkspace");
    expect(partnerWelcomePage).toContain("../workspaces/PartnerWelcomeWorkspace");

    for (const pageSource of [
      loginPage,
      registerPage,
      forgotPasswordPage,
      resetPasswordPage,
      staffSettingsPage,
      partnerWelcomePage,
    ]) {
      expect(pageSource).not.toContain('useState(');
      expect(pageSource).not.toContain('useAuthStore(');
    }
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
