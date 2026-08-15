// src/App.jsx
import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import AppRouter from './routes/AppRouter';
import { FeedbackProvider } from '@/design-system/feedback';

const router = createBrowserRouter(AppRouter);

let initialAuthBootstrapPromise = null;
let initialAuthBootstrapStarted = false;

const PUBLIC_UNAUTHENTICATED_EXACT_PATHS = new Set([
  '/',
  '/login',
  '/partner-portal',
  '/partner-portal/apply',
  '/partner-portal/forgot-password',
  '/partner-portal/reset-password',
]);

const PUBLIC_UNAUTHENTICATED_PATH_PREFIXES = [
  '/repair/track/',
];

const PUBLIC_STOREFRONT_SLUG_PATTERN = /^\/[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PUBLIC_STOREFRONT_RESERVED_SLUGS = new Set([
  'api',
  'login',
  'partner-portal',
  'marketplace-portal',
  'repair',
]);

const normalizePathname = (pathname) => (
  String(pathname || '/').replace(/\/+$/, '') || '/'
);

const isPublicUnauthenticatedPath = (pathname) => {
  const normalizedPath = normalizePathname(pathname);

  return (
    PUBLIC_UNAUTHENTICATED_EXACT_PATHS.has(normalizedPath) ||
    PUBLIC_UNAUTHENTICATED_PATH_PREFIXES.some((prefix) => normalizedPath.startsWith(prefix)) ||
    (PUBLIC_STOREFRONT_SLUG_PATTERN.test(normalizedPath) &&
      !PUBLIC_STOREFRONT_RESERVED_SLUGS.has(normalizedPath.slice(1)))
  );
};

const hasRecoverableSessionEvidence = (state) => Boolean(
  state?.accessToken ||
  state?.token ||
  state?.session ||
  state?.rememberMe,
);

const settlePublicUnauthenticatedBootstrap = () => {
  useAuthStore.setState({
    authChecked: true,
    isBootstrappingAuth: false,
    authBootstrapState: 'unauthenticated',
    authError: null,
  });
};

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
    const state = useAuthStore.getState();
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';

    if (isPublicUnauthenticatedPath(pathname) && !hasRecoverableSessionEvidence(state)) {
      settlePublicUnauthenticatedBootstrap();
      setBootstrapReady(true);
      return;
    }

    const promise = runInitialAuthBootstrapOnce(bootstrapAuthAction);
    if (promise) {
      promise.finally(() => setBootstrapReady(true));
    } else {
      const latestState = useAuthStore.getState();
      if (latestState.authBootstrapState !== 'idle' && latestState.authBootstrapState !== 'loading') {
        setBootstrapReady(true);
      }
    }
  }, [bootstrapAuthAction]);

  useEffect(() => {
    if (!bootstrapReady) {
      const state = useAuthStore.getState();
      if (state.authBootstrapState !== 'idle' && state.authBootstrapState !== 'loading') {
        setBootstrapReady(true);
      }
    }
  }, [authBootstrapState, bootstrapReady]);

  if (!bootstrapReady) {
    return (
      <FeedbackProvider>
        <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
            <p className="text-sm text-slate-500">กำลังตรวจสอบสถานะ...</p>
          </div>
        </div>
      </FeedbackProvider>
    );
  }

  return (
    <FeedbackProvider>
      <RouterProvider router={router} />
    </FeedbackProvider>
  );
};

export default App;
