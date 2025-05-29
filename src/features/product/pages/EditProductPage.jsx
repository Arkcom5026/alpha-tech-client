// ✅ src/features/product/pages/EditProductPage.jsx

import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductForm from '../components/ProductForm';
import ProductImage from '../components/ProductImage';
import { updateProduct } from '../api/productApi';
import useEmployeeStore from '@/store/employeeStore';
import apiClient from '@/utils/apiClient';
import { uploadImagesProductFull } from '../api/productImagesApi';
import { getProductDropdowns } from '../api/productApi';

const EditProductPage = () => {
  const [previewUrls, setPreviewUrls] = useState([]);
  const [captions, setCaptions] = useState([]);
  const [coverIndex, setCoverIndex] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const branchId = useEmployeeStore((state) => state.branch?.id);
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const imageRef = useRef();
  const [oldImages, setOldImages] = useState([]);

  useEffect(() => {
    if (!branchId) {
      setError('ไม่พบ branchId โปรดล็อกอินใหม่');
      return;
    }

    const fetchData = async () => {
      try {
        const dropdownData = await getProductDropdowns(branchId, id);
        const data = dropdownData.defaultValues;

        const mapped = {
          ...data,
          unitId: data.unitId?.toString() || '',
          productProfileId: data.productProfileId?.toString() || '',
          categoryId: data.categoryId?.toString() || '',
          productTypeId: data.productTypeId?.toString() || '',
          templateId: data.templateId?.toString() || '',
        };

        setProduct({
          ...mapped,
          images: Array.isArray(data.productImages) ? data.productImages : [],
        });

        setOldImages(Array.isArray(data.productImages) ? data.productImages : []);
      } catch (err) {
        console.error('โหลดข้อมูลสินค้าล้มเหลว:', err);
        setError('ไม่สามารถโหลดข้อมูลสินค้าได้');
      }
    };

    fetchData();
  }, [id, branchId]);

  const handleUpdate = async (formData) => {
    formData.branchId = branchId;

    try {
      const [uploadedImages, imagesToDelete] = await imageRef.current.upload();

      if (imagesToDelete.length > 0) {
        for (const public_id of imagesToDelete) {
          console.log('🗑️ กำลังลบภาพ public_id:', public_id);
          await apiClient.delete(`/products/${id}/images/delete`, {
          params: { public_id },
        });
        }
      }

      formData.images = uploadedImages;
      formData.imagesToDelete = imagesToDelete;

      console.log('📤 formData ที่จะส่งไปยัง backend:', formData);

      await updateProduct(id, formData, branchId);

      console.log('✅ อัปเดตข้อมูลสินค้าสำเร็จ:', uploadedImages);

      navigate('/pos/stock/products');
    } catch (err) {
      console.error('อัปเดตข้อมูลสินค้าล้มเหลว:', err);
      setError('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  if (error) return <p className="text-red-500 font-medium">{error}</p>;
  if (!product) return <p>กำลังโหลดข้อมูล...</p>;

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
        />
      </div>

      <ProductForm
        defaultValues={product}
        onSubmit={handleUpdate}
        mode="edit"
        branchId={branchId}
      />
    </div>
  );
};

export default EditProductPage;


