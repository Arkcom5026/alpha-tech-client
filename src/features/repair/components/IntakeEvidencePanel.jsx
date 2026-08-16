import React, { useCallback, useEffect, useRef, useState } from 'react';
import { feedback } from '@/design-system';
import repairApi from '../api/repairApi';
import MobileIntakeEvidenceFields from './MobileIntakeEvidenceFields';

const emptyDraft = {
  photos: [],
  confirmed: false,
  customerSignature: '',
  allowDataErase: false,
  allowFactoryReset: false,
  allowDisassembly: false,
  allowOutsourceRepair: false,
};

const draftFromEvidence = (evidence) => {
  const consent = evidence?.consent;
  if (!consent) return { ...emptyDraft };
  return {
    photos: [],
    confirmed: Boolean(consent.customerSignature && consent.signedAt),
    customerSignature: consent.customerSignature || '',
    allowDataErase: Boolean(consent.allowDataErase),
    allowFactoryReset: Boolean(consent.allowFactoryReset),
    allowDisassembly: Boolean(consent.allowDisassembly),
    allowOutsourceRepair: Boolean(consent.allowOutsourceRepair),
  };
};

const consentChanged = (draft, evidence) => {
  const consent = evidence?.consent;
  if (!consent) return Boolean(draft.confirmed);
  return (
    draft.customerSignature.trim() !== String(consent.customerSignature || '').trim() ||
    Boolean(draft.allowDataErase) !== Boolean(consent.allowDataErase) ||
    Boolean(draft.allowFactoryReset) !== Boolean(consent.allowFactoryReset) ||
    Boolean(draft.allowDisassembly) !== Boolean(consent.allowDisassembly) ||
    Boolean(draft.allowOutsourceRepair) !== Boolean(consent.allowOutsourceRepair)
  );
};

const hasRetryableDraft = (draft) => Boolean(
  draft && ((draft.photos || []).length || draft.confirmed)
);

