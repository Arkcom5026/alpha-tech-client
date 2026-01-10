
// src/features/productProfile/pages/EditProductProfilePage.jsx
import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useProductProfileStore from '../store/productProfileStore';
import { useAuthStore } from '@/features/auth/store/authStore';
import useProductStore from '@/features/product/store/productStore';
import ProductProfileForm from '../components/ProductProfileForm';

const LIST_PATH = '/pos/stock/profiles';

const EditProductProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // ✅ Guard สิทธิ์ (P1-safe): canManageProductOrdering เป็น selector function
  const { isSuperAdmin, canManageProductOrdering } = useAuthStore();
  const canManage = useMemo(
    () => isSuperAdmin || canManageProductOrdering(),
    [isSuperAdmin, canManageProductOrdering]
  );

  const {
    current,
    isLoadingCurrent,
    error,
    fetchProfileById,
    updateProfile,
    clearCurrentAction,
  } = useProductProfileStore();
  const { ensureDropdownsAction, dropdowns, dropdownsLoaded } = useProductStore();
  const isDropdownLoading = !dropdownsLoaded;

  useEffect(() => { ensureDropdownsAction?.(); }, [ensureDropdownsAction]);

  useEffect(() => {
    if (!canManage) return;
    if (!id) return;
    (async () => {
      try {
        const e = await fetchProfileById(Number(id));
        console.log('[EditProductProfile] entity =', e);
        if (!e) navigate(LIST_PATH);
      } catch (e) {
        console.error('[EditProductProfile] fetch error', e);
        navigate(LIST_PATH);
      }
    })();
    return () => clearCurrentAction();
  }, [id, fetchProfileById, clearCurrentAction, navigate, canManage]);

  const handleCancel = () => navigate(LIST_PATH);
  const handleSubmit = async (values) => {
    if (!canManage) return; // hard-stop safety
    await updateProfile(Number(id), values);
    navigate(LIST_PATH);
  };

  if (!canManage) {
    return (
      <div className="p-6 w-full flex flex-col items-center">
        <div className="w-full max-w-3xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-semibold">แก้ไขแบรนด์</h1>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">เฉพาะผู้ดูแลระบบ (Admin) หรือ Super Admin เท่านั้น</p>
            </div>
            <Link to={LIST_PATH} className="btn btn-outline">ย้อนกลับ</Link>
          </div>

          <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <div className="font-semibold">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</div>
            <div className="mt-1">ไม่สามารถแก้ไขแบรนด์ได้ในบัญชีนี้</div>
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
                to={LIST_PATH}
              >
                กลับไปหน้ารายการ
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoadingCurrent && !current) return <div className="p-4">กำลังโหลด...</div>;
  if (error) return <div className="p-4 text-red-600">{String(error)}</div>;
  if (!current) return <div className="p-4">ไม่พบข้อมูล</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold">แก้ไขแบรนด์ #{id}</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            แบรนด์ = ชื่อรุ่น/ตระกูลสินค้าที่ใช้ขาย (ไม่ใช่สเปก/สี) เช่น VIVO Y04, iPhone 13
          </p>
        </div>
        <Link to={LIST_PATH} className="btn btn-outline">ย้อนกลับ</Link>
      </div>

      <div className="bg-white dark:bg-zinc-900 shadow rounded-2xl p-4">
        <ProductProfileForm
          mode="edit"
          defaultValues={current}
          dropdowns={dropdowns}
          isDropdownLoading={isDropdownLoading}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default EditProductProfilePage;




