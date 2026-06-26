// src/routes/partner/dashboardPartnerRoutes.jsx
import React from 'react';

import DashboardPage from "@/features/pos/pages/DashboardPage";
import SalesSummaryPage from "@/features/pos/pages/SalesSummaryPage";
import ChartsPage from "@/features/pos/pages/ChartsPage";
import DailyReportPage from "@/features/pos/pages/DailyReportPage";
import MonthlyReportPage from "@/features/pos/pages/MonthlyReportPage";

export const dashboardPartnerRoutes = [
  { index: true, element: <DashboardPage /> },
  { path: 'sales-summary', element: <SalesSummaryPage /> },
  { path: 'charts', element: <ChartsPage /> },
  { path: 'daily-report', element: <DailyReportPage /> },
  { path: 'monthly-report', element: <MonthlyReportPage /> }
];