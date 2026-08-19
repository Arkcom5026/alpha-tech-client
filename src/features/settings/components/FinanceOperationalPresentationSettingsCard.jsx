import React, { useEffect, useMemo, useState } from 'react';
import { Save } from 'lucide-react';

import { feedback } from '@/design-system/feedback';
import FinanceOperationalPresentationFooter from '@/features/printing/presentation/FinanceOperationalPresentationFooter';
import DocumentPresentationLivePreview from '@/features/settings/documentPreview/DocumentPresentationLivePreview';
import {
  normalizeDocumentPresentationConfig,
  upsertDocumentPresentationLayer,
} from '@/features/printing/presentation/presentationConfig';

const inputClassName = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100';
const labelClassName = 'mb-1.5 block text-xs font-black text-slate-600';
const blockContent = (layer, type) => String(layer?.blocks?.[type]?.content || '');

const FinanceOperationalPresentationSettingsCard = ({
  branch,
  branchId,
  updateBranch,
  onBranchChange,
  documentPurpose,
  title,
  description,
  systemNotices = [],
}) => {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ notes: '', customFooter: '' });

  const documentLayer = useMemo(() => {
    const normalized = normalizeDocumentPresentationConfig(branch?.documentHeaderConfig);
    return normalized?.documents?.[documentPurpose] || {};
  }, [branch?.documentHeaderConfig, documentPurpose]);

  useEffect(() => {
    setForm({
      notes: blockContent(documentLayer, 'NOTES'),
      customFooter: blockContent(documentLayer, 'CUSTOM_FOOTER'),
    });
  }, [documentLayer]);

  const patch = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const save = async () => {
    if (!branchId || !branch || saving) return;
    setSaving(true);
    try {
      const documentHeaderConfig = upsertDocumentPresentationLayer(branch.documentHeaderConfig, documentPurpose, {
        blocks: {
          NOTES: { visible: Boolean(form.notes.trim()), content: form.notes },
          CUSTOM_FOOTER: { visible: Boolean(form.customFooter.trim()), content: form.customFooter },
        },
      });
      const updated = await updateBranch(branchId, { documentHeaderConfig });
      onBranchChange?.(updated || { ...branch, documentHeaderConfig });
      feedback.actionSuccess(`บันทึกรูปแบบ${title}เรียบร้อยแล้ว`, `document-format-${documentPurpose.toLowerCase()}-save-success`);
    } catch (error) {
      feedback.actionError(error, `บันทึกรูปแบบ${title}ไม่สำเร็จ`, `document-format-${documentPurpose.toLowerCase()}-save-error`);
    } finally {
      setSaving(false);
    }
  };

  const previewLayer = useMemo(() => ({
    blocks: {
      NOTES: { visible: Boolean(form.notes.trim()), content: form.notes },
      CUSTOM_FOOTER: { visible: Boolean(form.customFooter.trim()), content: form.customFooter },
    },
  }), [form.customFooter, form.notes]);

  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-black text-slate-900">{title} · ท้ายเอกสาร</p>
          <p className="mt-1 max-w-3xl text-[11px] font-medium leading-relaxed text-slate-400">{description}</p>
        </div>
        <button type="button" onClick={save} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">
          <Save className="h-4 w-4" /> {saving ? 'กำลังบันทึก...' : `บันทึก${title}`}
        </button>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(440px,1.1fr)]">
        <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/40 p-4">
          <div><label className={labelClassName}>หมายเหตุเริ่มต้น</label><textarea maxLength={240} rows={3} value={form.notes} onChange={(event) => patch('notes', event.target.value)} className={inputClassName} /></div>
          <div><label className={labelClassName}>ข้อความท้ายเอกสาร</label><textarea maxLength={240} rows={3} value={form.customFooter} onChange={(event) => patch('customFooter', event.target.value)} className={inputClassName} placeholder="เช่น ขอบคุณที่ใช้บริการ" /></div>
          <p className="text-[10px] font-medium leading-relaxed text-slate-400">ข้อความระบบด้านล่างเป็นข้อมูล authority ของเอกสาร ระบบเป็นผู้กำหนดและร้านไม่สามารถแก้ไขหรือซ่อนได้</p>
        </div>

        <div className="xl:sticky xl:top-4 xl:self-start">
          <DocumentPresentationLivePreview
            branch={branch}
            documentPurpose={documentPurpose}
            draftLayer={previewLayer}
            title={`ตัวอย่าง${title}`}
            footer={(
              <FinanceOperationalPresentationFooter
                notes={form.notes.trim()}
                customFooter={form.customFooter.trim()}
                systemNotices={systemNotices}
              />
            )}
          />
        </div>
      </div>
    </section>
  );
};

export default FinanceOperationalPresentationSettingsCard;