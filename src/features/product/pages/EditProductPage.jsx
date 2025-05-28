// ✅ src/features/product/pages/EditProductPage.jsx
import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, updateProduct } from '../api/productApi';
import ProductForm from '../components/ProductForm';
import ProductImage from '../components/ProductImage';
import useEmployeeStore from '@/store/employeeStore';
import { uploadImagesFull } from '../api/productImagesApi';

export default function EditProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const branch = useEmployeeStore((state) => state.branch);

  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [oldImages, setOldImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [files, setFiles] = useState([]);
  const [captions, setCaptions] = useState([]);
  const [coverIndex, setCoverIndex] = useState(null);
  const [imagesToDelete, setImagesToDelete] = useState([]);

  const imageRef = useRef();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!branch?.id || !id) return;
      try {
        const data = await getProductById(id, branch.id);
        setProduct(data);

        // แยกภาพเก่าใส่ state
        setOldImages(data?.productImages || []);
        setCaptions(data?.productImages?.map(() => '') || []);
        setCoverIndex(data?.coverIndex ?? null);
      } catch (err) {
        setError('ไม่สามารถโหลดข้อมูลสินค้า');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, branch?.id]);

  const handleUpdate = async (formData) => {
    try {
      if (!branch?.id) {
        setError('ไม่พบรหัสสาขา กรุณาเข้าสู่ระบบใหม่');
        return;
      }

      const { files, captions, coverIndex, imagesToDelete } = imageRef.current.getUploadState();

      const payload = {
        ...formData,
        updatedByBranchId: branch.id,
        imagesToDelete,
      };

      const updated = await updateProduct(id, payload);

      if (files.length > 0) {
        await uploadImagesFull(updated.id, files, captions, coverIndex);
      }

      navigate('/pos/products');
    } catch (err) {
      console.error('❌ อัปเดตสินค้าไม่สำเร็จ:', err);
      setError('เกิดข้อผิดพลาดในการอัปเดตสินค้า');
    }
  };

  if (loading) return <p>กำลังโหลดข้อมูลสินค้า...</p>;
  if (!product) return null;

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-6">แก้ไขสินค้า</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
    

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">รูปภาพสินค้า</h3>
        <ProductImage
          ref={imageRef}
          oldImages={oldImages}
          setOldImages={setOldImages}
          previewUrls={previewUrls}
          setPreviewUrls={setPreviewUrls}
          files={files}
          setFiles={setFiles}
          captions={captions}
          setCaptions={setCaptions}
          coverIndex={coverIndex}
          setCoverIndex={setCoverIndex}
          imagesToDelete={imagesToDelete}
          setImagesToDelete={setImagesToDelete}
        />
      </div>

      <ProductForm mode="edit" defaultValues={product} onSubmit={handleUpdate} />
    </div>
  );
}
