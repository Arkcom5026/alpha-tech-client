import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PageHeader from '@/components/shared/layout/PageHeader';
import { feedback } from '@/design-system/feedback';
import { useAuthStore } from '@/features/auth/store/authStore';
import useProductStore from '@/features/product/store/productStore';
import ProductProfileForm from '../components/ProductProfileForm';
import useProductProfileStore from '../store/productProfileStore';

const CreateProductProfilePage = () => {
  const { shopSlug } = useParams();
  const navigate = useNavigate();
  const listPath = `/${shopSlug}/pos/stock/profiles`;

  const { isSuperAdmin, canManageProductOrdering } = useAuthStore();
  const canManage = useMemo(
    () => isSuperAdmin || canManageProductOrdering(),
    [isSuperAdmin, canManageProductOrdering],
  );

  const { createProfileAction, isSubmitting } = useProductProfileStore();
  const productStore = useProductStore();
  const rawDropdowns = productStore?.dropdowns;
  const dropdownLoading = !productStore?.dropdownsLoaded;
  const ensureDropdownsAction = productStore?.ensureDropdownsAction;
  const [errorMsg, setErrorMsg] = useState('');

  const mergedDropdowns = useMemo(() => {
    const store = productStore || {};
    const dropdowns = rawDropdowns || {};
    const pickArray = (...values) => values.find((value) => Array.isArray(value)) || [];

    return {
      categories: pickArray(
        dropdowns.categories,
        dropdowns.categoryList,
        dropdowns.category_list,
        dropdowns.data?.categories,
        dropdowns.list?.categories,
        dropdowns.categoriesList,
        dropdowns.items?.categories,
        store.categories,
        store.categoryDropdowns,
      ),
      productTypes: pickArray(
        dropdowns.productTypes,
        dropdowns.productTypeList,
        dropdowns.product_types,
        dropdowns.types,
        dropdowns.data?.productTypes,
        dropdowns.list?.productTypes,
        dropdowns.items?.productTypes,
        dropdowns.list,
        store.productTypes,
        store.typeDropdowns,
        store.list,
      ),
    };
  }, [productStore, rawDropdowns]);

  useEffect(() => {
    Promise.resolve(ensureDropdownsAction?.()).catch((error) => {
      feedback.actionError(error, 'โหลดตัวเลือกโปรไฟล์สินค้าไม่สำเร็จ', 'product-profile:create:dropdowns:error');
    });
  }, [ensureDropdownsAction]);

  const handleSubmit = async (formData) => {
    if (!canManage || isSubmitting) return;
    setErrorMsg('');

    try {
      await createProfileAction({
        name: (formData.name || '').trim(),
        description: (formData.description || '').trim(),
        categoryId: Number(formData.categoryId),
        productTypeId: Number(formData.productTypeId),
      });
      feedback.actionSuccess('บันทึกโปรไฟล์สินค้าเรียบร้อยแล้ว', 'product-profile:create:success');
      navigate(listPath);
    } catch (error) {
      const message = error?.response?.data?.error?.message || error?.response?.data?.message || error?.message || 'บันทึกโปรไฟล์สินค้าไม่สำเร็จ';
      setErrorMsg(message);
      feedback.actionError(error, 'บันทึกโปรไฟล์สินค้าไม่สำเร็จ', 'product-profile:create:error');
    }
  };

  if (!canManage) {
    return (
      <div className="p-6 w-full flex flex-col items-center">
        <div className="w-full max-w-3xl">
          <PageHeader title="เพิ่มโปรไฟล์สินค้าใหม่" />
          <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <div className="font-semibold">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</div>
            <div className="mt-1">เฉพาะผู้ดูแลระบบหรือ Super Admin เท่านั้นที่สามารถเพิ่มโปรไฟล์สินค้าได้</div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700" onClick={() => navigate(-1)}>ย้อนกลับ</button>
              <Link className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700" to={listPath}>กลับไปหน้ารายการโปรไฟล์สินค้า</Link>
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
        <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          ใช้โปรไฟล์สินค้าเมื่อสินค้าประเภทเดียวกันมีรูปแบบการใช้งานซ้ำจริง เพื่อช่วยให้การกรอกข้อมูลสม่ำเสมอ
        </div>
        {errorMsg && <div className="mt-3 mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">{errorMsg}</div>}
        <div className="mt-4 border rounded-xl p-4 shadow-sm bg-white dark:bg-zinc-900">
          <ProductProfileForm
            dropdowns={mergedDropdowns}
            isDropdownLoading={dropdownLoading}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
          <div className="flex justify-between mt-4">
            <Link to={listPath} className="btn btn-outline">กลับไปหน้ารายการโปรไฟล์สินค้า</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProductProfilePage;
