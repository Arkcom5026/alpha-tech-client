



// src/routes/publicRoutes.jsx

import LoginPage from "@/features/auth/pages/LoginPage";
import RegisterPage from "@/features/auth/pages/RegisterPage";
import ForgotPasswordPage from "@/features/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/features/auth/pages/ResetPasswordPage";
import CartPage from "@/features/online/cart/pages/CartPage";
import PublicLayout from "@/features/online/layout/PublicLayout";
import CheckoutPage from "@/features/online/order/pages/CheckoutPage";
import HomeOnline from "@/features/online/pages/HomeOnline";
import NoLayout from "@/layouts/NoLayout";
import ListOrderOnlinePage from "@/features/orderOnline/pages/ListOrderOnlinePage";
import OrderOnlineDetailPage from "@/features/orderOnline/pages/OrderOnlineDetailPage";
import PaymentOnlinePage from "@/features/paymentOnline/pages/PaymentOnlinePage";

const publicRoutes = [
  // 🔐 Auth routes (ต้องมาก่อน เพื่อไม่ให้โดน PublicLayout ทับ)
  {
    path: '/',
    element: <NoLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },
    ],
  },

  // 🌐 Online public routes
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomeOnline /> },
      { path: 'checkout', element: <CheckoutPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'customers/orders', element: <ListOrderOnlinePage /> },
      { path: 'customers/orders/:id', element: <OrderOnlineDetailPage /> },
      { path: 'customers/payment/:id', element: <PaymentOnlinePage /> },
    ],
  },
];

export default publicRoutes;

