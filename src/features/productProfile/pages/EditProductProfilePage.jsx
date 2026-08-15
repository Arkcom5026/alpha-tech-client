import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { feedback } from '@/design-system/feedback';
import { useAuthStore } from '@/features/auth/store/authStore';
import useProductStore from '@/features/product/store/productStore';
import ProductProfileForm from '../components/ProductProfileForm';
import useProductProfileStore from '../store/productProfileStore';

const EditProductProfilePage = () => {
  const { shopSlug, id } = useParams();
  const navigate = useNavigate();
  const listPath = `/${shopSlug}/pos/stock/profiles`;
  const [submitError, setSubmitError] = useState('');

  const { isSuperAdmin, canManageProductOrdering } = useAuthStore();
  const canManage = useMemo(
    () => isSuperAdmin || canManageProductOrdering(),
    [isSuperAdmin, canManageProductOrdering],
  );

  const {
    current,
    isLoadingCurrent,
    isSubmitting,
    error,
    fetchProfileByIdAction,
    updateProfileAction,
    clearCurrentAction,
  } = useProductProfileStore();
  const { ensureDropdownsAction, dropdowns, dropdownsLoaded } = useProductStore();

  useEffect(() => {
    Promise.resolve(ensureDropdownsAction?.()).catch((requestError) => {
      feedback.actionError(requestError, 'โหลดตัวเลือกโปรไฟล์สินค้าไม่สำเร็จ', 'product-profile:edit:dropdowns:error');
    });
  }, [ensureDropdownsAction]);

  useEffect(() => {
    if (!canManage || !id) return undefined;
    let active = true;

    const load = async () => {
      try {
        const entity = await fetchProfileByIdAction(Number(id));
        if (active && !entity) navigate(listPath);
      } catch (requestError) {
        if (active) {
          feedback.actionError(requestError, 'โหลดโปรไฟล์สินค้าไม่สำเร็จ', 'product-profile:edit:load:error');
        }
      }
    };

    load();
    return () => {
      active = false;
      clearCurrentAction();
    };
  }, [canManage, clearCurrentAction, fetchProfileByIdAction, id, listPath, navigate]);

  const handleSubmit = async (values) => {
    if (!canManage || isSubmitting) return;
    setSubmitError('');

    try {
      await updateProfileAction(Number(id), values);
      feedback.actionSuccess('บันทึกการแก้ไขโปรไฟล์สินค้าเรียบร้อยแล้ว', 'product-profile:edit:success');
      navigate(listPath);
    } catch (requestError) {
      const message = requestError?.response?.data?.error?.message || requestError?.response?.data?.message || requestError?.message || 'บันทึกการแก้ไขโปรไฟล์สินค้าไม่สำเร็จ';
      setSubmitError(message);
      feedback.actionError(requestError, 'บันทึกการแก้ไขโปรไฟล์สินค้าไม่สำเร็จ', 'product-profile:edit:error');
    }
  };

  if (!canManage) {
    return (
      <div className="p-6 w-full flex flex-col items-center">
        <div className="w-full max-w-3xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-semibold">แก้ไขโปรไฟล์สินค้า</h1>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">เฉพาะผู้ดูแลระบบหรือ Super Admin เท่านั้น</p>
            </div>
            <Link to={listPath} className="btn btn-outline">กลับไปหน้ารายการ</Link>
          </div>
          <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">คุณไม่มีสิทธิ์แก้ไขโปรไฟล์สินค้าในบัญชีนี้</div>
        </div>
      </div>
    );
  }

  if (isLoadingCurrent && !current) return <div className="p-4">กำลังโหลด...</div>;
  if (error && !current) return <div className="p-4 text-red-600">{String(error)}</div>;
  if (!current) return <div className="p-4">ไม่พบข้อมูล</div>;

  return (
    <div className="p-6 w-full flex flex-col items-center">
      <div className="w-full max-w-3xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold">แก้ไขโปรไฟล์สินค้า #{id}</h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">โปรไฟล์สินค้าเป็นตัวช่วยจัดกลุ่มรูปแบบซ้ำภายในประเภทสินค้า และไม่จำเป็นต้องมีทุกสินค้า</p>
          </div>
          <Link to={listPath} className="btn btn-outline">กลับไปหน้ารายการ</Link>
        </div>

        {submitError && <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">{submitError}</div>}

        <div className="bg-white dark:bg-zinc-900 border shadow-sm rounded-xl p-4">
          <ProductProfileForm
            mode="edit"
            defaultValues={current}
            dropdowns={dropdowns}
            isDropdownLoading={!dropdownsLoaded}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            onCancel={() => navigate(listPath)}
          />
        </div>
      </div>
    </div>
  );
};

export default EditProductProfilePage;
