
// =============================
// client/src/features/bank/pages/CreateBankPage.jsx
// หน้าเพิ่ม/แก้ไข ธนาคาร (ไม่ใช้ Dialog) — ใช้ร่วมกับเส้นทาง
//   - สร้างใหม่:  /pos/settings/bank/create
//   - แก้ไข:     /pos/settings/bank/:id/edit

import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import useBankStore from '@/features/bank/store/bankStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const emptyBank = { name: '', active: true }

export function CreateBankPage() {
  // Local path constant so this file can live standalone
  const LIST_PATH = '/pos/settings/bank';
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  const {
    bankSaving,
    bankError,
    fetchBankByIdAction,
    createBankAction,
    updateBankAction,
  } = useBankStore()

  const [form, setForm] = useState(emptyBank)

  // โหลดข้อมูลเดิมเมื่อเป็นโหมดแก้ไข
  useEffect(() => {
    let active = true
    const load = async () => {
      if (!isEdit) return
      const data = await fetchBankByIdAction(Number(id))
      if (data && active) {
        setForm({
          name: data.name || '',
          active: typeof data.active === 'boolean' ? data.active : true,
        })
      }
    }
    load()
    return () => { active = false }
  }, [isEdit, id, fetchBankByIdAction])

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || form.name.trim() === '') {
      return alert('กรุณาระบุชื่อธนาคาร')
    }
    try {
      if (isEdit) {
        await updateBankAction(Number(id), form)
      } else {
        await createBankAction(form)
      }
      navigate(LIST_PATH)
    } catch (err) {
      const msg = err?.response?.data?.message || 'บันทึกไม่สำเร็จ'
      alert(msg)
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{isEdit ? 'แก้ไขธนาคาร' : 'เพิ่มธนาคาร'}</h1>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 max-w-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="name">ชื่อธนาคาร *</Label>
            <Input id="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          </div>
          <div className="flex items-center gap-3 pt-6">
            <Label htmlFor="active">เปิดใช้งาน</Label>
            <input id="active" type="checkbox" checked={!!form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />
          </div>
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
    </div>
  )
}
