import React, { useEffect, useMemo, useState } from 'react';
import { LockKeyhole, Save } from 'lucide-react';

import { feedback } from '@/design-system/feedback';
import StatutoryTaxPresentationFooter from '@/features/printing/presentation/StatutoryTaxPresentationFooter';
import DocumentPresentationLivePreview from '@/features/settings/documentPreview/DocumentPresentationLivePreview';
import {
  normalizeDocumentPresentationConfig,
  upsertDocumentPresentationLayer,
} from '@/features/printing/presentation/presentationConfig';
import { getDocumentPresentationCapability } from '@/features/printing/presentation/presentationCapabilityRegistry';

const inputClassName = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100';
const labelClassName = 'mb-1.5 block text-xs font-black text-slate-600';
const blockContent = (layer, type) => String(layer?.blocks?.[type]?.content || '');

const StatutoryPresentationSettingsCard = ({
  branch,
  branchId,
  updateBranch,
  onBranchChange,
  documentPurpose,
  title,
  description,
}) => {
  const capability = getDocumentPresentationCapability(documentPurpose);
  const allowNotes = Boolean(capability?.storeBlocks?.includes('NOTES'));
  const allowCustomFooter = Boolean(capability?.storeBlocks?.includes('CUSTOM_FOOTER'));
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    showLogo: true,
    logoPosition: 'left',
    textAlign: 'left',
    notes: '',
    customFooter: '',
  });

  const documentLayer = useMemo(() => {
    const normalized = normalizeDocumentPresentationConfig(branch?.documentHeaderConfig);
    return normalized?.documents?.[documentPurpose] || {};
  }, [branch?.documentHeaderConfig, documentPurpose]);

  useEffect(() => {
    setForm({
      showLogo: documentLayer?.header?.showLogo !== false,
      logoPosition: documentLayer?.header?.logoPosition || 'left',
      textAlign: documentLayer?.header?.textAlign || 'left',
      notes: allowNotes ? blockContent(documentLayer, 'NOTES') : '',
      customFooter: allowCustomFooter ? blockContent(documentLayer, 'CUSTOM_FOOTER') : '',
    });
  }, [allowCustomFooter, allowNotes, documentLayer]);

  const patch = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const buildDraftLayer = () => {
    const blocks = {};
    if (allowNotes) {
      blocks.NOTES = { visible: Boolean(form.notes.trim()), content: form.notes };
    }
    if (allowCustomFooter) {
      blocks.CUSTOM_FOOTER = { visible: Boolean(form.customFooter.trim()), content: form.customFooter };
    }
    return {
      header: {
        showLogo: form.showLogo,
        logoPosition: form.logoPosition,
        textAlign: form.textAlign,
      },
      blocks,
    };
  };

  const previewLayer = useMemo(
    () => buildDraftLayer(),
    // buildDraftLayer is intentionally a pure projection of these constrained fields.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allowCustomFooter, allowNotes, form.customFooter, form.logoPosition, form.notes, form.showLogo, form.textAlign],
  );

  const save = async () => {
    if (!branchId || !branch || saving) return;
    setSaving(true);
    try {
      const documentHeaderConfig = upsertDocumentPresentationLayer(
        branch.documentHeaderConfig,
        documentPurpose,
        previewLayer,
      );
      const updated = await updateBranch(branchId, { documentHeaderConfig });
      onBranchChange?.(updated || { ...branch, documentHeaderConfig });
      feedback.actionSuccess(`บันทึกรูปแบบ${title}เรียบร้อยแล้ว`, `document-format-${documentPurpose.toLowerCase()}-save-success`);
    } catch (error) {
      feedback.actionError(error, `บันทึกรูปแบบ${title}ไม่สำเร็จ`, `document-format-${documentPurpose.toLowerCase()}-save-error`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-black text-slate-900">{title} · รูปแบบที่ร้านกำหนดได้</p>
          <p className="mt-1 max-w-3xl text-[11px] font-medium leading-relaxed text-slate-400">{description}</p>
        </div>
        <button type="button" onClick={save} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">
          <Save className="h-4 w-4" /> {saving ? 'กำลังบันทึก...' : `บันทึก${title}`}
        </button>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(440px,1.1fr)]">
        <div className="space-y-4">
          <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/40 p-4">
            <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
              <input type="checkbox" checked={form.showLogo} onChange={(event) => patch('showLogo', event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
              <span className="text-xs font-black text-slate-700">แสดงโลโก้จากหัวเอกสารของร้าน</span>
            </label>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div><label className={labelClassName}>ตำแหน่งโลโก้</label><select value={form.logoPosition} onChange={(event) => patch('logoPosition', event.target.value)} className={inputClassName}><option value="left">ซ้าย</option><option value="center">กึ่งกลาง</option><option value="right">ขวา</option></select></div>
              <div><label className={labelClassName}>แนวข้อความหัวเอกสาร</label><select value={form.textAlign} onChange={(event) => patch('textAlign', event.target.value)} className={inputClassName}><option value="left">ชิดซ้าย</option><option value="center">กึ่งกลาง</option><option value="right">ขวา</option></select></div>
            </div>
            {allowNotes ? <div><label className={labelClassName}>หมายเหตุเพิ่มเติม</label><textarea rows={3} value={form.notes} onChange={(event) => patch('notes', event.target.value)} className={inputClassName} /></div> : null}
            {allowCustomFooter ? <div><label className={labelClassName}>ข้อความท้ายเอกสาร</label><textarea rows={3} value={form.customFooter} onChange={(event) => patch('customFooter', event.target.value)} className={inputClassName} /></div> : null}
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
            <div className="flex items-start gap-3">
              <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
              <div>
                <p className="text-xs font-black text-amber-900">ข้อมูลภาษีถูกล็อกโดยระบบ</p>
                <p className="mt-1 text-[11px] font-medium leading-relaxed text-amber-800/80">
                  ชื่อผู้ประกอบการ ที่อยู่จดทะเบียน เลขประจำตัวผู้เสียภาษี ผู้รับเอกสาร เลขที่/วันที่เอกสาร รายการ ยอดเงิน และข้อความบังคับทางภาษี ไม่ได้อ่านจากการตั้งค่าการ์ดนี้ แต่ใช้ข้อมูลที่ถูก snapshot ตอนออก TaxDocument เท่านั้น
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="xl:sticky xl:top-4 xl:self-start">
          <DocumentPresentationLivePreview
            branch={branch}
            documentPurpose={documentPurpose}
            draftLayer={previewLayer}
            title={`ตัวอย่าง${title}`}
            description={documentPurpose === 'SHORT_TAX_INVOICE'
              ? 'ตัวอย่างใช้สัดส่วน Thermal 80mm และสะท้อนค่าที่กำลังแก้โดยยังไม่ต้องบันทึก'
              : 'ตัวอย่าง A4 แสดง presentation ที่ร้านแก้ได้ พร้อมข้อมูลภาษีตัวอย่างที่ถูกล็อก'}
            footer={(
              <StatutoryTaxPresentationFooter
                notes={allowNotes ? form.notes.trim() : ''}
                customFooter={allowCustomFooter ? form.customFooter.trim() : ''}
                compact={documentPurpose === 'SHORT_TAX_INVOICE'}
              />
            )}
          />
        </div>
      </div>
    </section>
  );
};

export default StatutoryPresentationSettingsCard;