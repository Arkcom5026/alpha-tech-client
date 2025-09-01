// CreateProductTypePage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/shared/layout/PageHeader';
import ProductTypeForm from '../components/ProductTypeForm';
import useProductTypeStore from '../store/productTypeStore';
import useProductProfileStore from '@/features/productProfile/store/productProfileStore';

import { parseApiError } from '@/utils/uiHelpers';

const CreateProductTypePage = () => {
  const navigate = useNavigate();
  const { createProductTypeAction, isSubmitting } = useProductTypeStore();

  // ✅ ใช้ข้อมูลจาก Cascading (dropdowns รวม) ที่โหลดมาแล้วใน store เดียว
  const { dropdowns } = useProductProfileStore();

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (formData) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await createProductTypeAction(formData);
      setSuccessMsg('บันทึกประเภทสินค้าเรียบร้อยแล้ว');
      setTimeout(() => navigate('/pos/stock/types'), 600);
    } catch (err) {
      setErrorMsg(parseApiError(err));
    }
  };

  return (
    <div className="p-6 w-full flex flex-col items-center">
      <div className="w-full max-w-3xl">
        <PageHeader title="เพิ่มประเภทสินค้าใหม่" />

        {errorMsg && <div className="mt-3 mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">{String(errorMsg)}</div>}
        {successMsg && <div className="mt-3 mb-4 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">{successMsg}</div>}

        <div className="border rounded-xl p-4 shadow-sm bg-white dark:bg-zinc-900">
          <ProductTypeForm
            mode="create"
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            dropdowns={dropdowns}               // ⬅️ ส่ง dropdowns ให้ฟอร์ม (ใช้ CascadingFilterGroup ภายในฟอร์ม)
          />
        </div>
      </div>
    </div>
  );
};

export default CreateProductTypePage;
