// ✅ src/routes/settingsRoutes.js (โครงสร้างแบบ A — แบน ลดโอกาส Active ซ้อน)
import React from 'react';
import { Outlet } from 'react-router-dom';

import ListEmployeePage from '@/features/employee/pages/ListEmployeePage';
import EditBranchPage from '@/features/branch/page/EditBranchPage';
import ListBranchPage from '@/features/branch/page/ListBranchPage';
import CreateBranchPage from '@/features/branch/page/CreateBranchPage';
import EditEmployeePage from '@/features/employee/pages/EditEmployeePage';
import ApproveEmployeePage from '@/features/employee/pages/ApproveEmployeePage';
import ListBankPage from '@/features/bank/page/ListBankPage';
import { CreateBankPage } from '@/features/bank/page/CreateBankPage';
import { EditBankPage } from '@/features/bank/page/EditBankPage';
import ListPositionPage from '@/features/position/pages/ListPositionPage';
import CreatePositionPage from '@/features/position/pages/CreatePositionPage';
import EditPositionPage from '@/features/position/pages/EditPositionPage';
import SettingsDashboardPage from '@/features/settings/pages/SettingsDashboardPage';
import ManageRolesPage from '@/features/employee/pages/ManageRolesPage';

// ⚙️ ROUTES: Dashboard เป็น index ของ "/pos/settings" และกระจายเมนูย่อยระดับเดียวกัน
// - รายชื่อพนักงาน:         /pos/settings/employee
// - อนุมัติพนักงานใหม่:     /pos/settings/approve        (ย้ายออกจากใต้ employee)
// - จัดการตำแหน่งงาน:      /pos/settings/positions      (ย้ายออกจากใต้ employee)
// โครงนี้ช่วยลดโอกาส active ซ้อน เพราะ path ไม่ซ้ำพาเรนต์เดียวกัน
const settingsRoutes = {
  path: '/pos/settings',
  element: <Outlet />, // ✅ Layout ของ Settings
  children: [
    { index: true, element: <SettingsDashboardPage /> }, // ⬅️ Dashboard (exact index)

    // พนักงาน (เฉพาะ list + edit)
    {
      path: 'employee',
      children: [
        { index: true, element: <ListEmployeePage /> },
        { path: 'edit/:id', element: <EditEmployeePage /> },
      ],
    },

    // อนุมัติพนักงานใหม่ (ย้ายมาอยู่ระดับเดียวกับ employee)
    { path: 'approve', element: <ApproveEmployeePage /> },

    // จัดการ role
    { path: 'roles', element: <ManageRolesPage /> },

    // ตำแหน่งงาน (ย้ายมาอยู่ระดับเดียวกับ employee)
    {
      path: 'positions',
      children: [
        { index: true, element: <ListPositionPage /> },
        { path: 'create', element: <CreatePositionPage /> },
        { path: 'edit/:id', element: <EditPositionPage /> },
      ],
    },

    // สาขา
    {
      path: 'branches',
      children: [
        { index: true, element: <ListBranchPage /> },
        { path: 'create', element: <CreateBranchPage /> },
        { path: 'edit/:id', element: <EditBranchPage /> },
      ],
    },

    // ธนาคาร
    {
      path: 'bank',
      children: [
        { index: true, element: <ListBankPage /> },
        { path: 'create', element: <CreateBankPage /> },
        { path: 'edit/:id', element: <EditBankPage /> },
      ],
    },
  ],
};

export default settingsRoutes;


