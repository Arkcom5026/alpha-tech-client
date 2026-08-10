/* eslint-disable react-refresh/only-export-components */
// src/routes/partner/posPartnerRoutes.jsx
// 🏛️ Clean Architecture Routing: Unified Premium Integration (Safe Emergency Rollback Edition)
// 🎨 Minimal Platinum Light Mode Edition Integrated — Fix Blank Screen Loop
import React from 'react';
import { Navigate, Outlet, useParams } from 'react-router-dom';
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
import StoreHomepageEditorPage from '@/features/storeExperience/pages/StoreHomepageEditorPage';
import OnlineProductVisibilityDashboardPage from '@/features/storeExperience/pages/OnlineProductVisibilityDashboardPage';
import PrinterSettingsPage from '@/features/printing/settings/PrinterSettingsPage';
import TaxIssuerProfilePage from '@/features/tax/issuerProfile/pages/TaxIssuerProfilePage';
import SalesTaxFilingPage from '@/features/tax/outputFilings/pages/SalesTaxFilingPage';
import TaxPublicationRetryPage from '@/features/tax/publicationRetry/pages/TaxPublicationRetryPage';
import ListSalesTaxReportPage from '@/features/salesTaxReport/pages/ListSalesTaxReportPage';
import PrintSalesTaxReportPage from '@/features/salesTaxReport/pages/PrintSalesTaxReportPage';

import DailyClosingPage from '@/features/finance/pages/DailyClosingPage';
import AccountsReceivablePage from '@/features/finance/pages/AccountsReceivablePage';
import CustomerCreditPage from '@/features/finance/pages/CustomerCreditPage';
import TaxIntakeWorkspacePage from '@/features/tax/intake/pages/TaxIntakeWorkspacePage';
import TaxPeriodManagementPage from '@/features/tax/periods/pages/TaxPeriodManagementPage';
import AccountingOfficePackagePage from '@/features/tax/periods/pages/AccountingOfficePackagePage';
import InputTaxReceiptWorkspacePage from '@/features/tax/inputDocuments/pages/InputTaxReceiptWorkspacePage';
import InputVatReportPage from '@/features/tax/inputVatReport/pages/InputVatReportPage';
import SupplierPayableWorkspacePage from '@/features/supplierPayable/pages/SupplierPayableWorkspacePage';
import TaxExpenseWorkspacePage from '@/features/taxExpense/pages/TaxExpenseWorkspacePage';
import CustomerMoneyReceiveListPage from '@/features/customerMoneyReceive/pages/CustomerMoneyReceiveListPage';
import CustomerMoneyReceivePage from '@/features/customerMoneyReceive/pages/CustomerMoneyReceivePage';
import CustomerMoneyReceiveDetailPage from '@/features/customerMoneyReceive/pages/CustomerMoneyReceiveDetailPage';
import CustomerMoneyReceiptPrintPage from '@/features/customerMoneyReceive/pages/CustomerMoneyReceiptPrintPage';
import DeliveryCreditSettlementListPage from '@/features/customerMoneySettlement/pages/DeliveryCreditSettlementListPage';
import DeliveryCreditSettlementCreatePage from '@/features/customerMoneySettlement/pages/DeliveryCreditSettlementCreatePage';
import DeliveryCreditSettlementDetailPage from '@/features/customerMoneySettlement/pages/DeliveryCreditSettlementDetailPage';
import DeliveryCreditSettlementPrintPage from '@/features/customerMoneySettlement/pages/DeliveryCreditSettlementPrintPage';

import CustomerReceiptListPage from '@features/customerReceipt/pages/CustomerReceiptListPage';
import CustomerReceiptDetailPage from '@features/customerReceipt/pages/CustomerReceiptDetailPage';
import PrintCustomerReceiptPage from '@features/customerReceipt/pages/PrintCustomerReceiptPage';
import ReprintCustomerReceiptPage from '@features/customerReceipt/reprint/pages/ReprintCustomerReceiptPage';

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
import QuickStockPage from '@/features/receiving/quick-stock/pages/QuickStockPage';
import { repairRouteConfigs } from './repairRouteConfig';

const TempReportPage = ({ title }) => (
  <div className="p-6 font-black text-orange-400 bg-slate-900/50 border border-orange-500/10 rounded-2xl shadow-inner text-xs md:text-sm font-sans animate-fadeIn">
    {title} <span className="text-slate-500 text-xs font-bold font-mono ml-2">(ระบบกำลังเคลียร์โฟลเดอร์ลุยสถาปัตยกรรมใหม่)</span>
  </div>
);

const LegacyCustomerMoneyRedirect = ({ target }) => {
  const { shopSlug } = useParams();
  return <Navigate to={`/${shopSlug || 'advancetech'}/pos/finance/${target}`} replace />;
};

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
          { path: 'inputtax', element: <InputVatReportPage /> },
          { path: 'salestax', element: <ListSalesTaxReportPage /> },
          { path: 'sales-tax/print', element: <PrintSalesTaxReportPage /> },
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
          { path: 'tax-intake', element: <TaxIntakeWorkspacePage /> },
          { path: 'input-tax-receipts', element: <InputTaxReceiptWorkspacePage /> },
          { path: 'tax-periods', element: <TaxPeriodManagementPage /> },
          { path: 'output-tax-filings', element: <SalesTaxFilingPage /> },
          { path: 'tax-publication-retry', element: <TaxPublicationRetryPage /> },
          { path: 'tax-periods/:taxPeriodId/accounting-office', element: <AccountingOfficePackagePage /> },
          { path: 'tax-expenses', element: <TaxExpenseWorkspacePage /> },
          { path: 'supplier-payables', element: <SupplierPayableWorkspacePage /> },
          {
            path: 'customer-money-receive',
            children: [
              { index: true, element: <CustomerMoneyReceiveListPage /> },
              { path: 'create', element: <CustomerMoneyReceivePage /> },
              { path: ':id', element: <CustomerMoneyReceiveDetailPage /> },
              { path: ':id/print', element: <CustomerMoneyReceiptPrintPage /> },
            ],
          },
          {
            path: 'customer-money-settlements',
            children: [
              { index: true, element: <DeliveryCreditSettlementListPage /> },
              { path: 'create', element: <DeliveryCreditSettlementCreatePage /> },
              { path: ':id', element: <DeliveryCreditSettlementDetailPage /> },
              { path: ':id/print', element: <DeliveryCreditSettlementPrintPage /> },
            ],
          },
          {
            path: 'customer-receipts',
            children: [
              { index: true, element: <CustomerReceiptListPage /> },
              { path: 'create', element: <LegacyCustomerMoneyRedirect target="customer-money-receive/create" /> },
              { path: ':id', element: <CustomerReceiptDetailPage /> },
              { path: ':id/allocate', element: <LegacyCustomerMoneyRedirect target="customer-money-settlements/create" /> },
              { path: ':id/print', element: <PrintCustomerReceiptPage /> },
              { path: ':id/reprint', element: <ReprintCustomerReceiptPage /> },
            ],
          },
        ],
      },
      {
        path: 'settings',
        element: <Outlet />,
        children: [
          { index: true, element: <SettingsDashboardPage /> },
          { path: 'printers', element: <PrinterSettingsPage /> },
          { path: 'tax-issuer', element: <TaxIssuerProfilePage /> },
          { path: 'storefront', element: <StoreHomepageEditorPage /> },
          { path: 'online-products', element: <OnlineProductVisibilityDashboardPage /> },
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
