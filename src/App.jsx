// src/App.jsx
import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { FeedbackProvider } from '@/design-system';

import AppRouter from './routes/AppRouter';

const router = createBrowserRouter(AppRouter);

const App = () => (
  <>
    <FeedbackProvider />
    <RouterProvider router={router} />
  </>
);

export default App;
