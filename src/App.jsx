
// src/App.jsx

import React, { useEffect } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import router from '@/routes';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  const bootstrapAuthAction = useAuthStore((state) => state.bootstrapAuthAction);

  useEffect(() => {
    try {
      bootstrapAuthAction?.();
    } catch (error) {
      console.error('❌ bootstrapAuthAction failed in App:', error);
    }
  }, [bootstrapAuthAction]);

  return (
    <>
      <ToastContainer />
      <RouterProvider router={router} />
    </>
  );
};

export default App;

