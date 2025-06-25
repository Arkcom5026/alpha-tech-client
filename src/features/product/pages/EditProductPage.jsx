// ✅ src/features/product/pages/EditProductPage.jsx

import { useEffect, useState, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import ProductForm from '../components/ProductForm';
import ProductImage from '../components/ProductImage';

import useProductStore from '../store/productStore';
import { useBranchStore } from '@/features/branch/store/branchStore';
import ProcessingDialog from '@/components/shared/dialogs/ProcessingDialog';

const EditProductPage = () => {
  const [previewUrls, setPreviewUrls] = useState([]);
  const [captions, setCaptions] = useState([]);
  const [coverIndex, setCoverIndex] = useState(null);
  const { id } = useParams();
  const branchId = useBranchStore((state) => state.selectedBranchId);
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const imageRef = useRef();
  const [oldImages, setOldImages] = useState([]);
  const hasFetched = useRef(false);
  const [cascadeReady, setCascadeReady] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { updateProduct, getProductById, deleteImage, fetchDropdownsAction, dropdownsLoaded } = useProductStore();

  useEffect(() => {
    if (!dropdownsLoaded && branchId) {
      fetchDropdownsAction(branchId);
    }
  }, [branchId, dropdownsLoaded]);

  useEffect(() => {
    if (!branchId || !id || hasFetched.current) return;
    hasFetched.current = true;

    const fetchData = async () => {
      try {
        const data = await getProductById(id);

        if (!data) {
          setError('ไม่พบข้อมูลสินค้า หรืออาจถูกลบไปแล้ว');
          return;
        }

        setProduct({
          ...data,
          images: Array.isArray(data.productImages) ? data.productImages : [],
        });

        setOldImages(Array.isArray(data.productImages) ? data.productImages : []);
        setCascadeReady(true); // ✅ เพิ่มบรรทัดนี้เพื่อให้ฟอร์ม reset dropdown
      } catch (err) {
        console.error('โหลดข้อมูลสินค้าล้มเหลว:', err);
        setError('ไม่สามารถโหลดข้อมูลสินค้าได้');
      }
    };

    fetchData();
  }, [id, branchId]);

  const mappedProduct = useMemo(() => {
    if (!product) return null;
    return {
      ...product,
      unitId: product.unitId?.toString() || '',
      productProfileId: product.productProfileId?.toString() || '',
      categoryId: product.categoryId?.toString() || '',
      productTypeId: product.productTypeId?.toString() || '',
      templateId: product.templateId?.toString() || '',
    };
  }, [product]);

  const handleUpdate = async (formData) => {
    setIsUpdating(true);

    try {
      const [uploadedImages, imagesToDelete] = await imageRef.current.upload();

      formData.images = uploadedImages;
      formData.imagesToDelete = imagesToDelete;

      for (const img of imagesToDelete) {
        if (!img) continue;
        try {
          await deleteImage({ productId: id, publicId: img });
        } catch (err) {
          console.warn('⚠️ ลบภาพไม่สำเร็จ:', err);
        }
      }

      await updateProduct(id, formData);
      setShowSuccess(true);
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

  return (
    <div className="max-w-3xl mx-auto">
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
        defaultValues={mappedProduct}
        onSubmit={handleUpdate}
        mode="edit"
        cascadeReady={cascadeReady && dropdownsLoaded}
        setCascadeReady={setCascadeReady}
      />

      <ProcessingDialog
        open={isUpdating || showSuccess}
        isLoading={isUpdating}
        message={isUpdating ? 'ระบบกำลังอัปเดตข้อมูล กรุณารอสักครู่...' : '✅ บันทึกข้อมูลเรียบร้อยแล้ว'}
        onClose={() => setShowSuccess(false)}
      />
    </div>
  );
};

export default EditProductPage;
