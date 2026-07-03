// src/routes/superadmin/superAdminRoutes.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';

import CandidateReviewPage from '@/features/templateCandidate/pages/CandidateReviewPage';
import CandidateDetailPage from '@/features/templateCandidate/pages/CandidateDetailPage';
import ProductTemplateGovernanceListPage from '@/features/productTemplate/pages/ProductTemplateGovernanceListPage';
import ProductTemplateGovernanceDetailPage from '@/features/productTemplate/pages/ProductTemplateGovernanceDetailPage';
import ProductTemplateGovernanceEditPage from '@/features/productTemplate/pages/ProductTemplateGovernanceEditPage';

const SuperAdminPlaceholderPage = ({ title, description }) => (
  <div className="space-y-4">
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-orange-500">Superadmin</p>
      <h1 className="mt-2 text-2xl font-black text-slate-900">{title}</h1>
      <p className="mt-2 max-w-3xl text-sm font-medium text-slate-500">{description}</p>
    </section>
  </div>
);

export const superAdminRoutes = [
  {
    index: true,
    element: (
      <SuperAdminPlaceholderPage
        title="Superadmin Dashboard"
        description="ภาพรวมระบบกำกับดูแล Catalog และข้อมูลกลางของหลายสาขา"
      />
    ),
  },
  {
    path: 'catalog',
    children: [
      { index: true, element: <Navigate to="templates" replace /> },
      {
        path: 'templates',
        children: [
          { index: true, element: <ProductTemplateGovernanceListPage /> },
          { path: ':id', element: <ProductTemplateGovernanceDetailPage /> },
          { path: ':id/edit', element: <ProductTemplateGovernanceEditPage /> },
        ],
      },
      {
        path: 'candidates',
        children: [
          { index: true, element: <CandidateReviewPage /> },
          { path: ':id', element: <CandidateDetailPage /> },
        ],
      },
      {
        path: 'brands',
        element: <SuperAdminPlaceholderPage title="Brands" description="จัดการ Brand กลางสำหรับ Catalog Governance" />,
      },
      {
        path: 'categories',
        element: <SuperAdminPlaceholderPage title="Categories" description="จัดการ Category กลางสำหรับ Template Catalog" />,
      },
      {
        path: 'product-types',
        element: <SuperAdminPlaceholderPage title="Product Types" description="จัดการ Product Type กลางสำหรับ Product Discovery" />,
      },
      {
        path: 'units',
        element: <SuperAdminPlaceholderPage title="Units" description="จัดการหน่วยนับกลางของสินค้า" />,
      },
    ],
  },
  {
    path: 'governance',
    children: [
      { index: true, element: <Navigate to="review-queue" replace /> },
      {
        path: 'review-queue',
        element: <SuperAdminPlaceholderPage title="Review Queue" description="คิวตรวจสอบ Candidate สำหรับ Reviewer และ Catalog Admin" />,
      },
      {
        path: 'merge-queue',
        element: <SuperAdminPlaceholderPage title="Merge Queue" description="คิวรวม Candidate กับ Template หรือ Candidate ที่มีอยู่แล้ว" />,
      },
      {
        path: 'promotion-queue',
        element: <SuperAdminPlaceholderPage title="Promotion Queue" description="คิว Promote Candidate เป็น Template Catalog" />,
      },
      {
        path: 'audit-log',
        element: <SuperAdminPlaceholderPage title="Audit Log" description="ประวัติการตัดสินใจและการเปลี่ยนสถานะของ Catalog Governance" />,
      },
    ],
  },
  {
    path: 'analytics',
    children: [
      { index: true, element: <Navigate to="candidates" replace /> },
      {
        path: 'candidates',
        element: <SuperAdminPlaceholderPage title="Candidate Analytics" description="สถิติ Candidate ตามสถานะ สาขา และช่วงเวลา" />,
      },
      {
        path: 'catalog-growth',
        element: <SuperAdminPlaceholderPage title="Catalog Growth" description="การเติบโตของ Template Catalog จากการใช้งานจริง" />,
      },
      {
        path: 'branch-adoption',
        element: <SuperAdminPlaceholderPage title="Branch Adoption" description="การนำ Template และ Candidate ไปใช้ในแต่ละสาขา" />,
      },
    ],
  },
  {
    path: 'settings',
    children: [
      { index: true, element: <SuperAdminPlaceholderPage title="Settings" description="ตั้งค่าพื้นฐานของ Superadmin Console" /> },
      {
        path: 'permissions',
        element: <SuperAdminPlaceholderPage title="Permissions" description="สิทธิ์ Reviewer, Catalog Admin และ Superadmin" />,
      },
      {
        path: 'system',
        element: <SuperAdminPlaceholderPage title="System" description="ตั้งค่าระบบ Governance Runtime" />,
      },
      {
        path: 'api',
        element: <SuperAdminPlaceholderPage title="API" description="ข้อมูล API Contract และ Integration ของ Mission C" />,
      },
    ],
  },
];

export default superAdminRoutes;
