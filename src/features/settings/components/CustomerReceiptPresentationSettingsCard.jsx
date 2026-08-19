import React, { useEffect, useMemo, useState } from 'react'
import { Save } from 'lucide-react'

import { feedback } from '@/design-system/feedback'
import CustomerReceiptPresentationFooter from '@/features/customerReceipt/components/CustomerReceiptPresentationFooter'
import { customerReceiptTypographyPx } from '@/features/customerReceipt/presentation/customerReceiptPresentation'
import {
  normalizeDocumentPresentationConfig,
  upsertDocumentPresentationLayer,
} from '@/features/printing/presentation/presentationConfig'

const inputClassName = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100'
const labelClassName = 'mb-1.5 block text-xs font-black text-slate-600'
const blockContent = (layer, type) => String(layer?.blocks?.[type]?.content || '')

const CustomerReceiptPresentationSettingsCard = ({ branch, branchId, updateBranch, onBranchChange }) => {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ notes: '', customFooter: '', footerTypography: 'md' })

  const documentLayer = useMemo(() => {
    const normalized = normalizeDocumentPresentationConfig(branch?.documentHeaderConfig)
    return normalized?.documents?.CUSTOMER_RECEIPT || {}
  }, [branch?.documentHeaderConfig])

  useEffect(() => {
    setForm({
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
      const documentHeaderConfig = upsertDocumentPresentationLayer(branch.documentHeaderConfig, 'CUSTOMER_RECEIPT', {
        typography: { footer: form.footerTypography },
        blocks: {
          NOTES: { visible: Boolean(form.notes.trim()), content: form.notes },
          CUSTOM_FOOTER: { visible: Boolean(form.customFooter.trim()), content: form.customFooter },
        },
      })
      const updated = await updateBranch(branchId, { documentHeaderConfig })
      onBranchChange?.(updated || { ...branch, documentHeaderConfig })
      feedback.actionSuccess('บันทึกรูปแบบใบเสร็จรับเงินเรียบร้อยแล้ว', 'document-format-customer-receipt-save-success')
    } catch (error) {
      feedback.actionError(error, 'บันทึกรูปแบบใบเสร็จรับเงินไม่สำเร็จ', 'document-format-customer-receipt-save-error')
    } finally {
      setSaving(false)
    }
  }

  const previewContent = useMemo(() => ({
    notes: form.notes.trim(),
    customFooter: form.customFooter.trim(),
  }), [form.customFooter, form.notes])
  const previewPresentation = useMemo(() => ({ resolved: { typography: { footer: form.footerTypography } } }), [form.footerTypography])

  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-black text-slate-900">ใบเสร็จรับเงิน · ท้ายเอกสาร</p>
          <p className="mt-1 max-w-3xl text-[11px] font-medium leading-relaxed text-slate-400">
            กำหนดหมายเหตุและข้อความท้ายใบเสร็จ โดยไม่เปลี่ยนเลขเอกสาร ยอดเงิน ภาษี หรือข้อมูลทางกฎหมายของเอกสาร
          </p>
        </div>
        <button type="button" onClick={save} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">
          <Save className="h-4 w-4" /> {saving ? 'กำลังบันทึก...' : 'บันทึกใบเสร็จรับเงิน'}
        </button>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1fr_1.1fr]">
        <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/40 p-4">
          <div><label className={labelClassName}>หมายเหตุเริ่มต้น</label><textarea maxLength={240} rows={3} value={form.notes} onChange={(event) => patch('notes', event.target.value)} className={inputClassName} /></div>
          <div><label className={labelClassName}>ข้อความท้ายเอกสาร</label><textarea maxLength={240} rows={3} value={form.customFooter} onChange={(event) => patch('customFooter', event.target.value)} className={inputClassName} placeholder="เช่น ขอบคุณที่ใช้บริการ" /></div>
          <div>
            <label className={labelClassName}>ขนาดตัวอักษรส่วนท้าย</label>
            <select value={form.footerTypography} onChange={(event) => patch('footerTypography', event.target.value)} className={inputClassName}>
              <option value="xs">เล็กมาก</option><option value="sm">เล็ก</option><option value="md">มาตรฐาน</option><option value="lg">ใหญ่</option><option value="xl">ใหญ่มาก</option>
            </select>
          </div>
          <p className="text-[10px] font-medium leading-relaxed text-slate-400">จำกัดข้อความแต่ละช่องไม่เกิน 240 ตัวอักษร เพื่อรักษาพื้นที่สรุปยอดและลายเซ็นบน A4</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
          <div className="mb-3"><p className="text-xs font-black text-slate-800">ตัวอย่างท้ายใบเสร็จรับเงิน</p><p className="mt-0.5 text-[10px] font-medium text-slate-400">วางในพื้นที่สรุปหน้าสุดท้ายโดยไม่เปลี่ยน pagination</p></div>
          <div className="mx-auto rounded-xl border border-slate-300 bg-white p-4 shadow-inner">
            <div className="grid grid-cols-2 gap-5 text-[11px]">
              <div className="text-center"><p className="font-bold">จำนวนเงินเป็นตัวอักษร</p><p className="mt-1 text-sm font-semibold italic">(หนึ่งหมื่นเจ็ดร้อยบาทถ้วน)</p><CustomerReceiptPresentationFooter content={previewContent} fontSizePx={customerReceiptTypographyPx(previewPresentation, 'footer', 'md')} /></div>
              <div><p className="flex justify-between border-y border-slate-500 py-1"><span>รวมเงิน</span><span>10,000.00</span></p><p className="flex justify-between border-b border-slate-500 py-1"><span>ภาษีมูลค่าเพิ่ม 7%</span><span>700.00</span></p><p className="flex justify-between border-b border-slate-500 py-1 font-black"><span>รวมทั้งสิ้น</span><span>10,700.00</span></p></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CustomerReceiptPresentationSettingsCard
