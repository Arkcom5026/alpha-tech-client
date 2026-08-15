import * as React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './feedback.css';

export function FeedbackProvider() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={5000}
      limit={3}
      newestOnTop
      closeOnClick={false}
      pauseOnFocusLoss
      pauseOnHover
      draggable={false}
      theme="light"
      className="ads-toast-container"
      toastClassName="ads-toast"
    />
  );
}
