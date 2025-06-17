import PublicLayout from "@/features/online/layout/PublicLayout";
import CheckoutPage from "@/features/online/order/pages/CheckoutPage";
import HomeOnline from "@/features/online/pages/HomeOnline";

const publicRoutes = {
  path: '/',
  element: <PublicLayout />,
  children: [
    { index: true, element: <HomeOnline /> },
    { path: 'checkout', element: <CheckoutPage /> },
  ],
};

export default publicRoutes;
