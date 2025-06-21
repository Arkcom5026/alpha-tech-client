// ✅ src/routes/onlineRoutes.js
import React from 'react';

import ListEmployeePage from '@/features/employee/pages/ListEmployeePage';
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
        { path: 'branches/edit/:id', element: <CreateBranchPage /> },
        
      ],
    },


      
    // { path: 'approve', element: < /> }, // ✅ รองรับ query เช่น ?branchId=2
  ],

};

export default settingsRoutes;
