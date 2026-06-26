import React from 'react';
import { Outlet } from 'react-router-dom';
import SettingsDashboardPage from '@/features/settings/pages/SettingsDashboardPage';

const settingsPartner = {
  path: 'settings',
  element: <Outlet />,
  children: [
    { index: true, element: <SettingsDashboardPage /> }
  ]
};
export default settingsPartner;