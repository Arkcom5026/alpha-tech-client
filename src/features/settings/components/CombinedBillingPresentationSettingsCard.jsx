import React, { useEffect, useMemo, useState } from 'react'
import { Save } from 'lucide-react'

import { feedback } from '@/design-system/feedback'
import CombinedBillingPresentationFooter from '@/features/combinedBilling/detail/workspace/components/CombinedBillingPresentationFooter'
import {
  normalizeDocumentPresentationConfig,
  upsertDocumentPresentationLayer,
} from '@/features/printing/presentation/presentationConfig'

const inputClassName = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100'
const labelClassName = 'mb-1.5 block text-xs font-black text-slate-600'
const blockContent = (layer, type) => String(layer?.blocks?.[type]?.content || '')
const fontPx = Object.freeze({ xs: 9, sm: 10, md: 11, lg: 12, xl: 13 })

const CombinedBillingPresentationSettingsCard = ({ branch, branchId, updateBranch, onBranchChange }) => {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ commercialTerms: '', paymentTerms: '', deliveryTerms: '', notes: '', customFooter: '', footerTypography: 'md' })
  const layer = useMemo(() => normalizeDocumentPresentationConfig(branch?.documentHeaderConfig)?.documents?.COMBINED_BILLING || {}, [branch?.documentHeaderConfig])

  useEffect(() => {
    setForm({
      commercialTerms: blockContent(layer, 'COMMERCIAL_TERMS'),
      paymentTerms: blockContent(layer, 'PAYMENT_TERMS'),
      deliveryTerms: blockContent(layer, 'DELIVERY_TERMS'),
      notes: blockContent(layer, 'NOTES'),
      customFooter: blockContent(layer, 'CUSTOM_FOOTER'),
      footerTypography: layer?.typography?.footer || 'md',
    })
  }, [layer])

  const patch = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const save = async () => {
    if (!branchId || !branch || saving) return
    setSaving(true)
    try {
      const documentHeaderConfig = upsertDocumentPresentationLayer(branch.documentHeaderConfig, 'COMBINED_BILLING', {
        typography: { footer: form.footerTypography },
        blocks: {
          COMMERCIAL_TERMS: { visible: Boolean(form.commercialTerms.trim()), content: form.commercialTerms },
          PAYMENT_TERMS: { visible: Boolean(form.paymentTerms.trim()), content: form.paymentTerms },
          DELIVERY_TERMS: { visible: Boolean(form.deliveryTerms.trim()), content: form.deliveryTerms },
          NOTES: { visible: Boolean(form.notes.trim()), content: form.notes },
          CUSTOM_FOOTER: { visible: Boolean(form.customFooter.trim()), content: form.customFooter },
        },
      })
      const updated = await updateBranch(branchId, { documentHeaderConfig })
      onBranchChange?.(updated || { ...branch, documentHeaderConfig })
      feedback.actionSuccess('บันทึกรูปแบบเอกสารรวมบิลเรียบร้อยแล้ว', 'document-format-combined-billing-save-success')
    } catch (error) {
      feedback.actionError(error, 'บันทึกรูปแบบเอกสารรวมบิลไม่สำเร็จ', 'document-format-combined-billing-save-error')
    } finally {
      setSaving(false)
    }
  }

  const content = {
    commercialTerms: form.commercialTerms.trim(), paymentTerms: form.paymentTerms.trim(),
    deliveryTerms: form.deliveryTerms.trim(), notes: form.notes.trim(), customFooter: form.customFooter.trim(),
  }

  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div><p className="text-sm font-black text-slate-900">เอกสารรวมบิล · เงื่อนไขและท้ายเอกสาร</p><p className="mt-1 max-w-3xl text-[11px] font-medium leading-relaxed text-slate-400">กำหนดข้อความเสริมของเอกสารรวมบิล โดยข้อมูลผู้ออกเอกสารจริงมาจาก Store Presentation และไม่ใช้ข้อมูลตัวอย่าง hard-coded อีกต่อไป</p></div>
        <button type="button" onClick={save} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white transition hover:bg-emerald-700 disabled:opacity-50"><Save className="h-4 w-4" />{saving ? 'กำลังบันทึก...' : 'บันทึกเอกสารรวมบิล'}</button>
      </div>
      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1fr_1.1fr]">
        <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/40 p-4">
          <div><label className={labelClassName}>เงื่อนไขทางการค้า</label><textarea rows={2} value={form.commercialTerms} onChange={(e) => patch('commercialTerms', e.target.value)} className={inputClassName} /></div>
          <div><label className={labelClassName}>เงื่อนไขการชำระเงิน</label><textarea rows={2} value={form.paymentTerms} onChange={(e) => patch('paymentTerms', e.target.value)} className={inputClassName} /></div>
          <div><label className={labelClassName}>เงื่อนไขการส่งมอบ</label><textarea rows={2} value={form.deliveryTerms} onChange={(e) => patch('deliveryTerms', e.target.value)} className={inputClassName} /></div>
          <div><label className={labelClassName}>หมายเหตุเริ่มต้น</label><textarea rows={2} value={form.notes} onChange={(e) => patch('notes', e.target.value)} className={inputClassName} /></div>
          <div><label className={labelClassName}>ข้อความท้ายเอกสาร</label><textarea rows={2} value={form.customFooter} onChange={(e) => patch('customFooter', e.target.value)} className={inputClassName} /></div>
          <div><label className={labelClassName}>ขนาดตัวอักษรส่วนท้าย</label><select value={form.footerTypography} onChange={(e) => patch('footerTypography', e.target.value)} className={inputClassName}><option value="xs">เล็กมาก</option><option value="sm">เล็ก</option><option value="md">มาตรฐาน</option><option value="lg">ใหญ่</option><option value="xl">ใหญ่มาก</option></select></div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4"><div className="mb-3"><p className="text-xs font-black text-slate-800">ตัวอย่างท้ายเอกสารรวมบิล</p><p className="mt-0.5 text-[10px] text-slate-400">ใช้ semantic footer component เดียวกับหน้าพิมพ์</p></div><div className="min-h-[180px] rounded-xl border border-slate-300 bg-white p-4 shadow-inner"><CombinedBillingPresentationFooter content={content} fontSizePx={fontPx[form.footerTypography] || 11} /></div></div>
      </div>
    </section>
  )
}

export default CombinedBillingPresentationSettingsCard
