// src/App.jsx
import React, { useEffect } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// เชื่อมต่อตรงเข้าหาผังเมืองหลักพิกัดใหม่ที่สะอาดที่สุด
import AppRouter from './routes/AppRouter';

const router = createBrowserRouter(AppRouter);

let initialAuthBootstrapPromise = null;
let initialAuthBootstrapStarted = false;

const runInitialAuthBootstrapOnce = (bootstrapAuthAction) => {
  if (initialAuthBootstrapStarted || initialAuthBootstrapPromise) {
    return initialAuthBootstrapPromise;
  }

  initialAuthBootstrapStarted = true;
  initialAuthBootstrapPromise = Promise.resolve()
    .then(() => bootstrapAuthAction?.())
    .catch((error) => {
      console.error('❌ bootstrapAuthAction failed in App:', error);
    })
    .finally(() => {
      initialAuthBootstrapPromise = null;
    });

  return initialAuthBootstrapPromise;
};

const App = () => {
  const bootstrapAuthAction = useAuthStore((state) => state.bootstrapAuthAction);

  useEffect(() => {
    runInitialAuthBootstrapOnce(bootstrapAuthAction);
  }, [bootstrapAuthAction]);

  return (
    <>
      <ToastContainer />
      <RouterProvider router={router} />
    </>
  );
};

export default App;
