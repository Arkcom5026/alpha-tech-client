// ✅ src/routes/onlineRoutes.js
import React from 'react';

import ListEmployeePage from '@/features/employee/pages/ListEmployeePage';
import EditBranchPage from '@/features/branch/page/EditBranchPage';
import ListBranchPage from '@/features/branch/page/ListBranchPage';
import CreateBranchPage from '@/features/branch/page/CreateBranchPage';


const settingsRoutes = {
  path: '/pos',
  children: [
    {
      path: 'settings',
      children: [
        { index: true, element: <ListEmployeePage /> },
        { path: 'branches', element: <ListBranchPage /> },
        { path: 'branches/create', element: <CreateBranchPage /> },
        { path: 'branches/edit/:id', element: <EditBranchPage /> },
      ],
    },
  ],
};

export default settingsRoutes;
