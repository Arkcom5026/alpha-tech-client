import React, { useEffect, useMemo, useState } from 'react'
import { Save } from 'lucide-react'

import { feedback } from '@/design-system/feedback'
import PurchaseOrderPresentationFooter from '@/features/purchaseOrder/components/PurchaseOrderPresentationFooter'
import { purchaseOrderTypographyPx } from '@/features/purchaseOrder/presentation/purchaseOrderPresentation'
import DocumentPresentationLivePreview from '@/features/settings/documentPreview/DocumentPresentationLivePreview'
import {
  normalizeDocumentPresentationConfig,
  upsertDocumentPresentationLayer,
} from '@/features/printing/presentation/presentationConfig'

const inputClassName = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100'
const labelClassName = 'mb-1.5 block text-xs font-black text-slate-600'
const blockContent = (layer, type) => String(layer?.blocks?.[type]?.content || '')

const PurchaseOrderPresentationSettingsCard = ({ branch, branchId, updateBranch, onBranchChange }) => {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ commercialTerms: '', paymentTerms: '', deliveryTerms: '', notes: '', customFooter: '', footerTypography: 'md' })

  const documentLayer = useMemo(() => {
    const normalized = normalizeDocumentPresentationConfig(branch?.documentHeaderConfig)
    return normalized?.documents?.PURCHASE_ORDER || {}
  }, [branch?.documentHeaderConfig])

  useEffect(() => {
    setForm({
      commercialTerms: blockContent(documentLayer, 'COMMERCIAL_TERMS'),
      paymentTerms: blockContent(documentLayer, 'PAYMENT_TERMS'),
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
      const documentHeaderConfig = upsertDocumentPresentationLayer(branch.documentHeaderConfig, 'PURCHASE_ORDER', {
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
      feedback.actionSuccess('บันทึกรูปแบบใบสั่งซื้อเรียบร้อยแล้ว', 'document-format-purchase-order-save-success')
    } catch (error) {
      feedback.actionError(error, 'บันทึกรูปแบบใบสั่งซื้อไม่สำเร็จ', 'document-format-purchase-order-save-error')
    } finally {
      setSaving(false)
    }
  }

  const previewContent = useMemo(() => ({
    commercialTerms: form.commercialTerms.trim(),
    paymentTerms: form.paymentTerms.trim(),
    deliveryTerms: form.deliveryTerms.trim(),
    notes: form.notes.trim(),
    customFooter: form.customFooter.trim(),
  }), [form])
  const previewPresentation = useMemo(() => ({ resolved: { typography: { footer: form.footerTypography } } }), [form.footerTypography])
  const previewLayer = useMemo(() => ({
    typography: { footer: form.footerTypography },
    blocks: {
      COMMERCIAL_TERMS: { visible: Boolean(form.commercialTerms.trim()), content: form.commercialTerms },
      PAYMENT_TERMS: { visible: Boolean(form.paymentTerms.trim()), content: form.paymentTerms },
      DELIVERY_TERMS: { visible: Boolean(form.deliveryTerms.trim()), content: form.deliveryTerms },
      NOTES: { visible: Boolean(form.notes.trim()), content: form.notes },
      CUSTOM_FOOTER: { visible: Boolean(form.customFooter.trim()), content: form.customFooter },
    },
  }), [form])

  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-black text-slate-900">ใบสั่งซื้อ · เงื่อนไขและท้ายเอกสาร</p>
          <p className="mt-1 max-w-3xl text-[11px] font-medium leading-relaxed text-slate-400">
            กำหนดข้อความทางการค้า การชำระเงิน การส่งมอบ และหมายเหตุ โดยหน้าพิมพ์จะใช้ snapshot ของรูปแบบที่ถูก freeze ไว้เมื่อเปิดเอกสารสำหรับพิมพ์ครั้งแรก
          </p>
        </div>
        <button type="button" onClick={save} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">
          <Save className="h-4 w-4" /> {saving ? 'กำลังบันทึก...' : 'บันทึกใบสั่งซื้อ'}
        </button>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(440px,1.1fr)]">
        <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/40 p-4">
          <div><label className={labelClassName}>เงื่อนไขทางการค้า</label><textarea rows={2} value={form.commercialTerms} onChange={(e) => patch('commercialTerms', e.target.value)} className={inputClassName} /></div>
          <div><label className={labelClassName}>เงื่อนไขการชำระเงิน</label><textarea rows={2} value={form.paymentTerms} onChange={(e) => patch('paymentTerms', e.target.value)} className={inputClassName} /></div>
          <div><label className={labelClassName}>เงื่อนไขการส่งมอบ</label><textarea rows={2} value={form.deliveryTerms} onChange={(e) => patch('deliveryTerms', e.target.value)} className={inputClassName} /></div>
          <div><label className={labelClassName}>หมายเหตุเริ่มต้น</label><textarea rows={2} value={form.notes} onChange={(e) => patch('notes', e.target.value)} className={inputClassName} /></div>
          <div><label className={labelClassName}>ข้อความท้ายเอกสาร</label><textarea rows={2} value={form.customFooter} onChange={(e) => patch('customFooter', e.target.value)} className={inputClassName} /></div>
          <div><label className={labelClassName}>ขนาดตัวอักษรส่วนท้าย</label><select value={form.footerTypography} onChange={(e) => patch('footerTypography', e.target.value)} className={inputClassName}><option value="xs">เล็กมาก</option><option value="sm">เล็ก</option><option value="md">มาตรฐาน</option><option value="lg">ใหญ่</option><option value="xl">ใหญ่มาก</option></select></div>
        </div>

        <div className="xl:sticky xl:top-4 xl:self-start">
          <DocumentPresentationLivePreview
            branch={branch}
            documentPurpose="PURCHASE_ORDER"
            draftLayer={previewLayer}
            title="ตัวอย่างใบสั่งซื้อ"
            footer={(
              <PurchaseOrderPresentationFooter
                content={previewContent}
                fontSizePx={purchaseOrderTypographyPx(previewPresentation, 'footer', 'md')}
              />
            )}
          />
        </div>
      </div>
    </section>
  )
}

export default PurchaseOrderPresentationSettingsCard
