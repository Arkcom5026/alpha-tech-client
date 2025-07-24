import LoginPage from "@/features/auth/pages/LoginPage";
import RegisterPage from "@/features/auth/pages/RegisterPage";
import CartPage from "@/features/online/cart/pages/CartPage";
import PublicLayout from "@/features/online/layout/PublicLayout";
import CheckoutPage from "@/features/online/order/pages/CheckoutPage";
import HomeOnline from "@/features/online/pages/HomeOnline";
import ListOrderOnlinePage from "@/features/orderOnline/pages/ListOrderOnlinePage";
import OrderOnlineDetailPage from "@/features/orderOnline/pages/OrderOnlineDetailPage";
import PaymentOnlinePage from "@/features/paymentOnline/pages/PaymentOnlinePage";

const publicRoutes = {
  path: '/',
  element: <PublicLayout />,
  children: [
    { index: true, element: <HomeOnline /> },
    { path: 'checkout', element: <CheckoutPage /> },
    { path: 'cart', element: <CartPage /> },
    { path: '/login', element: <LoginPage /> },
    { path: '/register', element: <RegisterPage /> },
    { path: 'customers/orders', element: <ListOrderOnlinePage /> },
    { path: 'customers/orders/:id', element: <OrderOnlineDetailPage /> },
    { path: 'customers/payment/:id', element: <PaymentOnlinePage /> },
  ],
};

export default publicRoutes;
