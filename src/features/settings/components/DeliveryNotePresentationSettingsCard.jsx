import React, { useEffect, useMemo, useState } from 'react'
import { Save } from 'lucide-react'

import { feedback } from '@/design-system/feedback'
import DeliveryNotePresentationFooter from '@/features/deliveryNote/components/DeliveryNotePresentationFooter'
import { deliveryNoteTypographyPx } from '@/features/deliveryNote/presentation/deliveryNotePresentation'
import {
  normalizeDocumentPresentationConfig,
  upsertDocumentPresentationLayer,
} from '@/features/printing/presentation/presentationConfig'

const inputClassName = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100'
const labelClassName = 'mb-1.5 block text-xs font-black text-slate-600'
const blockContent = (layer, type) => String(layer?.blocks?.[type]?.content || '')

const DeliveryNotePresentationSettingsCard = ({ branch, branchId, updateBranch, onBranchChange }) => {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ deliveryTerms: '', notes: '', customFooter: '', footerTypography: 'md' })

  const documentLayer = useMemo(() => {
    const normalized = normalizeDocumentPresentationConfig(branch?.documentHeaderConfig)
    return normalized?.documents?.DELIVERY_NOTE || {}
  }, [branch?.documentHeaderConfig])

  useEffect(() => {
    setForm({
      deliveryTerms: blockContent(documentLayer, 'DELIVERY_TERMS'),
      notes: blockContent(documentLayer, 'NOTES'),
      customFooter: blockContent(documentLayer, 'CUSTOM_FOOTER'),
      footerTypography: documentLayer?.typography?.footer || 'md',
    })
  }, [documentLayer])

  const patch = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  const save = async () => {
    if (!branchId || !branch || saving) return
    setSaving(true)
    try {
      const documentHeaderConfig = upsertDocumentPresentationLayer(branch.documentHeaderConfig, 'DELIVERY_NOTE', {
        typography: { footer: form.footerTypography },
        blocks: {
          DELIVERY_TERMS: { visible: Boolean(form.deliveryTerms.trim()), content: form.deliveryTerms },
          NOTES: { visible: Boolean(form.notes.trim()), content: form.notes },
          CUSTOM_FOOTER: { visible: Boolean(form.customFooter.trim()), content: form.customFooter },
        },
      })
      const updated = await updateBranch(branchId, { documentHeaderConfig })
      onBranchChange?.(updated || { ...branch, documentHeaderConfig })
      feedback.actionSuccess('บันทึกรูปแบบใบส่งของเรียบร้อยแล้ว', 'document-format-delivery-note-save-success')
    } catch (error) {
      feedback.actionError(error, 'บันทึกรูปแบบใบส่งของไม่สำเร็จ', 'document-format-delivery-note-save-error')
    } finally {
      setSaving(false)
    }
  }

  const previewContent = useMemo(() => ({
    deliveryTerms: form.deliveryTerms.trim(),
    notes: form.notes.trim(),
    customFooter: form.customFooter.trim(),
  }), [form.customFooter, form.deliveryTerms, form.notes])
  const previewPresentation = useMemo(() => ({ resolved: { typography: { footer: form.footerTypography } } }), [form.footerTypography])

  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-black text-slate-900">ใบส่งของ · ท้ายเอกสาร</p>
          <p className="mt-1 max-w-3xl text-[11px] font-medium leading-relaxed text-slate-400">
            กำหนดเงื่อนไขการส่งมอบ หมายเหตุ และข้อความท้ายใบส่งของ โดยเอกสารที่ออกแล้วจะใช้ snapshot เดิมไม่เปลี่ยนตามการตั้งค่าใหม่
          </p>
        </div>
        <button type="button" onClick={save} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">
          <Save className="h-4 w-4" /> {saving ? 'กำลังบันทึก...' : 'บันทึกใบส่งของ'}
        </button>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1fr_1.1fr]">
        <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/40 p-4">
          <div><label className={labelClassName}>เงื่อนไขการส่งมอบ</label><textarea rows={3} value={form.deliveryTerms} onChange={(event) => patch('deliveryTerms', event.target.value)} className={inputClassName} placeholder="เช่น กรุณาตรวจสอบจำนวนและสภาพสินค้าก่อนลงนามรับสินค้า" /></div>
          <div><label className={labelClassName}>หมายเหตุเริ่มต้น</label><textarea rows={3} value={form.notes} onChange={(event) => patch('notes', event.target.value)} className={inputClassName} /></div>
          <div><label className={labelClassName}>ข้อความท้ายเอกสาร</label><textarea rows={3} value={form.customFooter} onChange={(event) => patch('customFooter', event.target.value)} className={inputClassName} placeholder="เช่น ขอบคุณที่ใช้บริการ" /></div>
          <div>
            <label className={labelClassName}>ขนาดตัวอักษรส่วนท้าย</label>
            <select value={form.footerTypography} onChange={(event) => patch('footerTypography', event.target.value)} className={inputClassName}>
              <option value="xs">เล็กมาก</option><option value="sm">เล็ก</option><option value="md">มาตรฐาน</option><option value="lg">ใหญ่</option><option value="xl">ใหญ่มาก</option>
            </select>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
          <div className="mb-3"><p className="text-xs font-black text-slate-800">ตัวอย่างท้ายใบส่งของ</p><p className="mt-0.5 text-[10px] font-medium text-slate-400">ใช้ renderer primitive เดียวกับหน้าพิมพ์จริง</p></div>
          <div className="mx-auto min-h-[180px] max-w-[760px] rounded-xl border border-slate-300 bg-white p-4 shadow-inner">
            <DeliveryNotePresentationFooter content={previewContent} fontSizePx={deliveryNoteTypographyPx(previewPresentation, 'footer', 'md')} />
            <div className="mt-8 grid grid-cols-3 gap-4 text-center text-[10px] text-slate-400">
              <div className="border-t border-slate-400 pt-2">ผู้รับของ</div><div className="border-t border-slate-400 pt-2">ผู้ส่งของ</div><div className="border-t border-slate-400 pt-2">ผู้ตรวจสอบ</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default DeliveryNotePresentationSettingsCard
