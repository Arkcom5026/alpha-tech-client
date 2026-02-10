


// ✅ src/features/productTemplate/pages/ListProductTemplatePage.jsx
// - โหมด on-demand: ต้องกด “แสดงข้อมูล” ก่อน 1 ครั้ง
// - หลังจากโหลดแล้ว: เปลี่ยน dropdown / includeInactive / page / limit → fetch ทันที
// - Cascading 2 ชั้น: Category → Type (Template ไม่ใช่ cascade และไม่มี ProductProfile แล้ว)
// - URL sync: เก็บ filter/page ไว้เพื่อ refresh/back/forward
import React from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import ProductTemplateTable from '../components/ProductTemplateTable'
import StandardActionButtons from '@/components/shared/buttons/StandardActionButtons'
import { useAuthStore } from '@/features/auth/store/authStore'
import useProductTemplateStore from '../store/productTemplateStore'

const ListProductTemplatePage = () => {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const location = useLocation()
  const isListPath = /\/pos\/stock\/templates\/?$/.test(location.pathname)

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
    includeInactive,
    isLoading,
    error,
    setPageAction,
    setIncludeInactiveAction,
    setLimitAction,
    fetchListAction,
  } = useProductTemplateStore()

  // ✅ Init จาก URL → Store (ยึดโฟลว์เดิม)
  React.useEffect(() => {
    if (!isListPath) return

    const p = Number(params.get('page') || 1)
    const inc = params.get('includeInactive') === 'true'

    setPageAction(p)
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

  // ✅ โฟลว์ “เหมือนของเดิม”:
  // - เมื่อเปลี่ยน filter/page/limit/includeInactive → fetchListAction ทันที
  // - แต่จะเริ่มทำงานหลังผู้ใช้กด “แสดงข้อมูล” เท่านั้น
  //
  // Cascade rules:
  // - เปลี่ยน “หมวดหมู่” → ล้าง productTypeId
  // เพื่อกัน intermediate state ทำให้ยิง fetch ด้วยค่าเก่าแล้วได้ข้อมูลว่าง
  const skipAutoFetchOnceRef = React.useRef(false)

  React.useEffect(() => {
    if (!isListPath) return
    if (!hasLoaded) return

    // ✅ กันเคสเปลี่ยนหมวด/ประเภท แล้วเราจะยิง fetch แบบ deterministic จาก onCascadeChange เอง 1 ครั้ง
    if (skipAutoFetchOnceRef.current) return

    fetchListAction({ page, limit, includeInactive })

    const next = new URLSearchParams()
    next.set('page', String(page))
    if (includeInactive) next.set('includeInactive', 'true')


    if (!isSameParams(next, params)) {
      setParams(next, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListPath, hasLoaded, page, limit, includeInactive])

  const handleCreate = () => navigate('/pos/stock/templates/create')
  const handleEdit = (row) => navigate(`/pos/stock/templates/edit/${row.id}`)

  const onPrev = () => hasLoaded && page > 1 && setPageAction(page - 1)
  const onNext = () => hasLoaded && page < Math.max(totalPages || 1, 1) && setPageAction(page + 1)

  // ✅ เผื่อกรณี API ยังไม่กรองครบทุก field → กรองซ้ำฝั่ง FE แบบปลอดภัย (ไม่กระทบถ้า BE กรองอยู่แล้ว)

  return (
    <div className="p-6 w-full flex flex-col items-center">
      <div className="w-full max-w-6xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold text-zinc-800 dark:text-white">รายการเทมเพลทสินค้า</h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              เทมเพลทสินค้า = โครงสร้าง/โปรไฟล์การขายของสินค้า ใช้เป็นแม่แบบสำหรับสร้างรายการสินค้าที่ขายจริง
              (เช่น กำหนดหมวด/ประเภท และข้อมูลพื้นฐานที่ใช้ซ้ำ)
            </p>
          </div>
          {canManage && <StandardActionButtons onAdd={handleCreate} />}
        </div>

        <div className="flex flex-col gap-3 mb-4">
          {/* ✅ ก่อนกด “แสดงข้อมูล” ให้ disable ตัวกรอง เพื่อไม่ให้ผู้ใช้สับสน */}

          <div className="flex flex-wrap items-center gap-3">
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
          <ProductTemplateTable
            data={hasLoaded ? items : []}
            loading={isLoading}
            error={error}
            page={page}
            limit={limit}
            onEdit={canManage ? handleEdit : undefined}
            onToggleActive={isSuperAdmin ? useProductTemplateStore.getState().toggleActiveAction : undefined}
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

export default ListProductTemplatePage





