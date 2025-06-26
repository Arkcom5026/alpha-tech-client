// ✅ src/features/productTemplate/pages/EditProductTemplatePage.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductTemplateForm from '../components/ProductTemplateForm';
import useProductTemplateStore from '../store/productTemplateStore';

import { useBranchStore } from '@/features/branch/store/branchStore';
import ProcessingDialog from '@/components/shared/dialogs/ProcessingDialog';

const EditProductTemplatePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const selectedBranchId = useBranchStore((state) => state.selectedBranchId);
  const [template, setTemplate] = useState(null);
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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

      setIsUpdating(true);
      await updateTemplate(id, formData);
      setIsUpdating(false);
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        navigate('/pos/stock/templates');
      }, 2000);
    } catch (err) {
      console.error('อัปเดตข้อมูลรูปแบบสินค้าล้มเหลว:', err);
      setError('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      setIsUpdating(false);
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

      <ProcessingDialog
        open={isUpdating || showSuccess}
        isLoading={isUpdating}
        message={isUpdating ? 'ระบบกำลังอัปเดตข้อมูล กรุณารอสักครู่...' : '✅ บันทึกข้อมูลเรียบร้อยแล้ว'}
        onClose={() => setShowSuccess(false)}
      />
    </div>
  );
};

export default EditProductTemplatePage;
