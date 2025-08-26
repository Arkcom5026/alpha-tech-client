// =============================
// client/src/features/bank/pages/ListBankPage.jsx
// หน้าแสดงรายการธนาคาร (ค้นหา/รีเฟรช/แสดง inactive + ปุ่ม เพิ่ม/แก้ไข/ลบ)
// ✅ ยกเลิก Dialog แล้วให้กดปุ่มนำทางไปหน้า CreateBankPage/EditBankPage แทน

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useBankStore from '@/features/bank/store/bankStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Search, RefreshCcw, Plus, Pencil, Trash2 } from 'lucide-react'

// ปรับ path ได้ตาม Router ของโปรเจกต์
const LIST_PATH = '/pos/settings/bank'
const CREATE_PATH = '/pos/settings/bank/create'
const EDIT_PATH = (id) => `/pos/settings/bank/edit/${id}`

function useDebouncedValue(value, delay = 300) {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return v
}

export default function ListBankPage() {
  const navigate = useNavigate()
  const {
    banks,
    bankLoading,
    bankDeletingId,
    bankError,
    query,
    includeInactive,
    setQuery,
    setIncludeInactive,
    clearError,
    fetchBanksAction,
    deleteBankAction,
  } = useBankStore()

  const [localQuery, setLocalQuery] = useState(query || '')
  const debouncedQuery = useDebouncedValue(localQuery, 300)

  // โหลดครั้งแรก
  useEffect(() => {
    fetchBanksAction()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // เมื่อค้นหา/สลับแสดง inactive ให้ยิงโหลดใหม่
  useEffect(() => {
    clearError()
    setQuery(debouncedQuery)
    fetchBanksAction({ q: debouncedQuery, includeInactive })
  }, [debouncedQuery, includeInactive, fetchBanksAction, setQuery, clearError])

  const onToggleInactive = useCallback((val) => {
    setIncludeInactive(!!val)
  }, [setIncludeInactive])

  const onClickCreate = useCallback(() => {
    navigate(CREATE_PATH)
  }, [navigate])

  const onClickEdit = useCallback((b) => {
    navigate(EDIT_PATH(b.id))
  }, [navigate])

  const onDelete = useCallback(async (id) => {
    if (!id) return
    if (!confirm('ต้องการลบธนาคารรายการนี้ใช่หรือไม่?')) return
    try {
      await deleteBankAction(id)
    } catch (err) {
      const msg = err?.response?.data?.message || 'ลบไม่สำเร็จ'
      alert(msg)
    }
  }, [deleteBankAction])

  const rows = useMemo(() => {
    return (banks || []).map((b) => (
      <tr key={b.id} className="border-b hover:bg-muted/40 text-sm">
        <td className="px-2 py-1">{b.name}</td>
        <td className="px-2 py-1">
          {b.active ? (
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700 text-xs">ACTIVE</span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-gray-200 px-2 py-0.5 text-gray-700 text-xs">INACTIVE</span>
          )}
        </td>
        <td className="px-2 py-1 text-right">
          <div className="inline-flex gap-2">
            <Button variant="outline" size="icon" onClick={() => onClickEdit(b)} title="แก้ไข">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              disabled={bankDeletingId === b.id}
              onClick={() => onDelete(b.id)}
              title="ลบ"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </td>
      </tr>
    ))
  }, [banks, bankDeletingId, onClickEdit, onDelete])

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-3xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
        <h1 className="text-2xl font-semibold">รายการธนาคาร</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => fetchBanksAction()} disabled={bankLoading}>
            <RefreshCcw className="h-4 w-4 mr-2" /> รีเฟรช
          </Button>
          <Button onClick={onClickCreate}>
            <Plus className="h-4 w-4 mr-2" /> เพิ่มธนาคาร
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหาชื่อธนาคาร..."
              className="pl-9"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center justify-between md:justify-start gap-3">
          <Label htmlFor="inactive" className="text-sm">แสดงที่ปิดใช้งาน</Label>
          <input id="inactive" type="checkbox" checked={!!includeInactive} onChange={(e) => onToggleInactive(e.target.checked)} className="h-4 w-4" />
        </div>
      </div>

      <div className="rounded-2xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left">
                <th className="px-2 py-1 font-medium">ชื่อธนาคาร</th>
                <th className="px-2 py-1 font-medium">สถานะ</th>
                <th className="px-2 py-1 text-right font-medium">การทำงาน</th>
              </tr>
            </thead>
            <tbody>{rows}</tbody>
          </table>
        </div>
        {bankLoading && (
          <div className="p-4 text-sm text-muted-foreground">กำลังโหลดข้อมูล...</div>
        )}
        {!bankLoading && banks?.length === 0 && (
          <div className="p-6 text-center text-muted-foreground">ไม่พบข้อมูลธนาคาร</div>
        )}
        {bankError && (
          <div className="p-3 text-sm text-red-600 border-t bg-red-50">{bankError}</div>
        )}
      </div>
    </div>
  )
}

