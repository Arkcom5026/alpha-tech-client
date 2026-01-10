// CreateProductTypePage.jsx
import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageHeader from '@/components/shared/layout/PageHeader';
import ProductTypeForm from '../components/ProductTypeForm';
import useProductTypeStore from '../store/productTypeStore';
import useProductProfileStore from '@/features/productProfile/store/productProfileStore';
import { useAuthStore } from '@/features/auth/store/authStore';

import { parseApiError } from '@/utils/uiHelpers';

const CreateProductTypePage = () => {
  const navigate = useNavigate();

  // ✅ Guard สิทธิ์ (P1-safe): canManageProductOrdering เป็น selector function
  const { isSuperAdmin, canManageProductOrdering } = useAuthStore();
  const canManage = useMemo(() => isSuperAdmin || canManageProductOrdering(), [isSuperAdmin, canManageProductOrdering]);

  const { createProductTypeAction, isSubmitting } = useProductTypeStore();

  // ✅ ใช้ข้อมูลจาก Cascading (dropdowns รวม) ที่โหลดมาแล้วใน store เดียว
  const { dropdowns } = useProductProfileStore();

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (formData) => {
    if (!canManage) return; // hard-stop safety
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

  if (!canManage) {
    return (
      <div className="p-6 w-full flex flex-col items-center">
        <div className="w-full max-w-3xl">
          <PageHeader title="เพิ่มประเภทสินค้าใหม่" />

          <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <div className="font-semibold">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</div>
            <div className="mt-1">เฉพาะผู้ดูแลระบบ (Admin) หรือ Super Admin เท่านั้นที่สามารถเพิ่ม/แก้ไขประเภทสินค้าได้</div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                onClick={() => navigate(-1)}
              >
                ย้อนกลับ
              </button>
              <Link
                className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100"
                to="/pos/stock/types"
              >
                กลับไปหน้ารายการ
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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




