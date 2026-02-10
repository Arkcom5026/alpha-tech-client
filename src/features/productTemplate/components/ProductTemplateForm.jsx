// ✅ src/features/productTemplate/components/ProductTemplateForm.jsx

import React, { useEffect, useMemo, useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'

import useUnitStore from '@/features/unit/store/unitStore'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

const toNumOrEmpty = (v) => (v === undefined || v === null || v === '' ? '' : Number(v))

const ProductTemplateForm = ({ defaultValues = {}, onSubmit, mode }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const { units, fetchUnits } = useUnitStore()

  // ✅ defaults stable (รองรับ Edit ที่โหลดข้อมูล async)
  const stableDefaults = useMemo(
    () => ({
      name: defaultValues?.name ?? '',
      description: defaultValues?.description ?? '',
      spec: defaultValues?.spec ?? '',
      warranty: defaultValues?.warranty ?? '',
      noSN: defaultValues?.noSN ?? false,
      codeType: defaultValues?.codeType ?? 'D',
      unitId: toNumOrEmpty(defaultValues?.unitId),
    }),
    [
      defaultValues?.name,
      defaultValues?.description,
      defaultValues?.spec,
      defaultValues?.warranty,
      defaultValues?.noSN,
      defaultValues?.codeType,
      defaultValues?.unitId,
    ]
  )

  const formMethods = useForm({
    defaultValues: stableDefaults,
  })

  const {
    register,
    reset,
    formState: { isSubmitting: rhfIsSubmitting },
  } = formMethods

  const navigate = useNavigate()
  const isBusy = isSubmitting || rhfIsSubmitting

  // ✅ เมื่อ Edit โหลด defaultValues ทีหลัง → reset ฟอร์มให้ตรงข้อมูลล่าสุด
  useEffect(() => {
    reset(stableDefaults)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stableDefaults])

  // ✅ โหลดหน่วยนับ
  useEffect(() => {
    if (!Array.isArray(units) || units.length === 0) {
      try {
        fetchUnits?.()
      } catch (e) {
        console.error('[ProductTemplateForm] fetchUnits error', e)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchUnits, units?.length])

  const handleFormSubmit = async (formData) => {
    if (isSubmitting) return

    const name = (formData?.name || '').trim()
    if (!name) {
      setFormError('กรุณากรอกชื่อเทมเพลทสินค้า')
      return
    }

    // unitId optional? (ถ้าคุณต้องการบังคับ ให้ย้ายไป validate ที่นี่)
    setFormError('')
    setIsSubmitting(true)

    try {
      const payload = {
        ...formData,
        name,
        unitId: formData.unitId === '' ? null : Number(formData.unitId),
        warranty: formData.warranty === '' || formData.warranty == null ? 0 : Number(formData.warranty),
        noSN: !!formData.noSN,
        codeType: formData.codeType ?? 'D',
        description: formData.description ?? '',
        spec: formData.spec ?? '',
      }

      await onSubmit(payload)
    } catch (e) {
      // ✅ ไม่ใช้ alert/toast ใน P1
      setFormError(e?.message || 'บันทึกไม่สำเร็จ')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!units || units.length === 0) {
    return <p className="text-gray-500">⏳ กำลังโหลดข้อมูล...</p>
  }

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={formMethods.handleSubmit(handleFormSubmit)} className="space-y-6">
        {formError ? (
          <div
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
            aria-live="assertive"
          >
            {formError}
          </div>
        ) : null}

        {/* ✅ Template fields (ไม่มีหมวด/ประเภท/โปรไฟล์แล้ว) */}
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="font-medium block mb-1">ชื่อเทมเพลทสินค้า</label>
            <p className="text-xs text-zinc-500 mb-2">
              เทมเพลทสินค้า = แม่แบบข้อมูลพื้นฐานที่ใช้ซ้ำ เช่น หน่วย, รูปแบบโค้ด, สเปกพื้นฐาน
            </p>
            <input
              {...register('name')}
              disabled={isBusy}
              className="input w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-zinc-800 text-black dark:text-white"
              placeholder="เช่น เทมเพลทเครื่องพิมพ์, เทมเพลทโน้ตบุ๊ก, เทมเพลทสมาร์ทโฟน"
            />
          </div>

          <div>
            <label className="font-medium block mb-1">หน่วย</label>
            <select
              {...register('unitId')}
              disabled={isBusy}
              className="form-select w-full border px-3 py-2 rounded"
            >
              <option value="">-- เลือกหน่วยนับ --</option>
              {units.map((u) => (
                <option key={u.id} value={String(u.id)}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-medium block mb-1">รูปแบบโค้ด</label>
            <select
              {...register('codeType')}
              disabled={isBusy}
              className="form-select w-full border px-3 py-2 rounded"
            >
              <option value="D">D</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
            <p className="text-xs text-zinc-500 mt-1">กำหนดรูปแบบ/ชนิดโค้ดพื้นฐานของสินค้ากลุ่มนี้</p>
          </div>

          <div>
            <label className="font-medium block mb-1">ระยะประกัน (เดือน)</label>
            <input
              type="number"
              {...register('warranty')}
              disabled={isBusy}
              className="input w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-zinc-800 text-black dark:text-white text-right"
              placeholder="0"
              min={0}
            />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" {...register('noSN')} disabled={isBusy} />
            <span className="text-sm">สินค้าในเทมเพลทนี้ “ไม่ใช้ Serial Number (SN)”</span>
          </div>

          <div>
            <label className="font-medium block mb-1">รายละเอียด</label>
            <textarea
              {...register('description')}
              disabled={isBusy}
              className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-zinc-800 text-black dark:text-white"
              rows={3}
              placeholder="รายละเอียดสั้น ๆ (ถ้ามี)"
            />
          </div>

          <div>
            <label className="font-medium block mb-1">สเปกพื้นฐาน</label>
            <textarea
              {...register('spec')}
              disabled={isBusy}
              className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-zinc-800 text-black dark:text-white"
              rows={3}
              placeholder="สเปก/หมายเหตุพื้นฐานที่ใช้ซ้ำ (ถ้ามี)"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={isBusy}>
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isBusy}>
              {isBusy ? 'กำลังบันทึก…' : mode === 'edit' ? 'บันทึกการแก้ไข' : 'บันทึก'}
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  )
}

export default ProductTemplateForm
