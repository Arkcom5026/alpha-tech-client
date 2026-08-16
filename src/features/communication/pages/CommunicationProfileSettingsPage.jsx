import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'react-qr-code';
import { listCommunicationProfiles, saveCommunicationProfile } from '../api/communicationApi';
import { MobileActionBar, MobileWorkspace, MobileWorkspaceSection } from '@/components/workspace/MobileWorkspace';
import { feedback } from '@/design-system/feedback';
import { useAuthStore } from '@/features/auth/store/authStore';

const CHANNELS = ['LINE', 'FACEBOOK', 'PHONE', 'SMS', 'EMAIL', 'OTHER'];
const emptyDraft = { channelType: 'LINE', displayName: '', address: '', publicUri: '', qrPayload: '', enabled: true };

const CommunicationProfileSettingsPage = () => {
  const [profiles, setProfiles] = useState([]);
  const [draft, setDraft] = useState(emptyDraft);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const savingRef = useRef(false);
  const canManage = useAuthStore((state) => state.canManageCommunicationSelector?.() || false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setProfiles(await listCommunicationProfiles() || []);
      return { ok: true };
    } catch (loadError) {
      const message = loadError?.message || 'โหลดช่องทางติดต่อไม่สำเร็จ';
      setError(message);
      return { ok: false, error: loadError, message };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const patch = (field, value) => {
    if (savingRef.current) return;
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const edit = (profile) => {
    if (savingRef.current) return;
    setDraft({
      channelType: profile.channelType,
      displayName: profile.displayName || '',
      address: profile.address || '',
      publicUri: profile.publicUri || '',
      qrPayload: profile.qrPayload || '',
      enabled: profile.enabled !== false,
    });
  };

  const clearDraft = () => {
    if (savingRef.current) return;
    setDraft(emptyDraft);
  };

  const save = async () => {
    const displayName = draft.displayName.trim();
    if (!canManage || !displayName || saving || savingRef.current) return;

    const payload = {
      ...draft,
      displayName,
      address: draft.address.trim(),
      publicUri: draft.publicUri.trim(),
      qrPayload: draft.qrPayload.trim(),
    };

    savingRef.current = true;
    setSaving(true);
    setError('');
    try {
      await saveCommunicationProfile(payload);
      feedback.actionSuccess(
        'บันทึกช่องทางติดต่อเรียบร้อยแล้ว',
        `communication-profile:${payload.channelType}:${payload.displayName}:save:success`,
      );
      setDraft(emptyDraft);

      const refreshResult = await load();
      if (!refreshResult?.ok) {
        feedback.actionError(
          refreshResult?.error,
          'บันทึกช่องทางติดต่อสำเร็จแล้ว แต่รีเฟรชรายการช่องทางไม่สำเร็จ',
          `communication-profile:${payload.channelType}:${payload.displayName}:refresh:error`,
        );
      }
    } catch (saveError) {
      const message = saveError?.response?.data?.message || saveError?.message || 'บันทึกช่องทางติดต่อไม่สำเร็จ';
      setError(message);
      feedback.actionError(
        saveError,
        message,
        `communication-profile:${payload.channelType}:${payload.displayName}:save:error`,
      );
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const previewValue = draft.qrPayload.trim() || draft.publicUri.trim() || draft.address.trim();
  const mutationBusy = saving || savingRef.current;

  return (
    <MobileWorkspace eyebrow="Branch Communication" title="ช่องทางติดต่อของสาขา" description="ตั้งค่า QR และช่องทางที่ลูกค้าใช้ติดต่อสาขานี้ ข้อมูลทุกชุดแยกตามสาขาปัจจุบัน">
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div> : null}
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.7fr)]">
        <MobileWorkspaceSection title="ช่องทางที่เปิดใช้งาน" description="แตะรายการเพื่อแก้ไข โดยชื่อและประเภทช่องทางเป็นตัวระบุ profile">
          {loading ? <p className="text-sm text-slate-500">กำลังโหลด...</p> : profiles.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {profiles.map((profile) => {
                const qrValue = profile.qrPayload || profile.publicUri || profile.address;
                return <button key={profile.id} type="button" onClick={() => edit(profile)} disabled={mutationBusy} className="flex min-h-24 items-center gap-3 rounded-xl border border-slate-200 p-3 text-left hover:border-emerald-400 disabled:cursor-not-allowed disabled:opacity-50">
                  {qrValue ? <div className="shrink-0 bg-white p-1"><QRCode value={qrValue} size={68} level="M" /></div> : <div className="flex h-[76px] w-[76px] items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">ไม่มี QR</div>}
                  <span className="min-w-0"><strong className="block truncate">{profile.displayName}</strong><span className="text-xs text-slate-500">{profile.channelType} · {profile.enabled ? 'เปิดใช้' : 'ปิดใช้'}</span></span>
                </button>;
              })}
            </div>
          ) : <p className="text-sm text-slate-500">ยังไม่มีช่องทางติดต่อของสาขานี้</p>}
        </MobileWorkspaceSection>

        <MobileWorkspaceSection title="เพิ่มหรือแก้ไขช่องทาง" description="ใช้ QR payload เมื่อค่าที่เข้ารหัสต่างจากลิงก์หรือชื่อบัญชี">
          {!canManage ? <p className="mb-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">บัญชีนี้ดูช่องทางได้ แต่ไม่มีสิทธิ์แก้การตั้งค่าของสาขา</p> : null}
          <fieldset disabled={!canManage || mutationBusy} className="grid gap-3 disabled:opacity-60">
            <label className="space-y-1"><span className="text-xs font-black text-slate-600">ประเภท</span><select value={draft.channelType} onChange={(event) => patch('channelType', event.target.value)} className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4">{CHANNELS.map((type) => <option key={type}>{type}</option>)}</select></label>
            <label className="space-y-1"><span className="text-xs font-black text-slate-600">ชื่อที่แสดง *</span><input value={draft.displayName} onChange={(event) => patch('displayName', event.target.value)} className="min-h-12 w-full rounded-xl border border-slate-300 px-4" placeholder="เช่น LINE สาขาหลัก" /></label>
            <label className="space-y-1"><span className="text-xs font-black text-slate-600">หมายเลข / บัญชี</span><input value={draft.address} onChange={(event) => patch('address', event.target.value)} className="min-h-12 w-full rounded-xl border border-slate-300 px-4" /></label>
            <label className="space-y-1"><span className="text-xs font-black text-slate-600">Public link</span><input value={draft.publicUri} onChange={(event) => patch('publicUri', event.target.value)} className="min-h-12 w-full rounded-xl border border-slate-300 px-4" placeholder="https://..." /></label>
            <label className="space-y-1"><span className="text-xs font-black text-slate-600">QR payload</span><textarea rows={3} value={draft.qrPayload} onChange={(event) => patch('qrPayload', event.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3" /></label>
            {previewValue ? <div className="mx-auto rounded-xl border border-slate-200 bg-white p-3"><QRCode value={previewValue} size={132} level="M" /></div> : null}
            <label className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 text-sm font-bold"><input type="checkbox" checked={draft.enabled} onChange={(event) => patch('enabled', event.target.checked)} /> เปิดใช้งาน</label>
          </fieldset>
        </MobileWorkspaceSection>
      </div>
      <MobileActionBar>
        <button type="button" onClick={clearDraft} disabled={mutationBusy} className="rounded-xl border border-slate-300 bg-white px-5 font-black text-slate-700 disabled:cursor-not-allowed disabled:opacity-50">ล้างฟอร์ม</button>
        <button type="button" disabled={!canManage || !draft.displayName.trim() || mutationBusy} onClick={save} className="rounded-xl bg-emerald-700 px-5 font-black text-white disabled:opacity-40">{saving ? 'กำลังบันทึก' : 'บันทึกช่องทาง'}</button>
      </MobileActionBar>
    </MobileWorkspace>
  );
};

export default CommunicationProfileSettingsPage;
