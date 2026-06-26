// src/App.jsx
import React, { useEffect } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// เชื่อมต่อตรงเข้าหาผังเมืองหลักพิกัดใหม่ที่สะอาดที่สุด
import AppRouter from './routes/AppRouter';

const router = createBrowserRouter(AppRouter);

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