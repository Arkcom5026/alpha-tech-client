// ✅ src/routes/customerRoutes.jsx
import { Navigate } from 'react-router-dom';

import ListCustomersPage from '@/features/customer/pages/ListCustomersPage';
import CustomerDetailPage from '@/features/customer/pages/CustomerDetailPage';

const customerRoutes = {
  // ✅ nested under posRoutes (path: 'pos')
  // so this route must be relative: /pos/customers
  path: 'customers',
  children: [
    { index: true, element: <ListCustomersPage /> },
    { path: ':customerId', element: <CustomerDetailPage /> },

    // ✅ กัน path แปลก ๆ
    { path: '*', element: <Navigate to="." replace /> },
  ],
};

export default customerRoutes;