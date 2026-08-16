// src/features/stock/brand/pages/CreateBrandPage.jsx
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { feedback } from '@/design-system'
import { useBrandStore } from '../store/brandStore'

const CreateBrandPage = () => {
  const navigate = useNavigate()
  const { shopSlug } = useParams()

  const {
    saving,
    error,
    clearErrorAction,
    createBrandAction,
  } = useBrandStore()

  const [name, setName] = useState('')
  const [touched, setTouched] = useState(false)
  const submittingRef = useRef(false)

  useEffect(() => {
    clearErrorAction()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const nameTrim = String(name || '').trim()
  const nameError = touched && !nameTrim ? 'กรุณากรอกชื่อแบรนด์' : null

  const onSubmit = async (e) => {
    e?.preventDefault?.()
    if (saving || submittingRef.current) return

    clearErrorAction()
    setTouched(true)

    const nameSnapshot = String(name || '').trim()
    const shopSlugSnapshot = shopSlug || 'advancetech'
    if (!nameSnapshot) return

    submittingRef.current = true
    try {
      const result = await createBrandAction({ name: nameSnapshot })
      if (result?.ok) {
        feedback.actionSuccess('เพิ่มแบรนด์เรียบร้อยแล้ว', `brand:create:${nameSnapshot}:success`)
        navigate(`/${shopSlugSnapshot}/pos/stock/brands`)
        return
      }
      feedback.error(error || 'เพิ่มแบรนด์ไม่สำเร็จ', { eventKey: `brand:create:${nameSnapshot}:error` })
    } catch (createError) {
      feedback.actionError(createError, 'เพิ่มแบรนด์ไม่สำเร็จ', `brand:create:${nameSnapshot}:error`)
    } finally {
      submittingRef.current = false
    }
  }

  const onCancel = () => {
    if (saving || submittingRef.current) return
    navigate(`/${shopSlug || 'advancetech'}/pos/stock/brands`)
  }

  const mutationBusy = saving || submittingRef.current

  return (
    <div className="p-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold">เพิ่มแบรนด์</h1>
          <p className="text-sm text-gray-500">สร้างแบรนด์ใหม่สำหรับสาขานี้</p>
        </div>
      </div>

      {error ? (
        <div className="mt-3 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <div className="font-medium">เกิดข้อผิดพลาด</div>
          <div className="mt-1 break-words">{error}</div>
        </div>
      ) : null}

      <div className="mt-4 rounded border bg-white p-4 max-w-xl">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">ชื่อแบรนด์</label>
            <input
              value={name}
              onChange={(e) => {
                if (!submittingRef.current) setName(e.target.value)
              }}
              onBlur={() => {
                if (!submittingRef.current) setTouched(true)
              }}
              placeholder="เช่น Samsung"
              className="w-full rounded border px-3 py-2 text-sm"
              disabled={mutationBusy}
            />
            {nameError ? (
              <div className="mt-1 text-xs text-red-600">{nameError}</div>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={mutationBusy}
              className="px-4 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-60"
            >
              {mutationBusy ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={mutationBusy}
              className="px-4 py-2 rounded border text-sm hover:bg-gray-50 disabled:opacity-60"
            >
              ยกเลิก
            </button>
          </div>

          <div className="text-xs text-gray-500">
            หมายเหตุ: ระบบจะกันชื่อซ้ำภายในสาขาเดียวกันโดยอัตโนมัติ
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateBrandPage
