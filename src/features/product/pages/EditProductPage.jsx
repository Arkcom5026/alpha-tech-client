// ✅ src/features/product/pages/EditProductPage.jsx

import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductForm from '../components/ProductForm';
import ProductImage from '../components/ProductImage';
import useEmployeeStore from '@/store/employeeStore';
import useProductStore from '../store/productStore';
import { deleteImageProduct } from '../api/productImagesApi';

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

  const { updateProduct, getProductById, deleteImage } = useProductStore();

  useEffect(() => {
    if (!branchId || !id) return;

    const fetchData = async () => {
      try {
        const data = await getProductById(id);

        if (!data) {
          setError('ไม่พบข้อมูลสินค้า หรืออาจถูกลบไปแล้ว');
          return;
        }

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

      formData.images = uploadedImages;
      formData.imagesToDelete = imagesToDelete;

      // ✅ ลบภาพเก่าออกจากระบบ (Cloudinary + DB)
      // for (const public_id of imagesToDelete) {
      //   try {
      //     console.log("🗑️ ลบภาพโดยตรง:", id, public_id); // ✅ ใช้ id ที่ถูกต้อง
      //     await deleteImageProduct(id, public_id); // ✅ ไม่ใช้ productId ที่ไม่รู้จัก
      //   } catch (err) {
      //     console.warn("⚠️ ลบภาพไม่สำเร็จ:", err);
      //   }
      // }

      for (const img of imagesToDelete) {
        if (!img.public_id) continue; // กัน null
      
        try {
          await deleteImage({ productId: id, publicId: img.public_id });
        } catch (err) {
          console.warn("⚠️ ลบภาพไม่สำเร็จ:", err);
        }
      }


      await updateProduct(id, formData);



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
          productId={product.id}
          deleteImage={deleteImage}
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
  
