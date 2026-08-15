// ✅ src/features/product/pages/EditProductPage.jsx

import { useEffect, useState, useRef, useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { feedback } from '@/design-system';
import ProductForm from '../components/ProductForm';
import ProductImage from '../components/ProductImage';

import useProductStore from '../store/productStore';

const isTemplateRuntimeProduct = (product) => {
  if (!product) return false;
  if (product.isTemplateProduct === true) return true;
  if (product.isOperationalProduct === false) return true;
  if (String(product.templateBranchCode || '').toUpperCase() === 'T01') return true;
  if (Number(product.templateBranchId) === 1) return true;
  if (
    product.templateProductId != null &&
    product.id != null &&
    Number(product.templateProductId) === Number(product.id)
  ) {
    return true;
  }
  return false;
};

const normalizeImages = (imgs = []) =>
  imgs.map((it) => {
    const publicIdString =
      (typeof it?.public_id === 'string' && it.public_id) ||
      (typeof it?.publicId === 'string' && it.publicId) ||
      (typeof it?.cloudinaryPublicId === 'string' && it.cloudinaryPublicId) ||
      null;

    return {
      id: it?.id ?? it?._id ?? null,
      url: it?.url ?? it?.secure_url ?? it?.secureUrl ?? it?.src ?? '',
      caption: it?.caption ?? '',
      isCover: Boolean(it?.isCover),
      public_id: publicIdString,
      publicId: publicIdString,
    };
  });

const normalizeProductForEdit = (data) => {
  if (!data) return null;
  const serverImages = Array.isArray(data.images)
    ? data.images
    : Array.isArray(data.productImages)
      ? data.productImages
      : [];

  return {
    ...data,
    images: normalizeImages(serverImages),
  };
};

const EditProductPage = () => {
  const location = useLocation();
  const { id } = useParams();
  const routeProductId = Number(id);
  const routeSnapshot = location.state?.clonedProductSnapshot;
  const validRouteSnapshot =
    routeSnapshot &&
    Number.isFinite(routeProductId) &&
    Number(routeSnapshot?.id) === routeProductId &&
    !isTemplateRuntimeProduct(routeSnapshot)
      ? normalizeProductForEdit(routeSnapshot)
      : null;

  const [previewUrls, setPreviewUrls] = useState([]);
  const [captions, setCaptions] = useState([]);
  const [coverIndex, setCoverIndex] = useState(null);
  const [product, setProduct] = useState(validRouteSnapshot);
  const [error, setError] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const imageRef = useRef();
  const [oldImages, setOldImages] = useState(validRouteSnapshot?.images || []);
  const fetchedProductIdRef = useRef(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [saveLocked, setSaveLocked] = useState(false);

  const { updateProduct, getProductById, deleteImage, ensureDropdownsAction, dropdownsLoaded } = useProductStore();

  useEffect(() => {
    if (!dropdownsLoaded) {
      ensureDropdownsAction();
    }
  }, [dropdownsLoaded, ensureDropdownsAction]);

  useEffect(() => {
    if (!id) return;
    if (fetchedProductIdRef.current === String(id)) return;
    fetchedProductIdRef.current = String(id);

    setError('');

    const snapshot = location.state?.clonedProductSnapshot;
    if (
      snapshot &&
      Number(snapshot?.id) === Number(id) &&
      !isTemplateRuntimeProduct(snapshot)
    ) {
      const normalizedSnapshot = normalizeProductForEdit(snapshot);
      setProduct(normalizedSnapshot);
      setOldImages(normalizedSnapshot?.images || []);
    } else {
      setProduct(null);
      setOldImages([]);
    }

    const fetchData = async () => {
      try {
        const data = await getProductById(id);

        if (!data) {
          setError('ไม่พบข้อมูลสินค้า หรืออาจถูกลบไปแล้ว');
          return;
        }

        if (isTemplateRuntimeProduct(data)) {
          setError('ไม่สามารถแก้ไข Product Template ในหน้าสินค้าของสาขาได้');
          return;
        }

        const normalized = normalizeProductForEdit(data);
        setProduct(normalized);
        setOldImages(normalized?.images || []);
      } catch (err) {
        console.error('โหลดข้อมูลสินค้าล้มเหลว:', err);
        setError('ไม่สามารถโหลดข้อมูลสินค้าได้');
      }
    };

    fetchData();
  }, [id, getProductById, location.state]);

  const mappedProduct = useMemo(() => {
    if (!product) return null;

    const resolveMode = (p) => {
      if (p?.mode) return p.mode;
      if (typeof p?.noSN === 'boolean') return p.noSN ? 'SIMPLE' : 'STRUCTURED';
      if (p?.trackSerialNumber === true) return 'STRUCTURED';
      return 'SIMPLE';
    };

    return {
      ...product,
      mode: resolveMode(product),
      productTypeId: product.productTypeId ?? product.productType?.id ?? '',
      brandId: product.brandId ?? product.brand?.id ?? '',
      unitId: product.unitId ?? product.unit?.id ?? '',
      templateProductId: product.templateProductId ?? null,
    };
  }, [product]);

  const handleUpdate = async (formData) => {
    if (isUpdating) return;
    if (saveLocked) setSaveLocked(false);

    setIsUpdating(true);

    if (formData?.mode === 'SIMPLE') {
      formData.noSN = true;
      formData.trackSerialNumber = false;
    } else if (formData?.mode === 'STRUCTURED') {
      formData.noSN = false;
      formData.trackSerialNumber = true;
    }

    try {
      const result = await imageRef.current?.upload?.();
      const uploadedImages = Array.isArray(result?.[0]) ? result[0] : [];
      const imagesToDelete = Array.isArray(result?.[1]) ? result[1] : [];

      formData.images = uploadedImages;
      formData.imagesToDelete = imagesToDelete;

      for (const img of imagesToDelete) {
        if (img == null || img === '') continue;

        try {
          if (typeof img === 'number') {
            await deleteImage({ productId: id, imageId: img });
          } else {
            await deleteImage({ productId: id, publicId: img });
          }
        } catch (err) {
          console.warn('⚠️ ลบภาพไม่สำเร็จ:', err);
        }
      }

      await updateProduct(id, formData);

      try {
        const fresh = await getProductById(id);
        if (fresh && isTemplateRuntimeProduct(fresh)) {
          setError('ไม่สามารถแก้ไข Product Template ในหน้าสินค้าของสาขาได้');
          return;
        }
        if (fresh) {
          const normalized = normalizeProductForEdit(fresh);
          setProduct(normalized);
          setOldImages(normalized?.images || []);
        }
      } catch (e) {
        console.warn('⚠️ รีเฟรชข้อมูลสินค้าไม่สำเร็จหลังบันทึก:', e);
      }

      setSelectedFiles([]);
      setPreviewUrls([]);
      setCaptions([]);
      setCoverIndex(null);
      if (imageRef.current && typeof imageRef.current.reset === 'function') {
        try {
          imageRef.current.reset();
        } catch (e) {
          console.debug('imageRef.reset() skipped:', e);
        }
      }

      feedback.actionSuccess('บันทึกการแก้ไขสินค้าเรียบร้อยแล้ว', `product:edit:${id}:success`);
      setShowSuccess(true);
      setSaveLocked(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error('อัปเดตข้อมูลสินค้าล้มเหลว:', err);
      feedback.actionError(err, 'เกิดข้อผิดพลาดในการบันทึกข้อมูลสินค้า', `product:edit:${id}:error`);
    } finally {
      setIsUpdating(false);
    }
  };

  if (error) return <p className="text-red-500 font-medium">{error}</p>;
  if (!mappedProduct) return <p>กำลังโหลดข้อมูล...</p>;
  if (!dropdownsLoaded) return <p>กำลังโหลดรายการตัวเลือก...</p>;

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-8">
      <h2 className="text-xl font-bold mb-4">แก้ไขสินค้า</h2>

      <div className="mb-6">
        <ProductImage
          ref={imageRef}
          files={selectedFiles}
          setFiles={setSelectedFiles}
          previewUrls={previewUrls}
          setPreviewUrls={setPreviewUrls}
          captions={captions}
          setCaptions={setCaptions}
          coverIndex={coverIndex}
          setCoverIndex={setCoverIndex}
          oldImages={oldImages}
          setOldImages={setOldImages}
          productId={product?.id}
          deleteImage={deleteImage}
        />
      </div>

      <ProductForm
        key={`edit-form-${mappedProduct?.id || id}-${mappedProduct?.updatedAt || ''}`}
        defaultValues={mappedProduct}
        onSubmit={handleUpdate}
        mode="edit"
        submitDisabled={isUpdating || saveLocked}
        submitLabel={saveLocked ? 'บันทึกแล้ว' : undefined}
        onAnyChange={() => {
          if (saveLocked) setSaveLocked(false);
        }}
      />

      {(isUpdating || showSuccess) && (
        <div
          className={`mt-4 rounded-lg border px-4 py-3 text-sm font-medium ${
            isUpdating
              ? 'border-blue-200 bg-blue-50 text-blue-800'
              : 'border-green-200 bg-green-50 text-green-800'
          }`}
          role="status"
          aria-live="polite"
        >
          {isUpdating
            ? 'ระบบกำลังอัปเดตข้อมูล กรุณารอสักครู่...'
            : '✅ บันทึกข้อมูลเรียบร้อยแล้ว'}
        </div>
      )}
    </div>
  );
};

export default EditProductPage;
