// ✅ CreateProductProfilePage — FULL VERSION (UI: โปรไฟล์สินค้า) — aligned with CreateProductTypePage
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PageHeader from '@/components/shared/layout/PageHeader';
import ProductProfileForm from '../components/ProductProfileForm';
import useProductProfileStore from '../store/productProfileStore';
import { useAuthStore } from '@/features/auth/store/authStore';

import { parseApiError } from '@/utils/uiHelpers';
import useProductStore from '@/features/product/store/productStore';

const LIST_PATH = '/pos/stock/profiles'; // โปรไฟล์สินค้า

const CreateProductProfilePage = () => {
  const navigate = useNavigate();

  // ✅ Guard สิทธิ์ (P1-safe): canManageProductOrdering เป็น selector function
  const { isSuperAdmin, canManageProductOrdering } = useAuthStore();
  const canManage = useMemo(
    () => isSuperAdmin || canManageProductOrdering(),
    [isSuperAdmin, canManageProductOrdering]
  );

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
    if (!canManage) return; // hard-stop safety
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
      setSuccessMsg('บันทึกโปรไฟล์สินค้าเรียบร้อยแล้ว');
      setTimeout(() => navigate(LIST_PATH), 600);
    } catch (err) {
      setErrorMsg(parseApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canManage) {
    return (
      <div className="p-6 w-full flex flex-col items-center">
        <div className="w-full max-w-3xl">
          <PageHeader title="เพิ่มโปรไฟล์สินค้าใหม่" />

        {/* BestLine guidance */}
        <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          <div className="font-semibold">โปรไฟล์สินค้า (Product Profile) ใช้เมื่อใด?</div>
          <ul className="mt-1 list-disc pl-5 space-y-1">
            <li>ใช้เมื่อสินค้าใน <span className="font-medium">ประเภทสินค้าเดียวกัน</span> มีรูปแบบ/แนวคิดการใช้งาน <span className="font-medium">ซ้ำจริง</span></li>
            <li><span className="font-medium">ไม่ใช่แบรนด์</span> และ <span className="font-medium">ไม่จำเป็นต้องมีทุกสินค้า</span></li>
            <li>ถ้าไม่ซ้ำ แนะนำให้บันทึกสเปกไว้ที่สินค้าโดยตรง (Product / productConfig)</li>
          </ul>
        </div>

          <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <div className="font-semibold">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</div>
            <div className="mt-1">เฉพาะผู้ดูแลระบบ (Admin) หรือ Super Admin เท่านั้นที่สามารถเพิ่ม/แก้ไขโปรไฟล์สินค้าได้</div>
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
                กลับไปหน้ารายการโปรไฟล์สินค้า
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
        <PageHeader title="เพิ่มโปรไฟล์สินค้าใหม่" />

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
            <Link to={LIST_PATH} className="btn btn-outline">กลับไปหน้ารายการโปรไฟล์สินค้า</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProductProfilePage;



