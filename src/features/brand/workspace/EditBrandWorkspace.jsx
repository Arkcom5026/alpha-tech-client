// src/features/stock/brand/pages/EditBrandPage.jsx
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { feedback } from '@/design-system'
import { useBrandStore } from '../store/brandStore'

const EditBrandPage = () => {
  const navigate = useNavigate()
  const { id, shopSlug } = useParams()

  const {
    items,
    loading,
    saving,
    error,
    clearErrorAction,
    fetchBrandsAction,
    updateBrandAction,
    toggleBrandActiveAction,
  } = useBrandStore()

  const numericId = useMemo(() => {
    const n = Number(id)
    return Number.isFinite(n) && n > 0 ? n : null
  }, [id])

  const existing = useMemo(() => {
    if (!numericId) return null
    return items?.find((x) => String(x?.id) === String(numericId)) || null
  }, [items, numericId])

  const [name, setName] = useState('')
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    clearErrorAction()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!numericId) return

    const bootstrap = async () => {
      if (!existing && !loading) {
        try {
          await fetchBrandsAction({ includeInactive: true, page: 1 })
        } catch (loadError) {
          feedback.actionError(loadError, 'โหลดข้อมูลแบรนด์ไม่สำเร็จ', 'brand:edit:load:error')
        }
      }
    }

    bootstrap()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numericId])

  useEffect(() => {
    if (existing) {
      setName(existing.name || '')
      setTouched(false)
    }
  }, [existing])

  const nameTrim = String(name || '').trim()
  const nameError = touched && !nameTrim ? 'กรุณากรอกชื่อแบรนด์' : null
  const listPath = `/${shopSlug || 'advancetech'}/pos/stock/brands`

  const onSubmit = async (e) => {
    e?.preventDefault?.()
    clearErrorAction()
    setTouched(true)

    if (!numericId || !nameTrim || saving) return

    try {
      const result = await updateBrandAction({ id: numericId, name: nameTrim })
      if (result?.ok) {
        feedback.actionSuccess('บันทึกการแก้ไขแบรนด์เรียบร้อยแล้ว', 'brand:update:success')
        navigate(listPath)
        return
      }
      feedback.error(error || 'บันทึกการแก้ไขแบรนด์ไม่สำเร็จ', { eventKey: 'brand:update:error' })
    } catch (updateError) {
      feedback.actionError(updateError, 'บันทึกการแก้ไขแบรนด์ไม่สำเร็จ', 'brand:update:error')
    }
  }

  const onCancel = () => {
    if (saving) return
    navigate(listPath)
  }

  const onToggle = async () => {
    if (!existing?.id || saving) return
    clearErrorAction()
    const nextActive = !existing.isActive
    const actionText = nextActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'
    try {
      const result = await toggleBrandActiveAction({ id: existing.id, isActive: nextActive })
      if (result?.ok === false) {
        feedback.error(error || `${actionText}แบรนด์ไม่สำเร็จ`, { eventKey: 'brand:toggle:error' })
        return
      }
      feedback.actionSuccess(`${actionText}แบรนด์เรียบร้อยแล้ว`, `brand:${nextActive ? 'activate' : 'deactivate'}:success`)
    } catch (toggleError) {
      feedback.actionError(toggleError, `${actionText}แบรนด์ไม่สำเร็จ`, `brand:${nextActive ? 'activate' : 'deactivate'}:error`)
    }
  }

  const notFound = numericId && !existing && !loading

  return (
    <div className="p-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold">แก้ไขแบรนด์</h1>
          <p className="text-sm text-gray-500">อัปเดตชื่อแบรนด์หรือสถานะการใช้งาน</p>
        </div>
      </div>

      {error ? (
        <div className="mt-3 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <div className="font-medium">เกิดข้อผิดพลาด</div>
          <div className="mt-1 break-words">{error}</div>
        </div>
      ) : null}

      {notFound ? (
        <div className="mt-4 rounded border bg-white p-4 max-w-xl">
          <div className="text-sm text-gray-700">ไม่พบแบรนด์ที่ต้องการแก้ไข</div>
          <div className="mt-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded border text-sm hover:bg-gray-50"
            >
              กลับ
            </button>
          </div>
        </div>
      ) : (
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
                disabled={saving || !existing}
              />
              {nameError ? (
                <div className="mt-1 text-xs text-red-600">{nameError}</div>
              ) : null}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="submit"
                disabled={saving || !existing}
                className="px-4 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                disabled={saving}
                className="px-4 py-2 rounded border text-sm hover:bg-gray-50 disabled:opacity-60"
              >
                ยกเลิก
              </button>

              <button
                type="button"
                onClick={onToggle}
                disabled={saving || !existing}
                className="px-4 py-2 rounded border text-sm hover:bg-gray-50 disabled:opacity-60"
              >
                {existing?.isActive ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
              </button>

              {loading && !existing ? <div className="text-sm text-gray-600">กำลังโหลดข้อมูล...</div> : null}
            </div>

            {existing ? (
              <div className="text-xs text-gray-500">
                สถานะปัจจุบัน: <span className="font-medium">{existing.isActive ? 'ใช้งาน' : 'ปิดใช้งาน'}</span>
              </div>
            ) : null}
          </form>
        </div>
      )}
    </div>
  )
}

export default EditBrandPage
