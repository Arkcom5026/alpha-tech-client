// ✅ src/features/productProfile/pages/ListProductProfilePage.jsx
import React from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import ProductProfileTable from '../components/ProductProfileTable'
import useProductProfileStore from '../store/productProfileStore'
import StandardActionButtons from '@/components/shared/buttons/StandardActionButtons'
import { useAuthStore } from '@/features/auth/store/authStore'

const ListProductProfilePage = () => {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const location = useLocation()
  const isListPath = /\/pos\/stock\/profiles\/?$/.test(location.pathname)

  // ✅ อ่านสิทธิ์จาก authStore แบบ tolerant (รองรับทั้ง value และ function)
  const auth = useAuthStore()
  const isSuperAdmin = React.useMemo(() => {
    const v = auth?.isSuperAdmin
    return typeof v === 'function' ? !!v() : !!v
  }, [auth])

  const canManageProductOrdering = React.useMemo(() => {
    const v = auth?.canManageProductOrdering
    return typeof v === 'function' ? !!v() : !!v
  }, [auth])

  // ✅ permission: SuperAdmin หรือสิทธิ์จัดการลำดับสินค้า
  const canManage = React.useMemo(() => {
    return !!isSuperAdmin || !!canManageProductOrdering
  }, [isSuperAdmin, canManageProductOrdering])

  // ✅ โหมด on-demand: ต้องกด “แสดงข้อมูล” ก่อน 1 ครั้ง
  const [hasLoaded, setHasLoaded] = React.useState(false)

  const {
    items,
    page,
    limit,
    totalPages,
    search,
    includeInactive,
    isLoading,
    error,
    setPageAction,
    setSearchAction,
    setIncludeInactiveAction,
    setLimitAction,
    fetchListAction,
  } = useProductProfileStore()

  // ✅ Init จาก URL → Store (ยึดโฟลว์เดิม)
  React.useEffect(() => {
    if (!isListPath) return

    const p = Number(params.get('page') || 1)
    const s = params.get('search') || ''
    const inc = params.get('includeInactive') === 'true'

    setPageAction(p)
    setSearchAction(s)
    setIncludeInactiveAction(inc)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListPath])

  const isSameParams = React.useCallback((a, b) => {
    if (a.toString() === b.toString()) return true
    if (a.size !== b.size) return false
    for (const [k, v] of a.entries()) {
      if (b.get(k) !== v) return false
    }
    return true
  }, [])

  // ✅ โฟลว์เดิม:
  // - เปลี่ยน page/search/limit/includeInactive → fetchListAction ทันที
  // - แต่จะเริ่มทำงานหลังผู้ใช้กด “แสดงข้อมูล” เท่านั้น
  React.useEffect(() => {
    if (!isListPath) return
    if (!hasLoaded) return

    fetchListAction()

    const next = new URLSearchParams()
    next.set('page', String(page))
    if (search) next.set('search', search)
    if (includeInactive) next.set('includeInactive', 'true')

    if (!isSameParams(next, params)) {
      setParams(next, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListPath, hasLoaded, page, limit, search, includeInactive])

  const handleCreate = (e) => {
    e.preventDefault()
    navigate('/pos/stock/profiles/create')
  }

  const handleEdit = (row) => {
    const id = Number(row?.id)
    if (!id) return
    navigate(`/pos/stock/profiles/edit/${id}`)
  }

  const onPrev = () => hasLoaded && page > 1 && setPageAction(page - 1)
  const onNext = () => hasLoaded && page < totalPages && setPageAction(page + 1)

  const onSearchChange = (e) => {
    setSearchAction(e.target.value || '')
    setPageAction(1)
  }

  const clearSearch = () => {
    setSearchAction('')
    setPageAction(1)
  }

  return (
    <div className="p-6 w-full flex flex-col items-center">
      <div className="w-full max-w-6xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold text-zinc-800 dark:text-white">โปรไฟล์สินค้า</h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              โปรไฟล์สินค้า = <span className="font-medium">กลุ่มมาตรฐานที่นำไปใช้ซ้ำได้</span> ใช้เมื่อมีรูปแบบซ้ำจริง
              เพื่อช่วยเลือก Template/ค่าเริ่มต้นให้สม่ำเสมอ{' '}
              <span className="font-medium">(ไม่ผูกกับหมวดหมู่/ประเภทสินค้า และไม่จำเป็นต้องมีทุกสินค้า)</span>
            </p>
          </div>
          {canManage && <StandardActionButtons onAdd={handleCreate} />}
        </div>

        <div className="flex flex-col gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 grow max-w-xl">
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder={hasLoaded ? 'ค้นหาโปรไฟล์สินค้า เช่น ชื่อโปรไฟล์/คำค้น' : 'กด “แสดงข้อมูล” ก่อนเพื่อโหลดรายการ'}
                value={search}
                onChange={onSearchChange}
                disabled={!hasLoaded}
              />
              {search ? (
                <button type="button" className="btn" onClick={clearSearch}>
                  ล้าง
                </button>
              ) : null}
            </div>

            <label className="inline-flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              <input
                type="checkbox"
                className="checkbox"
                checked={!!includeInactive}
                onChange={(e) => {
                  setIncludeInactiveAction(e.target.checked)
                  setPageAction(1)
                }}
                disabled={!hasLoaded}
              />
              แสดงข้อมูลที่ถูกปิดใช้งานด้วย
            </label>

            <div className="ml-auto flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-zinc-700 dark:text-zinc-300">แถว/หน้า</span>
                <select
                  className="select select-bordered"
                  value={limit}
                  disabled={!hasLoaded}
                  onChange={(e) => {
                    setLimitAction(Number(e.target.value))
                    setPageAction(1)
                  }}
                >
                  {[10, 20, 50, 100].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-[0_6px_20px_-6px_rgba(37,99,235,0.55)] hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:opacity-50"
                disabled={isLoading || hasLoaded}
                onClick={() => {
                  if (hasLoaded) return
                  setHasLoaded(true)
                  setPageAction(1)

                  // sync URL ทันที (เพื่อรีเฟรชแล้วยังอยู่ที่ filter เดิม)
                  const next = new URLSearchParams(params)
                  next.set('page', '1')

                  if (search) next.set('search', search)
                  else next.delete('search')

                  if (includeInactive) next.set('includeInactive', 'true')
                  else next.delete('includeInactive')

                  setParams(next, { replace: true })
                }}
              >
                แสดงข้อมูล
              </button>
            </div>
          </div>
        </div>

        <div className="border rounded-xl p-3 shadow-sm bg-white dark:bg-zinc-900">
          <ProductProfileTable
            data={hasLoaded ? items : []}
            loading={isLoading}
            error={error}
            page={page}
            limit={limit}
            canManage={canManage}
            onEdit={canManage ? handleEdit : undefined}
          />
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            หน้า {page} / {Math.max(totalPages || 1, 1)}
          </div>
          <div className="flex gap-2">
            <button className="btn btn-outline" onClick={onPrev} disabled={!hasLoaded || page <= 1 || isLoading}>
              ก่อนหน้า
            </button>
            <button
              className="btn btn-outline"
              onClick={onNext}
              disabled={!hasLoaded || page >= Math.max(totalPages || 1, 1) || isLoading}
            >
              ถัดไป
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ListProductProfilePage
