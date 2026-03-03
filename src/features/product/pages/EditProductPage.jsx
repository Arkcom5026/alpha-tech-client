


// ✅ src/features/product/pages/EditProductPage.jsx

import { useEffect, useState, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import ProductForm from '../components/ProductForm';
import ProductImage from '../components/ProductImage';

import useProductStore from '../store/productStore';

const EditProductPage = () => {
  const [previewUrls, setPreviewUrls] = useState([]);
  const [captions, setCaptions] = useState([]);
  const [coverIndex, setCoverIndex] = useState(null);
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const imageRef = useRef();
  const [oldImages, setOldImages] = useState([]);
  const hasFetched = useRef(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [saveLocked, setSaveLocked] = useState(false);

  const { updateProduct, getProductById, deleteImage, ensureDropdownsAction, dropdownsLoaded } = useProductStore();

  // --- helpers ---
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
  



  useEffect(() => {
    if (!dropdownsLoaded) {
      ensureDropdownsAction();
    }
  }, [dropdownsLoaded, ensureDropdownsAction]);


  useEffect(() => {
    if (!id || hasFetched.current) return;
    hasFetched.current = true;

    const fetchData = async () => {
      try {
        const data = await getProductById(id);

        if (!data) {
          setError('ไม่พบข้อมูลสินค้า หรืออาจถูกลบไปแล้ว');
          return;
        }

        const serverImages = Array.isArray(data.images)
          ? data.images
          : Array.isArray(data.productImages)
          ? data.productImages
          : [];

        const images = normalizeImages(serverImages);

        setProduct({
          ...data,
          images,
        });

        setOldImages(images);
      } catch (err) {
        console.error('โหลดข้อมูลสินค้าล้มเหลว:', err);
        setError('ไม่สามารถโหลดข้อมูลสินค้าได้');
      }
    };

    fetchData();
  }, [id, getProductById]);

  const mappedProduct = useMemo(() => {
    if (!product) return null;

    // ✅ กำหนดโหมดแบบปลอดภัย (ไม่ไปยุ่งกับ Template)
    const resolveMode = (p) => {
      if (p?.mode) return p.mode; // ค่าจากเซิร์ฟเวอร์มีสิทธิ์สูงสุด
      if (typeof p?.noSN === 'boolean') return p.noSN ? 'SIMPLE' : 'STRUCTURED';
      if (p?.productTemplateId) return 'STRUCTURED';
      return 'SIMPLE';
    };

    return {
      ...product,
      mode: resolveMode(product),
      unitId: product.unitId ?? '',
      productProfileId: product.productProfileId ?? '',
      categoryId: product.categoryId ?? '',
      productTypeId: product.productTypeId ?? '',
      productTemplateId: product.productTemplateId ?? '',
    };
  }, [product]);

  const handleUpdate = async (formData) => {
    // ถ้าผู้ใช้กดบันทึกอีกครั้งหลังเคยบันทึกสำเร็จแล้ว ให้ปลดล็อกก่อน (กัน state ค้าง)
    if (saveLocked) setSaveLocked(false);

    setIsUpdating(true);

    // ✅ หากเลือก SIMPLE ให้ตัดการผูกกับ Template ออก (ระดับ Product เท่านั้น)
    if (formData?.mode === 'SIMPLE') {
      formData.productTemplateId = null;
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

      // ลบรูปเก่าที่ผู้ใช้ติ๊กเลือก
      for (const img of imagesToDelete) {
        if (img == null || img === '') continue;
      
        try {
          // ✅ ถ้าเป็นเลข ให้ส่งเป็น imageId (ตรงกับ BE ที่รองรับ imageId แล้ว)
          if (typeof img === 'number') {
            await deleteImage({ productId: id, imageId: img });
          } else {
            await deleteImage({ productId: id, publicId: img });
          }
        } catch (err) {
          console.warn('⚠️ ลบภาพไม่สำเร็จ:', err);
        }
      }
      

      // บันทึกสินค้า
      await updateProduct(id, formData);

      // 🔄 โหลดข้อมูลล่าสุดกลับมาโชว์
      try {
        const fresh = await getProductById(id);
        if (fresh) {
          const serverImages = Array.isArray(fresh.images)
            ? fresh.images
            : Array.isArray(fresh.productImages)
            ? fresh.productImages
            : [];
          const images = normalizeImages(serverImages);

          setProduct({
            ...fresh,
            images,
          });
          setOldImages(images);
        }
      } catch (e) {
        console.warn('⚠️ รีเฟรชข้อมูลสินค้าไม่สำเร็จหลังบันทึก:', e);
      }

      // เคลียร์สถานะไฟล์/พรีวิวชั่วคราว
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

      setShowSuccess(true);
      setSaveLocked(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error('อัปเดตข้อมูลสินค้าล้มเหลว:', err);
      setError('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
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
        // ✅ หลังบันทึกสำเร็จ ให้ disable ปุ่มบันทึก (จนกว่าจะมีการแก้ไขใหม่)
        submitDisabled={isUpdating || saveLocked}
        submitLabel={saveLocked ? 'บันทึกแล้ว' : undefined}
        onAnyChange={() => {
          if (saveLocked) setSaveLocked(false);
        }}
      />

      {/* ✅ Inline status (แทน dialog) */}
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







