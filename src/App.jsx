// src/App.jsx
import React, { useEffect, useState } from 'react';
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
  const authBootstrapState = useAuthStore((state) => state.authBootstrapState);
  const [bootstrapReady, setBootstrapReady] = useState(false);

  useEffect(() => {
    const promise = runInitialAuthBootstrapOnce(bootstrapAuthAction);
    if (promise) {
      promise.finally(() => setBootstrapReady(true));
    } else {
      // If bootstrap already completed synchronously, mark ready
      const state = useAuthStore.getState();
      if (state.authBootstrapState !== 'idle' && state.authBootstrapState !== 'loading') {
        setBootstrapReady(true);
      }
    }
  }, [bootstrapAuthAction]);

  // Also check if bootstrap already reached terminal state outside the effect
  useEffect(() => {
    if (!bootstrapReady) {
      const state = useAuthStore.getState();
      if (state.authBootstrapState !== 'idle' && state.authBootstrapState !== 'loading') {
        setBootstrapReady(true);
      }
    }
  }, [authBootstrapState, bootstrapReady]);

  // Bootstrap gate: wait until bootstrap reaches a terminal state before rendering RouterProvider
  if (!bootstrapReady) {
    return (
      <>
        <ToastContainer />
        <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            <p className="text-sm text-slate-500">กำลังตรวจสอบสถานะ...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ToastContainer />
      <RouterProvider router={router} />
    </>
  );
};

export default App;
