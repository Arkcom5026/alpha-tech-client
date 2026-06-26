// src/routes/partner/posPartnerRoutes.jsx
// 🏛️ Clean Architecture Routing: Unified Premium Integration (Safe Emergency Rollback Edition)
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// 🟢 1. ดึงท่อสัญญานระบบย่อยระดับ Live API (เรียงหน้ากระดานแบบ Flat โครงสร้างเดี่ยว)
import purchasesRoutes from './purchasesRoutes'; // 🛒 จัดซื้อ
import salesRoutes from './salesRoutes';         // 🛍️ งานขาย
import stockRoutes from './stockRoutes';         // 📦 คลังสินค้า

import { customerPartnerRoutes } from './customerPartnerRoutes';

// 🟢 2. นำเข้าโมดูลย่อยและคอมโพเนนต์ตัวจริงในระบบ ผ่านระบบสัญกรณ์ Alias @features
import DashboardPage from '@features/pos/pages/DashboardPage'; 
import ServicesDashboardPage from '@features/pos/pages/services/ServicesDashboardPage';
import LogoutPos from '@features/pos/pages/LogoutPos';
import FinanceDashboardPage from '@/features/finance/pages/FinanceDashboardPage';
import SettingsDashboardPage from '@/features/settings/pages/SettingsDashboardPage';

// 🟢 [LIVE FINANCE PAGES]
import DailyClosingPage from '@/features/finance/pages/DailyClosingPage';
import AccountsReceivablePage from '@/features/finance/pages/AccountsReceivablePage';
import CustomerCreditPage from '@/features/finance/pages/CustomerCreditPage';

// 🟢 [LIVE CUSTOMER RECEIPT / FINANCE CORE INTEGRATION]
import CustomerReceiptListPage from '@features/customerReceipt/pages/CustomerReceiptListPage';
import CreateCustomerReceiptPage from '@features/customerReceipt/pages/CreateCustomerReceiptPage';
import CustomerReceiptDetailPage from '@features/customerReceipt/pages/CustomerReceiptDetailPage';
import CustomerReceiptAllocatePage from '@features/customerReceipt/pages/CustomerReceiptAllocatePage';
import PrintCustomerReceiptPage from '@features/customerReceipt/pages/PrintCustomerReceiptPage';

// 🟢 [LIVE HR/EMPLOYEE PAGES]
import ListEmployeePage from '@features/employee/pages/ListEmployeePage';
import ApproveEmployeePage from '@features/employee/pages/ApproveEmployeePage';
import EditEmployeePage from '@features/employee/pages/EditEmployeePage';
import ManageRolesPage from '@features/employee/pages/ManageRolesPage';

// 🟢 [ADDED ACTIVE HR PAGE]: อิมพอร์ตหน้าสำหรับจัดตั้งและเพิ่มสิทธิ์พนักงานย่อยเข้าสู่ระบบรางสาขา
import StaffSettingsPage from '@/features/auth/pages/StaffSettingsPage';

// 🟢 [LIVE POSITION MODULE INTEGRATION - ACTIVE UNIFIED @features ALIAS]
import ListPositionPage from '@features/position/pages/ListPositionPage';
import CreatePositionPage from '@features/position/pages/CreatePositionPage';
import EditPositionPage from '@features/position/pages/EditPositionPage';

// 🟢 [LIVE SETTINGS / BANK MODULE INTEGRATION - DYNAMIC EXACT DIRECTORY FIXED]
import ListBankPage from '@/features/bank/page/ListBankPage';
import { CreateBankPage } from '@/features/bank/page/CreateBankPage';
import { EditBankPage } from '@/features/bank/page/EditBankPage';

// 🟢 [LIVE SETTINGS/BRANCH PAGES]
import ListBranchPage from '@/features/settings/pages/ListBranchPage';

// 🟡 แผ่นป้ายสแตนด์บายฉุกเฉินภายในไฟล์ (Inline Temporary Component) 
const TempReportPage = ({ title }) => (
  <div className="p-6 font-black text-orange-400 bg-slate-900/50 border border-orange-500/10 rounded-2xl shadow-inner text-xs md:text-sm font-sans animate-fadeIn">
    {title} <span className="text-slate-500 text-xs font-bold font-mono ml-2">(ระบบกำลังเคลียร์โฟลเดอร์ลุยสถาปัตยกรรมใหม่)</span>
  </div>
);

