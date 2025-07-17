import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// ✅ ล้าง localStorage เฉพาะกรณี token หรือ branch ผิด format หรือ decode ไม่ได้ เพื่อไม่ให้ user หลุดจากระบบโดยไม่จำเป็น
try {
  const rawToken = localStorage.getItem('auth-storage');
  const rawBranch = localStorage.getItem('branch-storage');

  const hasValidToken = rawToken && JSON.parse(rawToken)?.state?.token;
  const hasValidBranch = rawBranch && JSON.parse(rawBranch)?.state?.currentBranch;

  if (!hasValidToken || !hasValidBranch) {
    localStorage.removeItem('auth-storage');
    localStorage.removeItem('branch-storage');
    console.warn('🧹 ล้าง localStorage เพราะ token/branch ไม่สมบูรณ์');
  }
} catch (err) {
  console.error('❌ localStorage format ผิด → ล้างออกทั้งหมด', err);
  localStorage.removeItem('auth-storage');
  localStorage.removeItem('branch-storage');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
