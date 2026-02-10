

// src/features/stock/brand/components/BrandForm.jsx
// Reusable form for Create/Edit (no direct API calls)

import React, { useEffect, useMemo, useState } from 'react'

const BrandForm = ({
  mode = 'create', // 'create' | 'edit'
  title,
  subtitle,
  initialName = '',
  isActive = true,
  saving = false,
  loading = false,
  error = null,
  onSubmit, // async ({ name }) => { ok: boolean }
  onCancel,
  onToggleActive, // optional async () => void
}) => {
  const [name, setName] = useState(initialName || '')
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    setName(initialName || '')
    setTouched(false)
  }, [initialName])

  const nameTrim = useMemo(() => String(name || '').trim(), [name])
  const nameError = touched && !nameTrim ? 'กรุณากรอกชื่อแบรนด์' : null

  const computedTitle = title || (mode === 'edit' ? 'แก้ไขแบรนด์' : 'เพิ่มแบรนด์')
  const computedSubtitle = subtitle || (mode === 'edit' ? 'อัปเดตชื่อแบรนด์หรือสถานะการใช้งาน' : 'สร้างแบรนด์ใหม่สำหรับสาขานี้')

  const handleSubmit = async (e) => {
    e?.preventDefault?.()
    setTouched(true)
    if (!nameTrim) return
    if (typeof onSubmit === 'function') {
      await onSubmit({ name: nameTrim })
    }
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold">{computedTitle}</h1>
          <p className="text-sm text-gray-500">{computedSubtitle}</p>
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">ชื่อแบรนด์</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched(true)}
              placeholder="เช่น Samsung"
              className="w-full rounded border px-3 py-2 text-sm"
              disabled={loading}
            />
            {nameError ? <div className="mt-1 text-xs text-red-600">{nameError}</div> : null}
          </div>

          {mode === 'edit' ? (
            <div className="text-xs text-gray-500">
              สถานะปัจจุบัน: <span className="font-medium">{isActive ? 'ใช้งาน' : 'ปิดใช้งาน'}</span>
            </div>
          ) : (
            <div className="text-xs text-gray-500">หมายเหตุ: ระบบจะกันชื่อซ้ำภายในสาขาเดียวกันโดยอัตโนมัติ</div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="submit"
              disabled={saving || loading}
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

            {mode === 'edit' && typeof onToggleActive === 'function' ? (
              <button
                type="button"
                onClick={onToggleActive}
                disabled={saving || loading}
                className="px-4 py-2 rounded border text-sm hover:bg-gray-50 disabled:opacity-60"
              >
                {isActive ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
              </button>
            ) : null}

            {saving ? <div className="text-sm text-gray-600">กำลังบันทึก...</div> : null}
            {loading && mode === 'edit' ? <div className="text-sm text-gray-600">กำลังโหลดข้อมูล...</div> : null}
          </div>
        </form>
      </div>
    </div>
  )
}

export default BrandForm