const IntakeEvidencePanel = ({ repairJobId, warning, retryDraft, onSaved }) => {
  const retryPending = hasRetryableDraft(retryDraft);
  const [evidence, setEvidence] = useState(null);
  const [draft, setDraft] = useState(() => retryPending ? retryDraft : emptyDraft);
  const [editing, setEditing] = useState(retryPending);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [retryNotice, setRetryNotice] = useState(warning || '');
  const savingRef = useRef(false);
  const interactionLocked = loading || saving;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setEvidence(await repairApi.getIntakeEvidence(repairJobId));
      setError('');
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [repairJobId]);

  useEffect(() => {
    load();
  }, [load]);

  const beginEdit = () => {
    if (interactionLocked) return;
    setDraft(draftFromEvidence(evidence));
    setEditing(true);
  };

  const cancelEdit = () => {
    if (interactionLocked) return;
    setDraft(emptyDraft);
    setEditing(false);
    setRetryNotice('');
  };

  const shouldWriteConsent = consentChanged(draft, evidence);
  const canSave = Boolean(
    draft.photos.length ||
      (shouldWriteConsent && draft.confirmed && draft.customerSignature.trim())
  );

  const save = async () => {
    if (loading || saving || savingRef.current || !canSave) return;

    const repairJobIdSnapshot = repairJobId;
    const draftSnapshot = { ...draft, photos: [...draft.photos] };
    const shouldWriteConsentSnapshot = consentChanged(draftSnapshot, evidence);
    const payload = shouldWriteConsentSnapshot
      ? draftSnapshot
      : { ...draftSnapshot, confirmed: false };

    savingRef.current = true;
    setSaving(true);
    setError('');

    let saved = null;
    try {
      saved = await repairApi.saveIntakeEvidence(repairJobIdSnapshot, payload);
      setEvidence(saved);
      setDraft(emptyDraft);
      setEditing(false);
      setRetryNotice('');
      feedback.actionSuccess(
        'บันทึกหลักฐานการรับเครื่องเรียบร้อยแล้ว',
        `repair:intake-evidence:${repairJobIdSnapshot}:save:success`,
      );
    } catch (saveError) {
      const message = saveError?.message || 'บันทึกหลักฐานการรับเครื่องไม่สำเร็จ';
      setError(message);
      feedback.actionError(
        saveError,
        message,
        `repair:intake-evidence:${repairJobIdSnapshot}:save:error`,
      );
    } finally {
      savingRef.current = false;
      setSaving(false);
    }

    if (!saved) return;

    try {
      await onSaved?.(saved);
    } catch (reloadError) {
      const message = 'บันทึกหลักฐานสำเร็จแล้ว แต่ยังรีเฟรชข้อมูลใบงานไม่สำเร็จ กรุณากดโหลดใหม่';
      setError(message);
      feedback.actionError(
        reloadError,
        'บันทึกหลักฐานสำเร็จแล้ว แต่ยังรีเฟรชข้อมูลใบงานไม่สำเร็จ',
        `repair:intake-evidence:${repairJobIdSnapshot}:refresh:error`,
      );
    }
  };

  const consent = evidence?.consent;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">
            Intake Evidence
          </p>
          <h2 className="mt-1 text-lg font-black text-slate-950">หลักฐานการรับเครื่อง</h2>
          <p className="mt-1 text-xs text-slate-500">ภาพสภาพเครื่องและคำยืนยันแบบไร้เอกสาร</p>
        </div>
        <button
          type="button"
          disabled={interactionLocked}
          onClick={editing ? cancelEdit : beginEdit}
          className="min-h-10 rounded-xl border border-emerald-300 px-3 text-sm font-black text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {editing ? 'ยกเลิก' : '+ เพิ่มหลักฐาน'}
        </button>
      </div>

      {error ? (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-bold text-amber-800">
          {error}
        </p>
      ) : null}

      {retryNotice ? (
        <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          <p className="font-black">เปิดใบงานสำเร็จแล้ว แต่หลักฐานยังบันทึกไม่ครบ</p>
          <p className="mt-1">{retryNotice}</p>
          <p className="mt-1 text-xs">
            {retryPending
              ? 'รูปและคำยืนยันเดิมยังอยู่ในแบบฟอร์ม กดบันทึกอีกครั้งได้โดยไม่สร้างใบงานซ้ำ'
              : 'เปิดส่วนเพิ่มหลักฐานเพื่อบันทึกใหม่ได้โดยไม่สร้างใบงานซ้ำ'}
          </p>
        </div>
      ) : null}

      {!loading && evidence?.repairAsset ? (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          <p className="font-black">{evidence.repairAsset.displayName || '-'}</p>
          <p className="mt-1 text-xs">รุ่น / Model: {evidence.repairAsset.model || '-'}</p>
          <p className="mt-1 text-xs">Serial: {evidence.repairAsset.serialNumber || '-'}</p>
        </div>
      ) : null}

      {editing ? (
        <div className="mt-4 space-y-3">
          <fieldset disabled={interactionLocked} className="disabled:opacity-60">
            <MobileIntakeEvidenceFields value={draft} onChange={setDraft} />
          </fieldset>
          <button
            type="button"
            disabled={interactionLocked || !canSave}
            onClick={save}
            className="min-h-12 w-full rounded-xl bg-emerald-700 px-4 font-black text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? 'กำลังบันทึก...' : 'บันทึกหลักฐานดิจิทัล'}
          </button>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {consent ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-950">
              <p className="font-black">✓ ยืนยันโดย {consent.customerSignature}</p>
              <p className="mt-1 text-xs">
                เวลา {new Date(consent.signedAt).toLocaleString('th-TH')}
              </p>
            </div>
          ) : (
            <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-bold text-amber-800">
              ยังไม่มีคำยืนยันการรับเครื่อง
            </p>
          )}

          {evidence?.photos?.length ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
              {evidence.photos.map((photo, index) => (
                <a key={photo.id} href={photo.url} target="_blank" rel="noreferrer">
                  <img
                    src={photo.url}
                    alt={`หลักฐานรับเครื่อง ${index + 1}`}
                    className="aspect-square w-full rounded-xl border border-slate-200 object-cover"
                  />
                </a>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">{loading ? 'กำลังโหลด...' : 'ยังไม่มีภาพหลักฐาน'}</p>
          )}
        </div>
      )}
    </section>
  );
};

export default IntakeEvidencePanel;
