import React, { useEffect, useMemo, useState } from 'react';
import { getRepairCommunicationPreference, listRepairCommunicationActivities, recordRepairCommunicationActivity } from '../../communication/api/communicationApi';
import { dedupeRepairRead } from '../api/repairRequestCoordinator';

const ACTIVITY_TYPES = [
  ['CALL', 'โทรหาลูกค้า'], ['MESSAGE', 'ส่งข้อความ'], ['RECEIPT_SENT', 'ส่งใบรับงาน'],
  ['STATUS_SENT', 'แจ้งสถานะ'], ['CUSTOMER_REPLY', 'ลูกค้าตอบกลับ'], ['NOTE', 'บันทึกภายใน'],
];

const actionHref = (type, destination) => {
  if (!destination) return null;
  if (type === 'PHONE') return `tel:${destination}`;
  if (type === 'SMS') return `sms:${destination}`;
  if (type === 'EMAIL') return `mailto:${destination}`;
  if (/^https?:\/\//i.test(destination)) return destination;
  return null;
};

const RepairCommunicationPanel = ({ repairJobId }) => {
  const [preference, setPreference] = useState(null);
  const [activities, setActivities] = useState([]);
  const [draft, setDraft] = useState({ activityType: 'CALL', direction: 'OUTBOUND', note: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const destination = preference?.contactChannel?.address || preference?.destinationSnapshot || '';
  const href = useMemo(() => actionHref(preference?.channelType, destination), [preference, destination]);

  const load = async () => {
    try {
      const [nextPreference, nextActivities] = await Promise.all([
        dedupeRepairRead(
          `repair:communication-preference:${repairJobId}`,
          () => getRepairCommunicationPreference(repairJobId)
        ),
        dedupeRepairRead(
          `repair:communication-activities:${repairJobId}`,
          () => listRepairCommunicationActivities(repairJobId)
        ),
      ]);
      setPreference(nextPreference); setActivities(nextActivities || []); setError('');
    } catch (loadError) { setError(loadError.message); }
  };
  useEffect(() => { load(); }, [repairJobId]);

  const record = async () => {
    if (!preference?.channelType || saving) return;
    setSaving(true);
    try {
      await recordRepairCommunicationActivity(repairJobId, { ...draft, channelType: preference.channelType, destinationSnapshot: destination || null });
      setDraft((current) => ({ ...current, note: '' })); await load();
    } catch (saveError) { setError(saveError.message); }
    finally { setSaving(false); }
  };

  return (
    <section className="rounded-2xl border border-sky-200 bg-white p-4 shadow-sm md:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div><h3 className="font-black text-slate-950">การติดต่อลูกค้า</h3><p className="mt-1 text-xs text-slate-500">บันทึกการติดต่อด้วยมือ โดยไม่ผูกความสำเร็จของงานซ่อมกับผู้ให้บริการข้อความ</p></div>
        {preference ? <span className="w-fit rounded-full bg-sky-100 px-3 py-1 text-xs font-black text-sky-800">{preference.channelType}</span> : null}
      </div>
      {error ? <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      {!preference ? <p className="mt-4 text-sm text-slate-500">งานนี้ยังไม่ได้ระบุช่องทางที่ต้องการ สามารถดำเนินงานซ่อมต่อได้ตามปกติ</p> : (
        <>
          <div className="mt-4 rounded-xl bg-sky-50 p-4">
            <p className="font-black text-sky-950">{preference.profile?.displayName || preference.displayLabelSnapshot || preference.channelType}</p>
            <p className="mt-1 break-all text-sm text-sky-800">{destination || 'ไม่ได้ระบุปลายทาง'}</p>
            <p className="mt-1 text-xs text-sky-700">Consent: {preference.consentGranted ? 'ยินยอมแล้ว' : 'ยังไม่ยืนยัน'}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {href ? <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="min-h-11 rounded-xl bg-sky-700 px-4 py-3 text-sm font-black text-white">เปิดช่องทางติดต่อ</a> : null}
              {destination ? <button type="button" onClick={() => navigator.clipboard?.writeText(destination)} className="min-h-11 rounded-xl border border-sky-300 bg-white px-4 text-sm font-black text-sky-800">คัดลอก</button> : null}
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <select value={draft.activityType} onChange={(event) => setDraft({ ...draft, activityType: event.target.value })} className="min-h-12 rounded-xl border border-slate-300 bg-white px-4">{ACTIVITY_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
            <select value={draft.direction} onChange={(event) => setDraft({ ...draft, direction: event.target.value })} className="min-h-12 rounded-xl border border-slate-300 bg-white px-4"><option value="OUTBOUND">ร้านติดต่อลูกค้า</option><option value="INBOUND">ลูกค้าติดต่อร้าน</option><option value="INTERNAL">บันทึกภายใน</option></select>
            <textarea rows={2} value={draft.note} onChange={(event) => setDraft({ ...draft, note: event.target.value })} placeholder="หมายเหตุ (ถ้ามี)" className="rounded-xl border border-slate-300 px-4 py-3 sm:col-span-2" />
            <button type="button" disabled={saving} onClick={record} className="min-h-12 rounded-xl bg-slate-900 px-5 font-black text-white disabled:opacity-40 sm:col-span-2">{saving ? 'กำลังบันทึก' : 'บันทึกการติดต่อ'}</button>
          </div>
        </>
      )}
      {activities.length ? <div className="mt-5 border-t border-slate-200 pt-4"><h4 className="text-sm font-black">ประวัติการติดต่อ</h4><div className="mt-2 space-y-2">{activities.map((item) => <div key={item.id} className="rounded-xl bg-slate-50 p-3 text-sm"><div className="flex justify-between gap-3"><strong>{item.activityType} · {item.channelType}</strong><time className="shrink-0 text-xs text-slate-400">{new Date(item.occurredAt).toLocaleString('th-TH')}</time></div>{item.note ? <p className="mt-1 text-slate-600">{item.note}</p> : null}</div>)}</div></div> : null}
    </section>
  );
};

export default RepairCommunicationPanel;
