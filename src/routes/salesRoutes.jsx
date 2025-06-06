import SalesDashboardPage from "@/features/pos/pages/sales/SalesDashboardPage";
import QuickSalePage from "@/features/sales/pages/QuickSalePage";




const salesRoutes = {
  path: '/pos/sales',

  children: [
    {
      index: true,
      element: <SalesDashboardPage />, // ✅ หน้า Dashboard ของ Sales
    },
    {
      path: 'quick-sale',
      children: [
        { index: true, element: <QuickSalePage />, },
 
       ]  
    },
  ]
};

export default salesRoutes;



