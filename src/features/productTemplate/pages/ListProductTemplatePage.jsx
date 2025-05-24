
// ✅ src/features/productTemplate/pages/ListProductTemplatePage.jsx

import React, { useEffect } from 'react';
import ProductTemplateTable from '../components/ProductTemplateTable';
import { useProductTemplateStore } from '../store/productTemplateStore';

const ListProductTemplatePage = () => {
  const { templates, fetchTemplates } = useProductTemplateStore();

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">รายการรูปแบบสินค้า</h1>
        <button
          onClick={() => window.location.href = '/pos/stock/templates/create'}
          className="btn bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          ➕ เพิ่มรูปแบบสินค้า
        </button>
      </div>
      <ProductTemplateTable templates={templates} />
    </div>
  );
};

export default ListProductTemplatePage;
