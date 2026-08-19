import React, { useEffect, useMemo, useState } from 'react'
import { Landmark, Plus, Save } from 'lucide-react'

import { feedback } from '@/design-system/feedback'
import {
  createStorePaymentAccount,
  listStorePaymentAccounts,
} from '@/features/printing/presentation/storePaymentAccountApi'
import {
  normalizeDocumentPresentationConfig,
  upsertDocumentPresentationLayer,
} from '@/features/printing/presentation/presentationConfig'
import QuotationPresentationFooter from '@/features/quotation/components/QuotationPresentationFooter'
import { quotationTypographyPx } from '@/features/quotation/presentation/quotationPresentation'
import DocumentPresentationLivePreview from '@/features/settings/documentPreview/DocumentPresentationLivePreview'

const inputClassName = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100'
const labelClassName = 'mb-1.5 block text-xs font-black text-slate-600'

const blockContent = (layer, type) => String(layer?.blocks?.[type]?.content || '')

const QuotationPresentationSettingsCard = ({ branch, branchId, updateBranch, onBranchChange }) => {
  const [accounts, setAccounts] = useState([])
  const [loadingAccounts, setLoadingAccounts] = useState(false)
  const [saving, setSaving] = useState(false)
  const [creatingAccount, setCreatingAccount] = useState(false)
  const [form, setForm] = useState({
    commercialTerms: '',
    paymentTerms: '',
    deliveryTerms: '',
    notes: '',
    customFooter: '',
    footerTypography: 'md',
    accountIds: [],
    showBankName: true,
    showAccountName: true,
    showAccountNumber: true,
  })
  const [accountDraft, setAccountDraft] = useState({
    displayName: '',
    bankName: '',
    accountName: '',
    accountNumber: '',
  })

  const documentLayer = useMemo(() => {
    const normalized = normalizeDocumentPresentationConfig(branch?.documentHeaderConfig)
    return normalized?.documents?.QUOTATION || {}
  }, [branch?.documentHeaderConfig])

  useEffect(() => {
    setForm({
      commercialTerms: blockContent(documentLayer, 'COMMERCIAL_TERMS'),
      paymentTerms: blockContent(documentLayer, 'PAYMENT_TERMS'),
      deliveryTerms: blockContent(documentLayer, 'DELIVERY_TERMS'),
      notes: blockContent(documentLayer, 'NOTES'),
      customFooter: blockContent(documentLayer, 'CUSTOM_FOOTER'),
      footerTypography: documentLayer?.typography?.footer || 'md',
      accountIds: Array.isArray(documentLayer?.paymentAccountSelection?.accountIds)
        ? documentLayer.paymentAccountSelection.accountIds.map(Number)
        : [],
      showBankName: documentLayer?.paymentAccountSelection?.showBankName !== false,
      showAccountName: documentLayer?.paymentAccountSelection?.showAccountName !== false,
      showAccountNumber: documentLayer?.paymentAccountSelection?.showAccountNumber !== false,
    })
  }, [documentLayer])

  const reloadAccounts = async () => {
    if (!branchId) return
    setLoadingAccounts(true)
    try {
      const rows = await listStorePaymentAccounts()
      setAccounts(Array.isArray(rows) ? rows : [])
    } catch (error) {
      feedback.actionError(error, 'โหลดบัญชีรับโอนของร้านไม่สำเร็จ', 'document-format-payment-account-load-error')
    } finally {
      setLoadingAccounts(false)
    }
  }

  useEffect(() => {
    reloadAccounts()
    // branchId is the tenant boundary; re-load only when the active store changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId])

  const patch = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const patchAccountDraft = (key, value) => setAccountDraft((current) => ({ ...current, [key]: value }))

  const selectedAccounts = useMemo(() => {
    const byId = new Map(accounts.map((account) => [Number(account.id), account]))
    return form.accountIds.map(Number).map((id) => byId.get(id)).filter(Boolean)
  }, [accounts, form.accountIds])

  const previewTerms = useMemo(() => ({
    commercialTerms: form.commercialTerms.trim(),
    paymentTerms: form.paymentTerms.trim(),
    deliveryTerms: form.deliveryTerms.trim(),
    notes: form.notes.trim(),
    closingNote: '',
    customFooter: form.customFooter.trim(),
  }), [form.commercialTerms, form.customFooter, form.deliveryTerms, form.notes, form.paymentTerms])

  const previewPresentation = useMemo(() => ({
    resolved: { typography: { footer: form.footerTypography } },
  }), [form.footerTypography])

  const previewLayer = useMemo(() => ({
    typography: { footer: form.footerTypography },
    blocks: {
      COMMERCIAL_TERMS: { visible: Boolean(form.commercialTerms.trim()), content: form.commercialTerms },
      PAYMENT_TERMS: { visible: Boolean(form.paymentTerms.trim()), content: form.paymentTerms },
      DELIVERY_TERMS: { visible: Boolean(form.deliveryTerms.trim()), content: form.deliveryTerms },
      NOTES: { visible: Boolean(form.notes.trim()), content: form.notes },
      CUSTOM_FOOTER: { visible: Boolean(form.customFooter.trim()), content: form.customFooter },
    },
    paymentAccountSelection: {
      accountIds: form.accountIds,
      showBankName: form.showBankName,
      showAccountName: form.showAccountName,
      showAccountNumber: form.showAccountNumber,
    },
  }), [form])

  const toggleAccount = (id) => {
    const normalizedId = Number(id)
    setForm((current) => ({
      ...current,
      accountIds: current.accountIds.includes(normalizedId)
        ? current.accountIds.filter((value) => value !== normalizedId)
        : [...current.accountIds, normalizedId],
    }))
  }

  const saveQuotationPresentation = async () => {
    if (!branchId || !branch || saving) return
    setSaving(true)
    try {
      const documentHeaderConfig = upsertDocumentPresentationLayer(
        branch.documentHeaderConfig,
        'QUOTATION',
        previewLayer,
      )
      const updated = await updateBranch(branchId, { documentHeaderConfig })
      onBranchChange?.(updated || { ...branch, documentHeaderConfig })
      feedback.actionSuccess('บันทึกรูปแบบใบเสนอราคาเรียบร้อยแล้ว', 'document-format-quotation-save-success')
    } catch (error) {
      feedback.actionError(error, 'บันทึกรูปแบบใบเสนอราคาไม่สำเร็จ', 'document-format-quotation-save-error')
    } finally {
      setSaving(false)
    }
  }

  const addPaymentAccount = async () => {
    if (creatingAccount) return
    const displayName = accountDraft.displayName.trim()
    const bankName = accountDraft.bankName.trim()
    const accountName = accountDraft.accountName.trim()
    const accountNumber = accountDraft.accountNumber.trim()
    if (!displayName || !bankName || !accountName || !accountNumber) {
      feedback.info('กรุณากรอกข้อมูลบัญชีรับโอนให้ครบ')
      return
    }

    setCreatingAccount(true)
    try {
      const code = `DOC-${Date.now().toString(36).toUpperCase()}`
      const created = await createStorePaymentAccount({
        code,
        displayName,
        bankName,
        accountName,
        accountNumber,
      })
      setAccounts((current) => [...current, created])
      setForm((current) => ({ ...current, accountIds: [...current.accountIds, Number(created.id)] }))
      setAccountDraft({ displayName: '', bankName: '', accountName: '', accountNumber: '' })
      feedback.actionSuccess('เพิ่มบัญชีรับโอนของร้านแล้ว', 'document-format-payment-account-create-success')
    } catch (error) {
      feedback.actionError(error, 'เพิ่มบัญชีรับโอนไม่สำเร็จ', 'document-format-payment-account-create-error')
    } finally {
      setCreatingAccount(false)
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-black text-slate-900">ใบเสนอราคา · ท้ายเอกสาร</p>
          <p className="mt-1 max-w-3xl text-[11px] font-medium leading-relaxed text-slate-400">
            ค่าในส่วนนี้ใช้เฉพาะใบเสนอราคา และจะถูก snapshot เมื่อตอนออกเอกสาร เพื่อไม่ให้เอกสารเก่าเปลี่ยนตามการตั้งค่าในอนาคต
          </p>
        </div>
        <button
          type="button"
          onClick={saveQuotationPresentation}
          disabled={saving || creatingAccount}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save className="h-4 w-4" /> {saving ? 'กำลังบันทึก...' : 'บันทึกใบเสนอราคา'}
        </button>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,0.92fr)_minmax(440px,1.08fr)]">
        <div className="space-y-5">
          <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/40 p-4">
            <div>
              <label className={labelClassName}>เงื่อนไขการเสนอราคา</label>
              <textarea rows={3} value={form.commercialTerms} onChange={(event) => patch('commercialTerms', event.target.value)} className={inputClassName} placeholder="เช่น ใบเสนอราคามีอายุ 30 วัน" />
            </div>
            <div>
              <label className={labelClassName}>เงื่อนไขการชำระเงิน</label>
              <textarea rows={3} value={form.paymentTerms} onChange={(event) => patch('paymentTerms', event.target.value)} className={inputClassName} placeholder="เช่น มัดจำ 50% ก่อนเริ่มงาน" />
            </div>
            <div>
              <label className={labelClassName}>เงื่อนไขการจัดส่ง</label>
              <textarea rows={3} value={form.deliveryTerms} onChange={(event) => patch('deliveryTerms', event.target.value)} className={inputClassName} placeholder="เช่น จัดส่งภายใน 7–14 วัน" />
            </div>
            <div>
              <label className={labelClassName}>หมายเหตุเริ่มต้น</label>
              <textarea rows={3} value={form.notes} onChange={(event) => patch('notes', event.target.value)} className={inputClassName} />
            </div>
            <div>
              <label className={labelClassName}>ข้อความท้ายเอกสาร</label>
              <textarea rows={3} value={form.customFooter} onChange={(event) => patch('customFooter', event.target.value)} className={inputClassName} placeholder="เช่น ขอบคุณที่ไว้วางใจ" />
            </div>
            <div>
              <label className={labelClassName}>ขนาดตัวอักษรส่วนท้าย</label>
              <select value={form.footerTypography} onChange={(event) => patch('footerTypography', event.target.value)} className={inputClassName}>
                <option value="xs">เล็กมาก</option>
                <option value="sm">เล็ก</option>
                <option value="md">มาตรฐาน</option>
                <option value="lg">ใหญ่</option>
                <option value="xl">ใหญ่มาก</option>
              </select>
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/40 p-4">
            <div className="flex items-center gap-2">
              <Landmark className="h-4 w-4 text-emerald-600" />
              <p className="text-xs font-black text-slate-800">บัญชีรับโอนของร้าน</p>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <input value={accountDraft.displayName} onChange={(event) => patchAccountDraft('displayName', event.target.value)} className={inputClassName} placeholder="ชื่อเรียก เช่น บัญชีหลัก" />
              <input value={accountDraft.bankName} onChange={(event) => patchAccountDraft('bankName', event.target.value)} className={inputClassName} placeholder="ธนาคาร" />
              <input value={accountDraft.accountName} onChange={(event) => patchAccountDraft('accountName', event.target.value)} className={inputClassName} placeholder="ชื่อบัญชี" />
              <input value={accountDraft.accountNumber} onChange={(event) => patchAccountDraft('accountNumber', event.target.value)} className={inputClassName} placeholder="เลขบัญชี" />
            </div>
            <button type="button" onClick={addPaymentAccount} disabled={creatingAccount} className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 hover:bg-emerald-100 disabled:opacity-50">
              <Plus className="h-3.5 w-3.5" /> {creatingAccount ? 'กำลังเพิ่ม...' : 'เพิ่มบัญชีรับโอน'}
            </button>

            <div className="space-y-2 border-t border-slate-200 pt-3">
              {loadingAccounts ? <p className="text-xs font-bold text-slate-400">กำลังโหลดบัญชี...</p> : null}
              {!loadingAccounts && !accounts.length ? <p className="text-xs font-medium text-slate-400">ยังไม่มีบัญชีรับโอนของร้าน</p> : null}
              {accounts.map((account) => (
                <label key={account.id} className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-3">
                  <input type="checkbox" checked={form.accountIds.includes(Number(account.id))} onChange={() => toggleAccount(account.id)} className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                  <span className="min-w-0 text-xs">
                    <span className="block font-black text-slate-800">{account.displayName}</span>
                    <span className="mt-0.5 block text-slate-500">{account.bankName} · {account.accountName} · {account.accountNumber}</span>
                  </span>
                </label>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-2 border-t border-slate-200 pt-3 sm:grid-cols-3">
              {[
                ['showBankName', 'แสดงธนาคาร'],
                ['showAccountName', 'แสดงชื่อบัญชี'],
                ['showAccountNumber', 'แสดงเลขบัญชี'],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 text-xs font-bold text-slate-600">
                  <input type="checkbox" checked={form[key]} onChange={(event) => patch(key, event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="xl:sticky xl:top-4 xl:self-start">
          <DocumentPresentationLivePreview
            branch={branch}
            documentPurpose="QUOTATION"
            draftLayer={previewLayer}
            title="ตัวอย่างใบเสนอราคา"
            footer={(
              <QuotationPresentationFooter
                terms={previewTerms}
                paymentAccounts={selectedAccounts}
                paymentDisplay={{
                  showBankName: form.showBankName,
                  showAccountName: form.showAccountName,
                  showAccountNumber: form.showAccountNumber,
                }}
                fontSizePx={quotationTypographyPx(previewPresentation, 'footer', 'md')}
              />
            )}
          />
        </div>
      </div>
    </section>
  )
}

export default QuotationPresentationSettingsCard
