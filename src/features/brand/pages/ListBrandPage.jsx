
// src/features/stock/brand/pages/ListBrandPage.jsx
// List Brands (Production-grade, no direct API calls)

import React, { useEffect, useMemo, useState } from 'react'
import { useBrandStore } from '../store/brandStore'

const ListBrandPage = () => {
  const {
    items,
    page,
    pageSize,
    total,
    q,
    includeInactive,
    loading,
    saving,
    error,
    setQueryAction,
    setIncludeInactiveAction,
    setPageAction,
    setPageSizeAction,
    clearErrorAction,
    fetchBrandsAction,
    toggleBrandActiveAction,
  } = useBrandStore()

  // local search box to avoid fetch-per-keystroke
  const [qDraft, setQDraft] = useState(q)

  useEffect(() => {
    // initial load
    fetchBrandsAction()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setQDraft(q)
  }, [q])

  const totalPages = useMemo(() => {
    const t = Number(total) || 0
    const ps = Number(pageSize) || 20
    return Math.max(1, Math.ceil(t / ps))
  }, [total, pageSize])

  const canPrev = page > 1
  const canNext = page < totalPages

  const onSearch = async (e) => {
    e?.preventDefault?.()
    clearErrorAction()
    setQueryAction(qDraft)
    await fetchBrandsAction({ q: qDraft, page: 1 })
  }

  const onResetSearch = async () => {
    clearErrorAction()
    setQDraft('')
    setQueryAction('')
    await fetchBrandsAction({ q: '', page: 1 })
  }

  const onToggle = async (row) => {
    if (!row?.id) return
    clearErrorAction()
    await toggleBrandActiveAction({ id: row.id, isActive: !row.isActive })
  }

  const onIncludeInactiveChange = async (e) => {
    const v = !!e.target.checked
    clearErrorAction()
    setIncludeInactiveAction(v)
    await fetchBrandsAction({ includeInactive: v, page: 1 })
  }

  const onPrev = async () => {
    if (!canPrev) return
    const nextPage = page - 1
    setPageAction(nextPage)
    await fetchBrandsAction({ page: nextPage })
  }

  const onNext = async () => {
    if (!canNext) return
    const nextPage = page + 1
    setPageAction(nextPage)
    await fetchBrandsAction({ page: nextPage })
  }

  const onPageSizeChange = async (e) => {
    const ps = Number(e.target.value) || 20
    setPageSizeAction(ps)
    await fetchBrandsAction({ pageSize: ps, page: 1 })
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold">แบรนด์</h1>
          <p className="text-sm text-gray-500">จัดการรายชื่อแบรนด์ของสาขา</p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/pos/stock/brands/create"
            className="px-3 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
          >
            + เพิ่มแบรนด์
          </a>
        </div>
      </div>

      {/* error block (no dialog alert) */}
      {error ? (
        <div className="mt-3 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <div className="font-medium">เกิดข้อผิดพลาด</div>
          <div className="mt-1 break-words">{error}</div>
        </div>
      ) : null}

      {/* toolbar */}
      <div className="mt-4 rounded border bg-white p-3">
        <form onSubmit={onSearch} className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[220px]">
            <label className="block text-sm font-medium mb-1">ค้นหา</label>
            <input
              value={qDraft}
              onChange={(e) => setQDraft(e.target.value)}
              placeholder="พิมพ์ชื่อแบรนด์..."
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-2 rounded bg-gray-900 text-white text-sm disabled:opacity-60"
            >
              ค้นหา
            </button>
            <button
              type="button"
              onClick={onResetSearch}
              disabled={loading}
              className="px-3 py-2 rounded border text-sm disabled:opacity-60"
            >
              ล้าง
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={includeInactive}
                onChange={onIncludeInactiveChange}
              />
              แสดงที่ปิดใช้งาน
            </label>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <label className="text-sm text-gray-600">ต่อหน้า</label>
            <select
              value={pageSize}
              onChange={onPageSizeChange}
              className="rounded border px-2 py-2 text-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </form>
      </div>

      {/* table */}
      <div className="mt-4 rounded border bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-3 py-2">ชื่อแบรนด์</th>
                <th className="text-left px-3 py-2 w-[140px]">สถานะ</th>
                <th className="text-right px-3 py-2 w-[220px]">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-3 py-6 text-center text-gray-500">
                    กำลังโหลดข้อมูล...
                  </td>
                </tr>
              ) : items?.length ? (
                items.map((row) => (
                  <tr key={row.id} className="border-t">
                    <td className="px-3 py-2">{row.name}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex items-center rounded px-2 py-1 text-xs ${
                          row.isActive ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}
                      >
                        {row.isActive ? 'ใช้งาน' : 'ปิดใช้งาน'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="inline-flex items-center gap-2">
                        <a
                          href={`/pos/stock/brands/${row.id}/edit`}
                          className="px-3 py-1.5 rounded border text-sm hover:bg-gray-50"
                        >
                          แก้ไข
                        </a>
                        <button
                          type="button"
                          onClick={() => onToggle(row)}
                          disabled={saving}
                          className="px-3 py-1.5 rounded border text-sm hover:bg-gray-50 disabled:opacity-60"
                        >
                          {row.isActive ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-3 py-6 text-center text-gray-500">
                    ไม่พบข้อมูล
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* footer */}
        <div className="flex items-center justify-between gap-3 p-3 border-t bg-white">
          <div className="text-sm text-gray-600">
            ทั้งหมด <span className="font-medium">{total}</span> รายการ
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onPrev}
              disabled={!canPrev || loading}
              className="px-3 py-2 rounded border text-sm disabled:opacity-60"
            >
              ก่อนหน้า
            </button>
            <div className="text-sm text-gray-600">
              หน้า <span className="font-medium">{page}</span> / {totalPages}
            </div>
            <button
              type="button"
              onClick={onNext}
              disabled={!canNext || loading}
              className="px-3 py-2 rounded border text-sm disabled:opacity-60"
            >
              ถัดไป
            </button>
          </div>
        </div>
      </div>

      {/* saving hint (no toast/dialog required) */}
      {saving ? (
        <div className="mt-3 text-sm text-gray-600">กำลังบันทึก...</div>
      ) : null}
    </div>
  )
}

export default ListBrandPage
