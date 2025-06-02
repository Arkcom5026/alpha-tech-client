// ✅ src/features/productTemplate/pages/ListProductTemplatePage.jsx

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductTemplateTable from '../components/ProductTemplateTable';

import useProductTemplateStore from '../store/productTemplateStore';
import StandardActionButtons from '@/components/shared/buttons/StandardActionButtons';

const ListProductTemplatePage = () => {
  const { templates, fetchTemplates } = useProductTemplateStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return (
    <div className="p-6 w-full flex flex-col items-center">
      <div className="w-full max-w-6xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-zinc-800 dark:text-white">จัดการรูปแบบสินค้า</h1>
          <StandardActionButtons onAdd={() => navigate('/pos/stock/templates/create')} />
        </div>
        <ProductTemplateTable templates={templates} />
      </div>
    </div>
  );
};

export default ListProductTemplatePage;
