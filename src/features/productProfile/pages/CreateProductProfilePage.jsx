// ✅ CreateProductProfilePage — FULL VERSION (UI: แบรนด์) — aligned with CreateProductTypePage
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PageHeader from '@/components/shared/layout/PageHeader';
import ProductProfileForm from '../components/ProductProfileForm';
import useProductProfileStore from '../store/productProfileStore';

import { parseApiError } from '@/utils/uiHelpers';
import useProductStore from '@/features/product/store/productStore';

const LIST_PATH = '/pos/stock/profiles';

const CreateProductProfilePage = () => {
  const navigate = useNavigate();

  // ----- stores -----
  const { createProfile, createProfileAction } = useProductProfileStore();
  const createFn = createProfileAction || createProfile;

  // ใช้ dropdowns จาก productStore เพื่อส่งเข้า CascadingDropdowns ในฟอร์ม
  const pStore = useProductStore();
  const rawDropdowns = pStore?.dropdowns;
  const dropdownLoading = !pStore?.dropdownsLoaded;

  // Merge possible shapes from store into a single dropdowns object
  const mergedDropdowns = React.useMemo(() => {
    const s = pStore || {};
    const dd = rawDropdowns || {};
    const pickArr = (...xs) => xs.find((x) => Array.isArray(x)) || [];

    const categories = pickArr(
      dd.categories,
      dd.categoryList,
      dd.category_list,
      dd.data?.categories,
      dd.list?.categories,
      dd.categoriesList,
      dd.items?.categories,
      s.categories,
      s.categoryDropdowns,
    );
    const productTypes = pickArr(
      dd.productTypes,
      dd.productTypeList,
      dd.product_types,
      dd.types,
      dd.data?.productTypes,
      dd.list?.productTypes,
      dd.items?.productTypes,
      dd.list,
      s.productTypes,
      s.typeDropdowns,
      s.list,
    );
    return { categories, productTypes };
  }, [pStore, rawDropdowns]);

  const ensureDropdownsAction = pStore?.ensureDropdownsAction;

  // ----- UI state -----
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // โหลด dropdowns ครั้งเดียว (กันลูป และเงียบ warning exhaustive-deps)
  useEffect(() => {
    try { ensureDropdownsAction?.(); } catch (e) { console.error('dropdown load error', e); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (formData) => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);
    try {
      await createFn({
        name: (formData.name || '').trim(),
        description: (formData.description || '').trim(),
        categoryId: Number(formData.categoryId),
        productTypeId: Number(formData.productTypeId),
      });
      setSuccessMsg('บันทึกแบรนด์เรียบร้อยแล้ว');
      setTimeout(() => navigate(LIST_PATH), 600);
    } catch (err) {
      setErrorMsg(parseApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 w-full flex flex-col items-center">
      <div className="w-full max-w-3xl">
        <PageHeader title="เพิ่มแบรนด์ใหม่" />

        {errorMsg && (
          <div className="mt-3 mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
            {String(errorMsg)}
          </div>
        )}
        {successMsg && (
          <div className="mt-3 mb-4 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
            {successMsg}
          </div>
        )}

        <div className="border rounded-xl p-4 shadow-sm bg-white dark:bg-zinc-900">
          <ProductProfileForm
            dropdowns={mergedDropdowns}
            isDropdownLoading={dropdownLoading}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />

          <div className="flex justify-between mt-4">
            <Link to={LIST_PATH} className="btn btn-outline">ย้อนกลับ</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProductProfilePage;