export const posPartnerRoutes = [
  { index: true, element: <Navigate to="dashboard" replace /> },

  // 📊 1. โมดูลหน้าหลักภาพรวม
  {
    path: 'dashboard',
    element: <DashboardPage />,
  },

  // 👥 2. โมดูลข้อมูลสมาชิกและลูกค้า
  {
    path: 'customers',
    children: customerPartnerRoutes
  },

  // 🟢 [THE BIG THREE - FLAT ROUTING]
  purchasesRoutes, // 🛒 จัดซื้อ
  salesRoutes,     // 🛍️ งานขาย
  stockRoutes,     // 📦 คลังสินค้า

  // 📈 4. โมดูลระบบรายงาน
  {
    path: 'reports',
    element: <Outlet />,
    children: [
      { index: true, element: <Navigate to="sales/list" replace /> },
      { path: 'sales/list', element: <TempReportPage title="📑 รายการเอกสารและบิลใบเสร็จงานขาย" /> },
      { path: 'sales/products', element: <TempReportPage title="📦 รายงานวิเคราะห์อันดับสินค้าขายดี" /> },
      { path: 'purchase', element: <TempReportPage title="🚚 รายงานวิเคราะห์ประวัติการจัดซื้อสินค้า" /> },
      { path: 'inputtax', element: <TempReportPage title="💰 รายงานสมุดบัญชีภาษีซื้อ" /> },
      { path: 'salestax', element: <TempReportPage title="💵 รายงานสมุดบัญชีภาษีขาย" /> }
    ]
  },

  // 💰 5. โมดูลการเงินและบัญชี
  {
    path: 'finance',
    element: <Outlet />,
    children: [
      { index: true, element: <FinanceDashboardPage /> },
      { path: 'daily-closing', element: <DailyClosingPage /> },
      { path: 'ar', border: 'none', element: <AccountsReceivablePage /> },
      { path: 'customer-credit', element: <CustomerCreditPage /> },
      
      {
        path: 'customer-receipts',
        children: [
          { index: true, element: <CustomerReceiptListPage /> },
          { path: 'create', element: <CreateCustomerReceiptPage /> },
          { path: ':id', element: <CustomerReceiptDetailPage /> },
          { path: ':id/allocate', element: <CustomerReceiptAllocatePage /> },
          { path: ':id/print', element: <PrintCustomerReceiptPage /> }
        ]
      }
    ]
  },

  // ⚙️ 6. โมดูลตั้งค่าระบบ (Settings Core Active Module)
  {
    path: 'settings',
    element: <Outlet />,
    children: [
      { index: true, element: <SettingsDashboardPage /> },
      
      // 👥 6.1 สายย่อยกลุ่มบริหารบุคลากรและสิทธิ์ (HR Settings)
      { path: 'employee', element: <ListEmployeePage /> },
      { path: 'employee/edit/:id', element: <EditEmployeePage /> },
      { path: 'approve', element: <ApproveEmployeePage /> },
      { path: 'roles', element: <ManageRolesPage /> },
      
      // 🟢 [ADDED HIGH-ACCURACY PORT]: ช่องทางเรียกหน้าจอจัดสรรสิทธิ์และสร้างไอดีพนักงานย่อยแชร์สาขา
      // พิกัด URL จริงบนเบราว์เซอร์: /:shopSlug/pos/settings/staff
      { path: 'staff', element: <StaffSettingsPage /> },
      
      // 🟢 [POSITION MODULE ACTIVE]: เชื่อมแผงตารางสิทธิ์ตำแหน่งพนักงานตัวจริงหน้าร้าน
      {
        path: 'positions',
        children: [
          { index: true, element: <ListPositionPage /> },
          { path: 'create', element: <CreatePositionPage /> },
          { path: 'edit/:id', element: <EditPositionPage /> }
        ]
      },
      
      // 🏢 6.2 สายย่อยกลุ่มจัดการสาขาและช่องทางธุรกรรม (Infrastructure Settings)
      { path: 'branches', element: <ListBranchPage /> },
      
      // 🏢 6.3 ระบบจัดการบัญชีธนาคารรับ/จ่าย
      {
        path: 'bank',
        children: [
          { index: true, element: <ListBankPage /> },
          { path: 'create', element: <CreateBankPage /> },
          { path: 'edit/:id', element: <EditBankPage /> }
        ]
      }
    ]
  },

  // 🛠️ 7. โมดูลบริการหลังการขาย (Service)
  {
    path: 'services',
    children: [
      { index: true, element: <ServicesDashboardPage /> }
    ]
  },

  // 🛠️ 8. เส้นทางกลางและคำสั่งทางออกจากระบบ
  { path: 'logout', element: <LogoutPos /> }
];