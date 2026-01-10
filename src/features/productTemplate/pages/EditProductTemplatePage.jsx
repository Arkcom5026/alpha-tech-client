
// ✅ src/features/productTemplate/pages/EditProductTemplatePage.jsx
import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ProductTemplateForm from '../components/ProductTemplateForm';
import useProductTemplateStore from '../store/productTemplateStore';
import useProductStore from '@/features/product/store/productStore';
import { useAuthStore } from '@/features/auth/store/authStore';

import { useBranchStore } from '@/features/branch/store/branchStore';
import ProcessingDialog from '@/components/shared/dialogs/ProcessingDialog';
import PageHeader from '@/components/shared/layout/PageHeader';

const EditProductTemplatePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const selectedBranchId = useBranchStore((state) => state.selectedBranchId);

  // ✅ Guard สิทธิ์ (P1-safe): canManageProductOrdering เป็น selector function
  const { isSuperAdmin, canManageProductOrdering } = useAuthStore();
  const canManage = useMemo(
    () => isSuperAdmin || canManageProductOrdering(),
    [isSuperAdmin, canManageProductOrdering]
  );
  const [template, setTemplate] = useState(null);
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { getTemplateByIdAction: getTemplateById, updateTemplateAction: updateTemplate } = useProductTemplateStore();

  // dropdowns from productStore (single source of truth)
  const { ensureDropdownsAction, dropdowns, dropdownsLoaded } = useProductStore();
  const isDropdownLoading = !dropdownsLoaded;

  useEffect(() => {
    if (!canManage) return;

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
        console.error('โหลดข้อมูลสเปกสินค้า (SKU) ล้มเหลว:', err);
        setError('ไม่สามารถโหลดข้อมูลสเปกสินค้า (SKU) ได้');
      }
    };

    fetchData();
  }, [id, selectedBranchId, getTemplateById, canManage]);

  // ensure dropdowns are loaded for the cascading selects
  useEffect(() => {
    if (!canManage) return;
    try {
      ensureDropdownsAction?.();
    } catch (e) {
      console.error('[EditProductTemplatePage] ensureDropdownsAction error', e);
    }
  }, [ensureDropdownsAction, canManage]);

  const handleUpdate = async (formData) => {
    if (!canManage) return; // hard-stop safety
    try {
      setError('');
      setIsUpdating(true);

      // ✅ BE must enforce branch scope from JWT; FE must NOT send branchId
      await updateTemplate(id, formData);

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigate('/pos/stock/templates');
      }, 2000);
    } catch (err) {
      console.error('อัปเดตข้อมูลสเปกสินค้า (SKU) ล้มเหลว:', err);
      setError('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!canManage) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <PageHeader title={`แก้ไขสเปกสินค้า (SKU) #${id}`} />
        <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <div className="font-semibold">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</div>
          <div className="mt-1">เฉพาะผู้ดูแลระบบ (Admin) หรือ Super Admin เท่านั้นที่สามารถเพิ่ม/แก้ไขสเปกสินค้า (SKU) ได้</div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              onClick={() => navigate(-1)}
            >
              ย้อนกลับ
            </button>
            <Link
              className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100"
              to="/pos/stock/templates"
            >
              กลับไปหน้ารายการ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error) return <p className="text-red-500 font-medium">{error}</p>;
  if (!template) return <p>กำลังโหลดข้อมูล...</p>;

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader title={`แก้ไขสเปกสินค้า (SKU) #${id}`} />
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
        message={isUpdating ? 'ระบบกำลังอัปเดตข้อมูล กรุณารอสักครู่...' : '✅ บันทึกข้อมูลสเปกสินค้า (SKU) เรียบร้อยแล้ว'}
        onClose={() => setShowSuccess(false)}
      />
    </div>
  );
};

export default EditProductTemplatePage;





