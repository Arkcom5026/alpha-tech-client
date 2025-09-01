// ✅ src/features/productTemplate/pages/EditProductTemplatePage.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ProductTemplateForm from '../components/ProductTemplateForm';
import useProductTemplateStore from '../store/productTemplateStore';
import useProductStore from '@/features/product/store/productStore';

import { useBranchStore } from '@/features/branch/store/branchStore';
import ProcessingDialog from '@/components/shared/dialogs/ProcessingDialog';
import PageHeader from '@/components/shared/layout/PageHeader';

const EditProductTemplatePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const selectedBranchId = useBranchStore((state) => state.selectedBranchId);
  const [template, setTemplate] = useState(null);
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { getTemplateByIdAction: getTemplateById, updateTemplateAction: updateTemplate } = useProductTemplateStore();

  // dropdowns from productStore (single source of truth)
  const { ensureDropdownsAction, dropdowns, dropdownsLoaded } = useProductStore();
  const isDropdownLoading = !dropdownsLoaded;

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

  // ensure dropdowns are loaded for the cascading selects
  useEffect(() => {
    try { ensureDropdownsAction?.(); } catch { /* noop */ }
  }, [ensureDropdownsAction]);

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
      <PageHeader title={`แก้ไขรูปแบบสินค้า #${id}`} />
      <div className="mb-3">
        <Link to="/pos/stock/templates" className="text-sm text-blue-600 hover:underline">ย้อนกลับ</Link>
      </div>

      <ProductTemplateForm
        defaultValues={template}
        dropdowns={dropdowns}
        isDropdownLoading={isDropdownLoading}
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
