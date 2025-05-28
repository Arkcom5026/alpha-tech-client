// ✅ src/features/product/pages/CreateProductPage.jsx

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductForm from '../components/ProductForm';
import ProductImage from '../components/ProductImage';
import { createProduct } from '../api/productApi';
import useEmployeeStore from '@/store/employeeStore';
import { uploadImagesFull } from '../api/productImagesApi';

const CreateProductPage = () => {
  const navigate = useNavigate();
  const branchId = useEmployeeStore((state) => state.branch?.id);
  const [error, setError] = useState('');

  const [oldImages, setOldImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [files, setFiles] = useState([]);
  const [captions, setCaptions] = useState([]);
  const [coverIndex, setCoverIndex] = useState(null);
  const [imagesToDelete, setImagesToDelete] = useState([]);

  const imageRef = useRef();

  const handleCreate = async (formData) => {
    try {
      if (!branchId) {
        setError('ไม่พบรหัสสาขา กรุณาเข้าสู่ระบบใหม่');
        return;
      }

      // 1. สร้างสินค้าใหม่แบบไม่ใส่ภาพก่อน
      const payload = {
        ...formData,
        branchId: branchId,
      };

      const created = await createProduct(payload);

      // 2. ดึง state จาก imageRef
      const { files, captions, coverIndex } = imageRef.current.getUploadState();

      // 3. อัปโหลดภาพ (แนบ productId)
      if (created?.id && files.length > 0) {
        await uploadImagesFull(created.id, files, captions, coverIndex);
      }

      navigate('/pos/products');
    } catch (err) {
      console.error('❌ สร้างสินค้าไม่สำเร็จ:', err);
      setError('เกิดข้อผิดพลาดในการบันทึกสินค้า');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">เพิ่มสินค้าใหม่</h2>
      {error && <p className="text-red-500 font-medium mb-2">{error}</p>}

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

      <ProductForm onSubmit={handleCreate} mode="create" />
    </div>

  );
};

export default CreateProductPage;
