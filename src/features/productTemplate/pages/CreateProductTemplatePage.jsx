


// ✅ src/features/productTemplate/pages/CreateProductTemplatePage.jsx

import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import ProductTemplateForm from '../components/ProductTemplateForm'
import useProductTemplateStore from '../store/productTemplateStore'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useBranchStore } from '@/features/branch/store/branchStore'
import ProcessingDialog from '@/components/shared/dialogs/ProcessingDialog'

const CreateProductTemplatePage = () => {
  const navigate = useNavigate()

  // ✅ Guard สิทธิ์ (P1-safe): canManageProductOrdering เป็น selector function
  const { isSuperAdmin, canManageProductOrdering } = useAuthStore()
  const canManage = useMemo(
    () => isSuperAdmin || canManageProductOrdering(),
    [isSuperAdmin, canManageProductOrdering]
  )

  const selectedBranchId = useBranchStore((state) => state.selectedBranchId)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const { addTemplateAction } = useProductTemplateStore()

  const handleCreate = async (formData) => {
    if (!canManage) return // hard-stop safety
    try {
      if (!selectedBranchId) {
        setError('ไม่พบสาขา กรุณาเลือกสาขาหรือเข้าสู่ระบบใหม่')
        return
      }

      // fields ที่ไม่ส่งไป BE (อย่า mutate formData โดยตรง)
      const {
        unit: _unit,
        templateImages: _templateImages,
        ...safeForm
      } = formData || {}

      const productProfileIdParsed = safeForm.productProfileId ? parseInt(safeForm.productProfileId) : null
      const branchIdParsed = Number(selectedBranchId)

      // ✅ ใช้ branchIdParsed เฉพาะเพื่อ validate ว่า context สาขามีจริง (แต่ไม่ส่งไป BE)
      // ⚠️ P1 security baseline: FE ห้ามส่ง branchId ไปที่ API (ให้ BE อ่านจาก token)
      const unitIdParsed = safeForm.unitId ? parseInt(safeForm.unitId) : null

      if (!Number.isFinite(branchIdParsed) || branchIdParsed <= 0) {
        setError('ไม่พบสาขา กรุณาเลือกสาขาหรือเข้าสู่ระบบใหม่')
        return
      }

      // productProfileId อาจเป็น optional ตาม schema/UX (ถ้าบังคับค่อยย้ายไป validate ใน Form)
      if (productProfileIdParsed != null && Number.isNaN(productProfileIdParsed)) {
        setError('ข้อมูลไม่ครบถ้วนหรือไม่ถูกต้อง')
        return
      }

      setIsSubmitting(true)

      const newTemplate = await addTemplateAction({
        name: (safeForm.name || '').trim(),
        description: safeForm.description ?? null,
        spec: safeForm.spec ?? null,
        warranty: safeForm.warranty ? parseInt(safeForm.warranty) : 0,
        productProfileId: productProfileIdParsed,
        unitId: unitIdParsed,
        codeType: safeForm.codeType ?? null,
        noSN: !!safeForm.noSN,
      })

      if (newTemplate) {
        setShowSuccess(true)
        setTimeout(() => {
          setShowSuccess(false)
          navigate('/pos/stock/templates')
        }, 2000)
      } else {
        setError('ไม่สามารถเพิ่มเทมเพลทสินค้าได้')
      }
    } catch (err) {
      console.error('❌ บันทึกไม่สำเร็จ:', err)
      setError('เกิดข้อผิดพลาดในการบันทึกข้อมูล')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!canManage) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-4">
          <h2 className="text-xl font-bold">เพิ่มเทมเพลทสินค้า</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            เฉพาะผู้ดูแลระบบ (Admin) หรือ Super Admin เท่านั้น
          </p>
        </div>

        <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <div className="font-semibold">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</div>
          <div className="mt-1">ไม่สามารถเพิ่ม/แก้ไขเทมเพลทสินค้าได้ในบัญชีนี้</div>
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
              กลับไปหน้ารายการเทมเพลทสินค้า
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4">
        <h2 className="text-xl font-bold">เพิ่มเทมเพลทสินค้า</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          เทมเพลทสินค้า = โครงสร้าง/โปรไฟล์การขายของสินค้า ใช้เป็นแม่แบบสำหรับสร้างรายการสินค้าที่ขายจริง
          (เช่น หน่วย, รูปแบบโค้ด, สเปกพื้นฐานที่ใช้ซ้ำ)
        </p>
      </div>

      {error && <p className="text-red-500 font-medium mb-2">{error}</p>}

      <ProductTemplateForm onSubmit={handleCreate} mode="create" />

      <ProcessingDialog
        open={isSubmitting || showSuccess}
        isLoading={isSubmitting}
        message={
          isSubmitting
            ? 'ระบบกำลังบันทึกข้อมูล กรุณารอสักครู่...'
            : '✅ บันทึกเทมเพลทสินค้าเรียบร้อยแล้ว'
        }
        onClose={() => setShowSuccess(false)}
      />
    </div>
  )
}

export default CreateProductTemplatePage

