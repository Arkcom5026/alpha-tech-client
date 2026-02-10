

// src/features/stock/brand/pages/CreateBrandPage.jsx
// Create Brand (Production-grade, no direct API calls)

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBrandStore } from '../store/brandStore'

const CreateBrandPage = () => {
  const navigate = useNavigate()

  const {
    saving,
    error,
    clearErrorAction,
    createBrandAction,
  } = useBrandStore()

  const [name, setName] = useState('')
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    clearErrorAction()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const nameTrim = String(name || '').trim()
  const nameError = touched && !nameTrim ? 'กรุณากรอกชื่อแบรนด์' : null

  const onSubmit = async (e) => {
    e?.preventDefault?.()
    clearErrorAction()
    setTouched(true)

    if (!nameTrim) return

    const result = await createBrandAction({ name: nameTrim })
    if (result?.ok) {
      // กลับไปหน้า list
      navigate('/pos/stock/brands')
    }
  }

  const onCancel = () => {
    navigate('/pos/stock/brands')
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold">เพิ่มแบรนด์</h1>
          <p className="text-sm text-gray-500">สร้างแบรนด์ใหม่สำหรับสาขานี้</p>
        </div>
      </div>

      {/* error block (no dialog alert) */}
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
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched(true)}
              placeholder="เช่น Samsung"
              className="w-full rounded border px-3 py-2 text-sm"
            />
            {nameError ? (
              <div className="mt-1 text-xs text-red-600">{nameError}</div>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-60"
            >
              บันทึก
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="px-4 py-2 rounded border text-sm hover:bg-gray-50 disabled:opacity-60"
            >
              ยกเลิก
            </button>
            {saving ? <div className="text-sm text-gray-600">กำลังบันทึก...</div> : null}
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
