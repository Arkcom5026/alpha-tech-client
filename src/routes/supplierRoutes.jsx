// ✅ supplierRoutes.jsx
import EditSupplierPage from "@/features/supplier/pages/EditSupplierPage";
import ListSupplierPage from "@/features/supplier/pages/ListSupplierPage";
import SupplierFormPage from "@/features/supplier/pages/SupplierFormPage";
import ViewSupplierPage from "@/features/supplier/pages/ViewSupplierPage";

import { Navigate } from "react-router-dom";

const supplierRoutes = {
  path: "/pos/suppliers",
  children: [
    { index: true, element: <Navigate to="list" replace /> },
    { path: "list", element: <ListSupplierPage /> },
    { path: "create", element: <SupplierFormPage /> },
    { path: "edit/:id", element: <EditSupplierPage isEdit={true} /> },
    { path: 'view/:id', element: <ViewSupplierPage /> }
  ],
};

export default supplierRoutes;
