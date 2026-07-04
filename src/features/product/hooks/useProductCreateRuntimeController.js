import { useEffect, useRef } from 'react';

import { useBranchStore } from '@/features/branch/store/branchStore';
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
    createLocalOperationalProductAction,
    uploadImages,
    ensureDropdownsAction,
    dropdownsLoaded,
    error: storeError,
  } = useProductStore();

  const runtime = useProductCreateRuntimeStore();
  const resetRuntime = useProductCreateRuntimeStore((state) => state.resetRuntime);
  const imageRef = useRef();
  const dropdownsFetchRef = useRef({ branchId: null, done: false });

  useEffect(() => {
    if (!branchId) return;
    if (dropdownsLoaded === true) return;

    if (dropdownsFetchRef.current.branchId !== branchId) {
      dropdownsFetchRef.current = { branchId, done: false };
    }

    if (dropdownsFetchRef.current.done) return;
    dropdownsFetchRef.current.done = true;

    Promise.resolve(ensureDropdownsAction?.()).catch(() => {});
  }, [branchId, dropdownsLoaded, ensureDropdownsAction]);

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

      if (typeof createLocalOperationalProductAction !== 'function') {
        throw new Error('ยังไม่พบ Runtime Create Action สำหรับสร้างสินค้าในสาขา');
      }

      const response = await createLocalOperationalProductAction(payload);
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

  const retryLoadDropdowns = () => Promise.resolve(ensureDropdownsAction?.()).catch(() => {});

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
