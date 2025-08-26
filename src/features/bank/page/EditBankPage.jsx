
// =============================
// client/src/features/bank/pages/EditBankPage.jsx
// หน้าแก้ไขธนาคาร (ฟิลด์: name, active) — ใช้ร่วมกับเส้นทาง /pos/settings/bank/:id/edit

import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import useBankStore from '@/features/bank/store/bankStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const LIST_PATH = '/pos/settings/bank'

export function EditBankPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const bankId = Number(id)

  const { bankSaving, bankError, fetchBankByIdAction, updateBankAction } = useBankStore()

  const [form, setForm] = useState({ name: '', active: true })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      const data = await fetchBankByIdAction(bankId)
      if (mounted && data) {
        setForm({
          name: data.name || '',
          active: typeof data.active === 'boolean' ? data.active : true,
        })
      }
      if (mounted) setLoading(false)
    }
    if (bankId) load()
    return () => { mounted = false }
  }, [bankId, fetchBankByIdAction])

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || form.name.trim() === '') {
      return alert('กรุณาระบุชื่อธนาคาร')
    }
    try {
      await updateBankAction(bankId, form)
      navigate(LIST_PATH)
    } catch (err) {
      const msg = err?.response?.data?.message || 'บันทึกไม่สำเร็จ'
      alert(msg)
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-md mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">แก้ไขธนาคาร</h1>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">กำลังโหลด...</div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name">ชื่อธนาคาร *</Label>
            <Input id="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          </div>
          <div className="flex items-center gap-3">
            <Label htmlFor="active">เปิดใช้งาน</Label>
            <input id="active" type="checkbox" checked={!!form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />
          </div>

          {bankError && (
            <div className="text-sm text-red-600">{bankError}</div>
          )}

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => navigate(LIST_PATH)}>
              ยกเลิก
            </Button>
            <Button type="submit" disabled={bankSaving}>
              {bankSaving ? 'กำลังบันทึก...' : 'บันทึก'}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}

