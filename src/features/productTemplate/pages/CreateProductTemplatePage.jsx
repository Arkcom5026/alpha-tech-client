// ✅ src/features/productTemplate/pages/CreateProductTemplatePage.jsx

import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import ProductTemplateForm from '../components/ProductTemplateForm';
import useProductTemplateStore from '../store/productTemplateStore';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useBranchStore } from '@/features/branch/store/branchStore';
import ProcessingDialog from '@/components/shared/dialogs/ProcessingDialog';

const CreateProductTemplatePage = () => {
  const navigate = useNavigate();

  // ✅ Guard สิทธิ์ (P1-safe): canManageProductOrdering เป็น selector function
  const { isSuperAdmin, canManageProductOrdering } = useAuthStore();
  const canManage = useMemo(
    () => isSuperAdmin || canManageProductOrdering(),
    [isSuperAdmin, canManageProductOrdering]
  );
  const selectedBranchId = useBranchStore((state) => state.selectedBranchId);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { addTemplate } = useProductTemplateStore();

  const handleCreate = async (formData) => {
    if (!canManage) return; // hard-stop safety
    try {
      if (!selectedBranchId) {
        setError('ไม่พบสาขา กรุณาเลือกสาขาหรือเข้าสู่ระบบใหม่');
        return;
      }

      delete formData.unit;
      delete formData.templateImages;
      console.log('📋 ตรวจสอบ formData ก่อนส่ง:', formData);

      const productProfileIdParsed = parseInt(formData.productProfileId);
      const branchIdParsed = parseInt(selectedBranchId);

      // ✅ ใช้ branchIdParsed เฉพาะเพื่อ validate ว่า context สาขามีจริง (แต่ไม่ส่งไป BE)
      // ⚠️ P1 security baseline: FE ห้ามส่ง branchId ไปที่ API (ให้ BE อ่านจาก token)
      const unitIdParsed = formData.unitId ? parseInt(formData.unitId) : null;

      console.log('🧩 ตรวจสอบค่าที่แปลงแล้ว:', {
        productProfileIdParsed,
        branchIdParsed,
        unitIdParsed,
      });

      if (isNaN(productProfileIdParsed) || isNaN(branchIdParsed)) {
        setError('ข้อมูลไม่ครบถ้วนหรือไม่ถูกต้อง');
        return;
      }

      setIsSubmitting(true);

      const newTemplate = await addTemplate({
        name: formData.name,
        description: formData.description,
        spec: formData.spec,
        warranty: parseInt(formData.warranty),
        productProfileId: productProfileIdParsed,
        unitId: unitIdParsed,
        codeType: formData.codeType,
        noSN: formData.noSN,
      });

      if (newTemplate) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          navigate('/pos/stock/templates');
        }, 2000);
      } else {
        setError('ไม่สามารถเพิ่มสเปกสินค้า (SKU) ได้');
      }
    } catch (err) {
      console.error('❌ บันทึกไม่สำเร็จ:', err);
      setError('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSubmitting(false);
    }
  };
  if (!canManage) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-4">
          <h2 className="text-xl font-bold">เพิ่มสเปกสินค้า (SKU)</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">เฉพาะผู้ดูแลระบบ (Admin) หรือ Super Admin เท่านั้น</p>
        </div>

        <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <div className="font-semibold">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</div>
          <div className="mt-1">ไม่สามารถเพิ่ม/แก้ไขสเปกสินค้า (SKU) ได้ในบัญชีนี้</div>
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4">
        <h2 className="text-xl font-bold">เพิ่มสเปกสินค้า (SKU)</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          สเปกสินค้า (SKU) = ตัวเลือกย่อยของรุ่นที่แยกราคา/สต๊อก เช่น 4GB/64GB, 4GB/128GB
        </p>
      </div>
      {error && <p className="text-red-500 font-medium mb-2">{error}</p>}
      <ProductTemplateForm onSubmit={handleCreate} mode="create" />

      <ProcessingDialog
        open={isSubmitting || showSuccess}
        isLoading={isSubmitting}
        message={isSubmitting ? 'ระบบกำลังบันทึกข้อมูล กรุณารอสักครู่...' : '✅ บันทึกสเปกสินค้า (SKU) เรียบร้อยแล้ว'}
        onClose={() => setShowSuccess(false)}
      />
    </div>
  );
};

export default CreateProductTemplatePage;






