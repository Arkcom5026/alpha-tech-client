// src/routes/partner/posPartnerRoutes.jsx
// 🏛️ Clean Architecture Routing: Unified Premium Integration (Safe Emergency Rollback Edition)
// 🎨 Minimal Platinum Light Mode Edition Integrated — Fix Blank Screen Loop
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import ProtectedRoute from '@/features/auth/components/ProtectedRoute';

import purchasesRoutes from './purchasesRoutes';
import salesRoutes from './salesRoutes';
import stockRoutes from './stockRoutes';
import { customerPartnerRoutes } from './customerPartnerRoutes';

import DashboardPage from '@features/pos/pages/DashboardPage';
import LogoutPos from '@features/pos/pages/LogoutPos';
import FinanceDashboardPage from '@/features/finance/pages/FinanceDashboardPage';
import SettingsDashboardPage from '@/features/settings/pages/SettingsDashboardPage';
import ServicesDashboardPage from '@/features/pos/pages/dashboard/ServicesDashboardPage';
import { ReportsDashboardPage } from '@/features/pos/pages/dashboard/ReportsDashboardPage';

import DailyClosingPage from '@/features/finance/pages/DailyClosingPage';
import AccountsReceivablePage from '@/features/finance/pages/AccountsReceivablePage';
import CustomerCreditPage from '@/features/finance/pages/CustomerCreditPage';

import CustomerReceiptListPage from '@features/customerReceipt/pages/CustomerReceiptListPage';
import CreateCustomerReceiptPage from '@features/customerReceipt/pages/CreateCustomerReceiptPage';
import CustomerReceiptDetailPage from '@features/customerReceipt/pages/CustomerReceiptDetailPage';
import CustomerReceiptAllocatePage from '@features/customerReceipt/pages/CustomerReceiptAllocatePage';
import PrintCustomerReceiptPage from '@features/customerReceipt/pages/PrintCustomerReceiptPage';

import ListEmployeePage from '@features/employee/pages/ListEmployeePage';
import EditEmployeePage from '@features/employee/pages/EditEmployeePage';
import ManageRolesPage from '@features/employee/pages/ManageRolesPage';
import StaffSettingsPage from '@/features/auth/pages/StaffSettingsPage';

import ListPositionPage from '@features/position/pages/ListPositionPage';
import CreatePositionPage from '@features/position/pages/CreatePositionPage';
import EditPositionPage from '@features/position/pages/EditPositionPage';

import ListBankPage from '@/features/bank/page/ListBankPage';
import { CreateBankPage } from '@/features/bank/page/CreateBankPage';
import { EditBankPage } from '@/features/bank/page/EditBankPage';
import ListBranchPage from '@/features/settings/pages/ListBranchPage';
import QuickStockPage from '@/features/product/quick-stock/pages/QuickStockPage';
import { repairRouteConfigs } from './repairRouteConfig';

const TempReportPage = ({ title }) => (
  <div className="p-6 font-black text-orange-400 bg-slate-900/50 border border-orange-500/10 rounded-2xl shadow-inner text-xs md:text-sm font-sans animate-fadeIn">
    {title} <span className="text-slate-500 text-xs font-bold font-mono ml-2">(ระบบกำลังเคลียร์โฟลเดอร์ลุยสถาปัตยกรรมใหม่)</span>
  </div>
);

export const posPartnerRoutes = [
  {
    element: <ProtectedRoute />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'customers', children: customerPartnerRoutes },
      purchasesRoutes,
      salesRoutes,
      stockRoutes,
      { path: 'stock/quick-input', element: <QuickStockPage /> },
      {
        path: 'reports',
        element: <Outlet />,
        children: [
          { index: true, element: <ReportsDashboardPage /> },
          { path: 'sales', element: <ReportsDashboardPage /> },
          { path: 'sales/list', element: <TempReportPage title="📑 รายการเอกสารและบิลใบเสร็จงานขาย" /> },
          { path: 'sales/products', element: <TempReportPage title="📦 รายงานวิเคราะห์อันดับสินค้าขายดี" /> },
          { path: 'purchase', element: <TempReportPage title="🚚 รายงานวิเคราะห์ประวัติการจัดซื้อสินค้า" /> },
          { path: 'inputtax', element: <TempReportPage title="💰 รายงานสมุดบัญชีภาษีซื้อ" /> },
          { path: 'salestax', element: <TempReportPage title="💵 รายงานสมุดบัญชีภาษีขาย" /> },
        ],
      },
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
              { path: ':id/print', element: <PrintCustomerReceiptPage /> },
            ],
          },
        ],
      },
      {
        path: 'settings',
        element: <Outlet />,
        children: [
          { index: true, element: <SettingsDashboardPage /> },
          { path: 'employee', element: <ListEmployeePage /> },
          { path: 'employee/edit/:id', element: <EditEmployeePage /> },
          { path: 'roles', element: <ManageRolesPage /> },
          { path: 'staff', element: <StaffSettingsPage /> },
          {
            path: 'positions',
            children: [
              { index: true, element: <ListPositionPage /> },
              { path: 'create', element: <CreatePositionPage /> },
              { path: 'edit/:id', element: <EditPositionPage /> },
            ],
          },
          { path: 'branches', element: <ListBranchPage /> },
          {
            path: 'bank',
            children: [
              { index: true, element: <ListBankPage /> },
              { path: 'create', element: <CreateBankPage /> },
              { path: 'edit/:id', element: <EditBankPage /> },
            ],
          },
        ],
      },
      {
        path: 'services',
        element: <Outlet />,
        children: [
          { index: true, element: <ServicesDashboardPage /> },
          ...repairRouteConfigs,
        ],
      },
      { path: 'logout', element: <LogoutPos /> },
    ],
  },
];
