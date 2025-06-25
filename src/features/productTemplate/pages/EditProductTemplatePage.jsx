useEffect(() => {
  const ready =
    dropdowns?.categories?.length &&
    dropdowns?.productTypes?.length &&
    dropdowns?.productProfiles?.length &&
    defaultValues?.categoryId &&
    defaultValues?.productTypeId &&
    defaultValues?.productProfileId;

  console.log('🔍 ตรวจสอบ ready:', {
    categories: dropdowns?.categories?.length,
    productTypes: dropdowns?.productTypes?.length,
    productProfiles: dropdowns?.productProfiles?.length,
    defaultCategory: defaultValues?.categoryId,
    defaultType: defaultValues?.productTypeId,
    defaultProfile: defaultValues?.productProfileId,
    isCascadeReadyTriggered,
    ready,
  });
}, [dropdowns, defaultValues, isCascadeReadyTriggered]);

// ✅ src/features/productTemplate/pages/EditProductTemplatePage.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductTemplateForm from '../components/ProductTemplateForm';
import useProductTemplateStore from '../store/productTemplateStore';

import { useBranchStore } from '@/features/branch/store/branchStore';

const EditProductTemplatePage = () => {
const { id } = useParams();
const navigate = useNavigate();
const selectedBranchId = useBranchStore((state) => state.selectedBranchId);
const [template, setTemplate] = useState(null);
const [error, setError] = useState('');

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
        categoryId: data.productProfile?.productType?.categoryId?.toString() || '',
        productTypeId: data.productProfile?.productTypeId?.toString() || '',
      };

      setTemplate(mapped);
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

    console.log('📤 formData ที่จะส่งไปยัง backend:', formData);
    await updateTemplate(id, formData);
    navigate('/pos/stock/templates/:id');
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

    <ProductTemplateForm
      defaultValues={template}
      onSubmit={handleUpdate}
      mode="edit"
    />
  </div>
);
};

export default EditProductTemplatePage;
