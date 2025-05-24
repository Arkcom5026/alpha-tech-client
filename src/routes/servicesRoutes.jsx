import ServicesDashboardPage from "@/features/pos/pages/services/ServicesDashboardPage";



const servicesRoutes = {
  
  path: '/pos/services',
    children: [
    { index: true,   element: <ServicesDashboardPage />,   },
    // เพิ่ม children routes เพิ่มเติมได้ที่นี่
  ],
};

export default servicesRoutes;
