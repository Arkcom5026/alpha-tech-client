import React, { useCallback, useEffect, useState } from 'react';
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

const IntakeEvidencePanel = ({ repairJobId, warning }) => {
  const [evidence, setEvidence] = useState(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(warning || '');

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
    setDraft(draftFromEvidence(evidence));
    setEditing(true);
  };

  const cancelEdit = () => {
    setDraft(emptyDraft);
    setEditing(false);
  };

  const save = async () => {
    setLoading(true);
    setError('');
    try {
      const saved = await repairApi.saveIntakeEvidence(repairJobId, draft);
      setEvidence(saved);
      setDraft(emptyDraft);
      setEditing(false);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setLoading(false);
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
          onClick={editing ? cancelEdit : beginEdit}
          className="min-h-10 rounded-xl border border-emerald-300 px-3 text-sm font-black text-emerald-700"
        >
          {editing ? 'ยกเลิก' : '+ เพิ่มหลักฐาน'}
        </button>
      </div>

      {error ? (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-bold text-amber-800">
          {error}
        </p>
      ) : null}

      {editing ? (
        <div className="mt-4 space-y-3">
          <MobileIntakeEvidenceFields value={draft} onChange={setDraft} />
          <button
            type="button"
            disabled={loading || (!draft.photos.length && !draft.confirmed)}
            onClick={save}
            className="min-h-12 w-full rounded-xl bg-emerald-700 px-4 font-black text-white disabled:opacity-40"
          >
            {loading ? 'กำลังบันทึก...' : 'บันทึกหลักฐานดิจิทัล'}
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
