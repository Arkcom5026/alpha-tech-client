
// src/features/productProfile/pages/EditProductProfilePage.jsx
import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useProductProfileStore from '../store/productProfileStore';
import useProductStore from '@/features/product/store/productStore';
import ProductProfileForm from '../components/ProductProfileForm';

const LIST_PATH = '/pos/stock/profiles';

const EditProductProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

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
    if (!id) return;
    (async () => {
      try {
        const e = await fetchProfileById(Number(id));
        console.log('[EditProfile] entity =', e);
        if (!e) navigate(LIST_PATH);
      } catch (e) {
        console.error('[EditProfile] fetch error', e);
        navigate(LIST_PATH);
      }
    })();
    return () => clearCurrentAction();
  }, [id, fetchProfileById, clearCurrentAction, navigate]);

  const handleCancel = () => navigate(LIST_PATH);
  const handleSubmit = async (values) => {
    await updateProfile(Number(id), values);
    navigate(LIST_PATH);
  };

  if (isLoadingCurrent && !current) return <div className="p-4">กำลังโหลด...</div>;
  if (error) return <div className="p-4 text-red-600">{String(error)}</div>;
  if (!current) return <div className="p-4">ไม่พบข้อมูล</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">แก้ไขลักษณะสินค้า #{id}</h1>
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
