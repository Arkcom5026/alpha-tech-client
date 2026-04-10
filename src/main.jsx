import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// ✅ main.jsx ต้องทำหน้าที่ bootstrap app เท่านั้น
// ❌ ไม่ควรตัดสิน auth / branch lifecycle จาก localStorage ที่นี่
// การตรวจสอบ session และการ cleanup ให้ไปอยู่ที่ store / auth bootstrap flow แทน

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
