// ✅ src/routes/onlineRoutes.js
import React from 'react';
import { Outlet } from 'react-router-dom';

import ListEmployeePage from '@/features/employee/pages/ListEmployeePage';
import EditBranchPage from '@/features/branch/page/EditBranchPage';
import ListBranchPage from '@/features/branch/page/ListBranchPage';
import CreateBranchPage from '@/features/branch/page/CreateBranchPage';
import EditEmployeePage from '@/features/employee/pages/EditEmployeePage';
import ApproveEmployeePage from '@/features/employee/pages/ApproveEmployeePage';

const settingsRoutes = {
  path: '/pos/settings',
  element: <Outlet />, // ✅ เพิ่ม element ให้ path หลัก
  children: [
    {
      path: 'branches',
      children: [
        { index: true, element: <ListBranchPage /> },
        { path: 'create', element: <CreateBranchPage /> },
        { path: 'edit/:id', element: <EditBranchPage /> },
      ],
    },
    {
      path: 'employee',
      children: [
        { index: true, element: <ListEmployeePage /> },
         { path: 'approve', element: <ApproveEmployeePage /> },
         { path: 'edit/:id', element: <EditEmployeePage /> },
      ],
    },
  ],
};

export default settingsRoutes;
