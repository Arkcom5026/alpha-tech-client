// ✅ src/features/productType/pages/EditProductTypePage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProductTypeForm from '../components/ProductTypeForm';
import PageHeader from '@/components/shared/layout/PageHeader';

import { parseApiError } from '@/utils/uiHelpers';
import useProductTypeStore from '../store/productTypeStore';

// มาตรฐานระบบ:
// - ห้ามใช้ dialog alert/processing (Standard #70) → แสดงข้อความในหน้าเพจเท่านั้น
// - เรียก API ผ่าน Store เท่านั้น (Standard #61)
// - ครอบ try...catch ทุกการทำงาน และใช้ parseApiError

const EditProductTypePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [formData, setFormData] = useState(null);
  const [isFetching, setIsFetching] = useState(true);

  const { fetchByIdAction, updateProductTypeAction, isSubmitting } = useProductTypeStore();

  // Load current data
  useEffect(() => {
    let mounted = true;
    (async () => {
      setIsFetching(true);
      setErrorMsg('');
      try {
        const data = await fetchByIdAction(Number(id));
        if (mounted) setFormData(data);
      } catch (err) {
        if (mounted) setErrorMsg(parseApiError(err) || 'ไม่สามารถโหลดข้อมูลประเภทสินค้าได้');
      } finally {
        if (mounted) setIsFetching(false);
      }
    })();
    return () => { mounted = false; };
  }, [id, fetchByIdAction]);

  const handleSubmit = async (payload) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await updateProductTypeAction(Number(id), payload);
      setSuccessMsg('อัปเดตประเภทสินค้าเรียบร้อยแล้ว');
      setTimeout(() => navigate('/pos/stock/types'), 600);
    } catch (err) {
      setErrorMsg(parseApiError(err) || 'ไม่สามารถอัปเดตประเภทสินค้าได้');
    }
  };

  return (
    <div className="p-6 w-full flex flex-col items-center">
      <div className="w-full max-w-3xl">
        <PageHeader title="แก้ไขประเภทสินค้า" />

        {/* Status Blocks */}
        {errorMsg && (
          <div className="mt-3 mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            {String(errorMsg)}
          </div>
        )}
        {successMsg && (
          <div className="mt-3 mb-4 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300">
            {successMsg}
          </div>
        )}

        <div className="border rounded-xl p-4 shadow-sm bg-white dark:bg-zinc-900">
          {isFetching && (
            <div className="text-sm text-zinc-600 dark:text-zinc-300">กำลังโหลดข้อมูล...</div>
          )}

          {!isFetching && formData && (
            <ProductTypeForm
              mode="edit"
              defaultValues={formData}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EditProductTypePage;
