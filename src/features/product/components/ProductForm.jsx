
// ✅ src/features/product/components/ProductForm.jsx

import React, { useEffect, useRef, useCallback } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import _ from 'lodash';
import useProductStore from '../store/productStore';
import CascadingDropdowns from '@/components/shared/form/CascadingDropdowns';
import FormFields from './FormFields';
import ProcessingDialog from '@/components/shared/dialogs/ProcessingDialog';

const ProductForm = ({ onSubmit, defaultValues, mode }) => {
  const { dropdowns, fetchDropdowns, loadDropdowns, getProductDropdowns } = useProductStore();

  const hasReset = useRef(false);
  const prevDefaults = useRef(null);
  const [showDialog, setShowDialog] = React.useState(false);
  // โหมด strict สำหรับ CascadingDropdowns: create=true, edit=false แต่จะเป็น true เมื่อผู้ใช้เริ่มเปลี่ยนลำดับชั้น
  const [strict, setStrict] = React.useState(mode === 'create');
  useEffect(() => { setStrict(mode === 'create'); }, [mode]);

  const prepareDefaults = useCallback((data) => {
    // Helpers
    const byName = (list, name) => {
      if (!name) return '';
      const n = String(name).trim().toLowerCase();
      const arr = Array.isArray(list) ? list : [];
      const hit = arr.find((x) => String(x?.name ?? '').trim().toLowerCase() === n);
      return hit ? hit.id : '';
    };
    const _bp = data?.branchPrice?.[0] || data?.branchPrice || {};
    const branchPrice = {
      costPrice: _bp.costPrice ?? data?.costPrice ?? data?.cost ?? '',
      priceWholesale: _bp.priceWholesale ?? data?.priceWholesale ?? '',
      priceTechnician: _bp.priceTechnician ?? data?.priceTechnician ?? '',
      priceRetail: _bp.priceRetail ?? data?.priceRetail ?? '',
      priceOnline: _bp.priceOnline ?? data?.priceOnline ?? '',
    };

    // ---- seed ids จาก payload ----
    let catId = (data?.categoryId !== '' && data?.categoryId != null)
      ? data.categoryId
      : (data?.category?.id ?? data?.category_id ?? '');

    let typeId = (data?.productTypeId !== '' && data?.productTypeId != null)
      ? data.productTypeId
      : (data?.productType?.id ?? data?.typeId ?? data?.product_type_id ?? '');

    let profileId = (data?.productProfileId !== '' && data?.productProfileId != null)
      ? data.productProfileId
      : (data?.productProfile?.id ?? data?.profileId ?? data?.product_profile_id ?? '');

    let productTemplateId = (data?.productTemplateId !== '' && data?.productTemplateId != null)
      ? data.productTemplateId
      : (data?.productTemplate?.id ?? data?.productTemplateId ?? data?.product_template_id ?? data?.productTemplatedId ?? data?.product_templated_id ?? '');

    // ---- เพิ่ม fallback จากชื่อ (กรณี payload ไม่มี id) ----
    if (!catId) {
      catId = byName(dropdowns?.categories, data?.categoryName ?? data?.category?.name ?? data?.category_name);
    }
    if (!typeId) {
      typeId = byName(dropdowns?.productTypes, data?.productTypeName ?? data?.typeName ?? data?.productType?.name ?? data?.product_type_name);
    }
    if (!profileId) {
      const listProfiles = dropdowns?.productProfiles ?? dropdowns?.profiles;
      profileId = byName(listProfiles, data?.productProfileName ?? data?.profileName ?? data?.productProfile?.name ?? data?.product_profile_name);
    }
    if (!productTemplateId) {
      const listTemplates = dropdowns?.productTemplates ?? dropdowns?.templates;
      productTemplateId = byName(listTemplates, data?.productTemplateName ?? data?.templateName ?? data?.template?.name ?? data?.productTemplate?.name ?? data?.product_template_name);
    }

    // ---- เติมสายแม่จาก dropdowns ถ้าขาด ----
    const _types = Array.isArray(dropdowns?.productTypes) ? dropdowns.productTypes : [];
    const _profiles = Array.isArray(dropdowns?.productProfiles) ? dropdowns.productProfiles : (Array.isArray(dropdowns?.profiles) ? dropdowns.profiles : []);
    const _templates = Array.isArray(dropdowns?.productTemplates) ? dropdowns.productTemplates : (Array.isArray(dropdowns?.templates) ? dropdowns.templates : []);

    // จาก template → profile/type/category
    if (!profileId && productTemplateId) {
      const tpl = _templates.find((t) => String(t.id) === String(productTemplateId));
      if (tpl) {
        profileId = tpl.productProfileId ?? tpl.productProfile?.id ?? profileId;
        typeId = typeId || (tpl.productTypeId ?? tpl.productType?.id);
        catId = catId || (tpl.categoryId ?? tpl.category?.id);
      }
    }

    // จาก profile → type
    if (!typeId && profileId) {
      const pr = _profiles.find((p) => String(p.id) === String(profileId));
      if (pr) {
        typeId = pr.productTypeId ?? pr.productType?.id ?? typeId;
      }
    }

    // จาก type → category
    if (!catId && typeId) {
      const ty = _types.find((t) => String(t.id) === String(typeId));
      if (ty) {
        catId = ty.categoryId ?? ty.category?.id ?? catId;
      }
    }

    return {
      ...data,
      name: data?.name || '',
      model: data?.model ?? data?.modelName ?? data?.productModel ?? data?.series ?? data?.variant ?? '',
      categoryId: (catId === '' || catId == null) ? '' : Number(catId),
      productTypeId: (typeId === '' || typeId == null) ? '' : Number(typeId),
      productProfileId: (profileId === '' || profileId == null) ? '' : Number(profileId),
      productTemplateId: (productTemplateId === '' || productTemplateId == null) ? '' : Number(productTemplateId),
      mode: (data?.mode ? String(data.mode).toUpperCase() : (data?.noSN ? 'SIMPLE' : 'STRUCTURED')),
      noSN: !!data?.noSN,
      active: data?.active !== false,
      branchPrice: {
        costPrice: branchPrice.costPrice ?? '',
        priceWholesale: branchPrice.priceWholesale ?? '',
        priceTechnician: branchPrice.priceTechnician ?? '',
        priceRetail: branchPrice.priceRetail ?? '',
        priceOnline: branchPrice.priceOnline ?? '',
      },
      description: data?.description ?? data?.desc ?? data?.shortDescription ?? '',
      spec: data?.spec ?? data?.specification ?? data?.specs ?? data?.detailSpec ?? data?.technicalSpec ?? data?.remarkSpec ?? data?.spec_detail ?? '',
    };
  }, [dropdowns]);

  // Helper สำหรับ normalize ค่า select ให้เป็น string เสมอ
  const toStr = (v) => (v === '' || v == null ? '' : String(v));

  const methods = useForm({ mode: 'onChange', defaultValues: prepareDefaults(defaultValues || {}) });
  const {
    handleSubmit,
    register,
    formState: { isSubmitting, errors },
    control,
    setValue,
    watch,
    reset,
  } = methods;

  useEffect(() => {
    if (mode !== 'edit') return;
    const prepared = prepareDefaults(defaultValues || {});
    if (!_.isEqual(prepared, prevDefaults.current)) {
      reset(prepared);
      prevDefaults.current = prepared;
      hasReset.current = true;
    }
  }, [
    mode,
    defaultValues,
    dropdowns?.categories?.length,
    dropdowns?.productTypes?.length,
    dropdowns?.productProfiles?.length,
    dropdowns?.productTemplates?.length,
    dropdowns?.templates?.length,
    reset,
    prepareDefaults,
  ]);
  // 🔄 preload dropdowns ถ้ายังไม่พร้อม (รองรับชื่อ action ได้ทั้ง getProductDropdowns/fetchDropdowns/loadDropdowns)
  useEffect(() => {
    const ready =
      (dropdowns?.categories?.length || 0) > 0 ||
      (dropdowns?.productTypes?.length || 0) > 0 ||
      (dropdowns?.productProfiles?.length || 0) > 0 ||
      (dropdowns?.productTemplates?.length || 0) > 0 ||
      (dropdowns?.templates?.length || 0) > 0;
    const fetcher = getProductDropdowns || fetchDropdowns || loadDropdowns;
    if (!ready && typeof fetcher === 'function') {
      fetcher().catch(() => {});
    }
  }, [
    dropdowns?.categories?.length,
    dropdowns?.productTypes?.length,
    dropdowns?.productProfiles?.length,
    dropdowns?.productTemplates?.length,
    dropdowns?.templates?.length,
    getProductDropdowns,
    fetchDropdowns,
    loadDropdowns,
  ]);

  const handleFormSubmit = async (data) => {
    setShowDialog(true);
    const clean = _.omit(data || {}, ['initialQty']);
    await onSubmit(clean);
    setShowDialog(false);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <CascadingDropdowns
          dropdowns={dropdowns}
          strict={strict}
          value={{
            categoryId: toStr(watch('categoryId')),
            productTypeId: toStr(watch('productTypeId')),
            productProfileId: toStr(watch('productProfileId')),
            productTemplateId: toStr(watch('productTemplateId')),
          }}
          onChange={(partial) => {
            const currCat = toStr(watch('categoryId'));
            const currType = toStr(watch('productTypeId'));
            const currProf = toStr(watch('productProfileId'));
            const currTpl = toStr(watch('productTemplateId'));
            const eq = (a, b) => String(a ?? '') === String(b ?? '');

            if (Object.prototype.hasOwnProperty.call(partial, 'categoryId')) {
              const incoming = toStr(partial.categoryId);
              // ถ้าเลือกค่าเดิม ไม่ต้องเคลียร์ลูก
              if (eq(incoming, currCat)) {
                setValue('categoryId', incoming === '' ? '' : Number(incoming));
                return;
              }
              setValue('categoryId', incoming === '' ? '' : Number(incoming));
              setValue('productTypeId', '');
              setValue('productProfileId', '');
              setValue('productTemplateId', '');
              setStrict(true);
              return;
            }
            if (Object.prototype.hasOwnProperty.call(partial, 'productTypeId')) {
              const incoming = toStr(partial.productTypeId);
              if (eq(incoming, currType)) {
                setValue('productTypeId', incoming === '' ? '' : Number(incoming));
                return;
              }
              setValue('productTypeId', incoming === '' ? '' : Number(incoming));
              setValue('productProfileId', '');
              setValue('productTemplateId', '');
              setStrict(true);
              return;
            }
            if (Object.prototype.hasOwnProperty.call(partial, 'productProfileId')) {
              const incoming = toStr(partial.productProfileId);
              if (eq(incoming, currProf)) {
                setValue('productProfileId', incoming === '' ? '' : Number(incoming));
                return;
              }
              setValue('productProfileId', incoming === '' ? '' : Number(incoming));
              setValue('productTemplateId', '');
              setStrict(true);
              return;
            }
            if (Object.prototype.hasOwnProperty.call(partial, 'productTemplateId')) {
              const incoming = toStr(partial.productTemplateId);
              if (eq(incoming, currTpl)) {
                setValue('productTemplateId', incoming === '' ? '' : Number(incoming));
                return;
              }
              setValue('productTemplateId', incoming === '' ? '' : Number(incoming));
              return;
            }
            Object.entries(partial).forEach(([k, v]) => setValue(k, v ?? ''));
          }}
          placeholders={{
            category: '-- เลือกหมวดหมู่ --',
            type: '-- เลือกประเภทสินค้า --',
            profile: '-- เลือกรุ่น/ซีรีส์ (เช่น VIVO Y04) --',
            template: '-- เลือกสเปก/ตัวเลือก (เช่น 4GB/64GB) --',
          }}
          containerClassName="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
          selectClassName="w-full"
        />

        <div className="grid grid-cols-1 gap-6">
          <FormFields
            register={register}
            errors={errors}
            control={control}
            setValue={setValue}
            dropdowns={dropdowns}
            isEditMode={mode === 'edit'}
            defaultValues={prepareDefaults(defaultValues || {})}
            watch={watch}
            showInitialQty={false}
          />
        </div>

        <div className="flex justify-end border-t pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 rounded bg-blue-600 text-white font-semibold ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? 'กำลังบันทึก...' : mode === 'edit' ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้า'}
          </button>
        </div>
      </form>

      {showDialog && <ProcessingDialog message="กำลังบันทึกข้อมูลสินค้า..." />}
    </FormProvider>
  );
};

export default ProductForm;





