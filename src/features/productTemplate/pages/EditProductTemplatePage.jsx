// ✅ src/features/productTemplate/pages/EditProductTemplatePage.jsx
import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductTemplateForm from '../components/ProductTemplateForm';
import ProductTemplateImage from '../components/ProductTemplateImage';
import useProductTemplateStore from '../store/productTemplateStore';

import apiClient from '@/utils/apiClient';
import { uploadImagesTempFull } from '../api/productTemplateImagesApi';
import { useBranchStore } from '@/features/branch/store/branchStore';

const EditProductTemplatePage = () => {
  const [previewUrls, setPreviewUrls] = useState([]);
  const [captions, setCaptions] = useState([]);
  const [coverIndex, setCoverIndex] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const selectedBranchId = useBranchStore((state) => state.selectedBranchId);
  const [template, setTemplate] = useState(null);
  const [error, setError] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const imageRef = useRef();
  const [oldImages, setOldImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);

  const { getTemplateById, updateTemplate } = useProductTemplateStore();

  useEffect(() => {
    if (!selectedBranchId) {
      setError('ไม่พบสาขา กรุณาเข้าสู่ระบบใหม่');
      return;
    }

    const fetchData = async () => {
      try {
        const data = await getTemplateById(id);

        const mapped = {
          ...data,
          unitId: data.unitId?.toString() || '',
          productProfileId: data.productProfileId?.toString() || '',
        };

        setTemplate({
          ...mapped,
          images: Array.isArray(data.templateImages) ? data.templateImages : [],
        });

        setOldImages(Array.isArray(data.templateImages) ? data.templateImages : []);
      } catch (err) {
        console.error('โหลดข้อมูลรูปแบบสินค้าล้มเหลว:', err);
        setError('ไม่สามารถโหลดข้อมูลรูปแบบสินค้าได้');
      }
    };

    fetchData();
  }, [id, selectedBranchId, getTemplateById]);

  const handleUpdate = async (formData) => {
    try {
      const branchIdParsed = parseInt(selectedBranchId);
      if (isNaN(branchIdParsed)) {
        setError('ไม่พบรหัสสาขา');
        return;
      }
      formData.branchId = branchIdParsed;

      if (imagesToDelete.length > 0) {
        for (const public_id of imagesToDelete) {
          console.log('🗑️ กำลังลบภาพ public_id:', public_id);
          await apiClient.delete(`/product-templates/${id}/images/delete`, {
            params: { public_id },
          });
        }
      }

      const safeCaptions = Array.isArray(captions) ? captions : selectedFiles.map(() => '');
      const safeCoverIndex = Number.isInteger(coverIndex) ? coverIndex : 0;

      const uploadedImages = await uploadImagesTempFull(id, selectedFiles, safeCaptions, safeCoverIndex);

      formData.images = uploadedImages;
      formData.imagesToDelete = imagesToDelete;

      console.log('📤 formData ที่จะส่งไปยัง backend:', formData);
      await updateTemplate(id, formData);
      navigate('/pos/stock/templates');
    } catch (err) {
      console.error('อัปเดตข้อมูลรูปแบบสินค้าล้มเหลว:', err);
      setError('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  if (error) return <p className="text-red-500 font-medium">{error}</p>;
  if (!template) return <p>กำลังโหลดข้อมูล...</p>;

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">แก้ไขรูปแบบสินค้า</h2>

      <div className="mb-6">
        <ProductTemplateImage
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
          imagesToDelete={imagesToDelete}
          setImagesToDelete={setImagesToDelete}
        />
      </div>

      <ProductTemplateForm
        defaultValues={template}
        onSubmit={handleUpdate}
        mode="edit"
      />
    </div>
  );
};

export default EditProductTemplatePage;
