import { useEffect, useRef } from 'react';

import { useBranchStore } from '@/features/branch/store/branchStore';
import { createLocalOperationalProductRuntimeApi } from '../api/productRuntimeApi';
import useProductStore from '../store/productStore';
import useProductCreateRuntimeStore from '../store/productCreateRuntimeStore';

const extractCreatedProduct = (response) => {
  if (!response) return null;
  if (response?.data && typeof response.data === 'object') return response.data;
  if (response?.product && typeof response.product === 'object') return response.product;
  if (response?.item && typeof response.item === 'object') return response.item;
  if (response?.id) return response;
  return null;
};

const useProductCreateRuntimeController = () => {
  const branchId = useBranchStore((state) => state.selectedBranchId);

  const {
    uploadImages,
    ensureDropdownsAction,
    fetchDropdownsAction,
    dropdownsLoaded,
    dropdowns,
    error: storeError,
  } = useProductStore();

  const runtime = useProductCreateRuntimeStore();
  const resetRuntime = useProductCreateRuntimeStore((state) => state.resetRuntime);
  const imageRef = useRef();
  const dropdownsFetchRef = useRef({ branchId: null, done: false });

  const productTypesReady =
    Array.isArray(dropdowns?.productTypes) && dropdowns.productTypes.length > 0;

  useEffect(() => {
    if (!branchId) return;

    Promise.resolve(fetchDropdownsAction?.(true)).catch(() => {});
  }, [branchId, fetchDropdownsAction]);

  useEffect(() => {
    return () => {
      resetRuntime();
    };
  }, [resetRuntime]);

  const handleCreate = async (formData) => {
    runtime.beginCreate();

    try {
      const payload = {
        ...formData,
        branchId,
      };

      const response = await createLocalOperationalProductRuntimeApi(payload);
      const created = extractCreatedProduct(response);

      if (!created?.id) {
        throw new Error('สร้างสินค้าแล้วแต่ไม่พบ productId สำหรับอัปโหลดรูปภาพ');
      }

      if (runtime.selectedFiles.length && typeof uploadImages === 'function') {
        await uploadImages(created.id, {
          files: runtime.selectedFiles,
          captions: runtime.captions,
          coverIndex: runtime.coverIndex,
        });
      }

      runtime.finishCreateSuccess(created);
    } catch (err) {
      runtime.finishCreateError(err?.message || 'เกิดข้อผิดพลาดในการบันทึกสินค้า');
    }
  };

  const handleStartNextCreate = () => {
    runtime.resetForNextCreate();

    if (imageRef.current && typeof imageRef.current.reset === 'function') {
      try {
        imageRef.current.reset();
      } catch (_) {}
    }
  };

  const retryLoadDropdowns = () =>
    Promise.resolve(fetchDropdownsAction?.(true)).catch(() => {});

  return {
    branchId,
    dropdownsLoaded,
    storeError,
    imageRef,
    runtime,
    handleCreate,
    handleStartNextCreate,
    retryLoadDropdowns,
  };
};

export default useProductCreateRuntimeController;
