import React, { useEffect, useState } from 'react';
import {
  approvePartnerStoreApplication,
  listPartnerStoreApplications,
  rejectPartnerStoreApplication,
  startReviewPartnerStoreApplication,
} from '../api/partnerStoreApplicationApi';

const statuses = ['', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'WITHDRAWN'];
const messageFrom = (error) => error?.response?.data?.message || error?.message || 'ดำเนินการไม่สำเร็จ';

export default function PartnerStoreApplicationReviewPage() {
  const [status, setStatus] = useState('PENDING');
  const [items, setItems] = useState([]);
  const [notes, setNotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await listPartnerStoreApplications(status);
      setItems(response.data?.data || []);
    } catch (requestError) {
      setError(messageFrom(requestError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [status]);

  const run = async (item, action) => {
    setActingId(item.id);
    setError('');
    try {
      await action();
      await load();
    } catch (requestError) {
      setError(messageFrom(requestError));
    } finally {
      setActingId(null);
    }
  };

  const startReview = (item) => run(item, () =>
    startReviewPartnerStoreApplication(item.id, { note: notes[item.id] || undefined }));

  const approve = (item) => run(item, () =>
    approvePartnerStoreApplication(item.id, { reviewNote: notes[item.id] || undefined }));

  const reject = (item) => {
    const reviewNote = String(notes[item.id] || '').trim();
    if (!reviewNote) return setError('ระบุเหตุผลก่อนปฏิเสธใบสมัคร');
    return run(item, () => rejectPartnerStoreApplication(item.id, { reviewNote }));
  };

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">Partner governance</p>
        <h1 className="mt-2 text-2xl font-black text-slate-900">ใบสมัครร้านพาร์ตเนอร์</h1>
        <p className="mt-2 text-sm text-slate-500">การอนุมัติเป็นคำตัดสินด้าน Governance เท่านั้น ยังไม่เปิดร้านหรือเปิดใช้งานบัญชี</p>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold">
          {statuses.map((value) => <option key={value || 'ALL'} value={value}>{value || 'ทุกสถานะ'}</option>)}
        </select>
      </section>

      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p>}
      {loading && <p className="text-sm text-slate-500">กำลังโหลดใบสมัคร…</p>}
      {!loading && items.length === 0 && <p className="rounded-2xl bg-white p-6 text-sm text-slate-500">ไม่พบใบสมัครตามสถานะที่เลือก</p>}

      {items.map((item) => {
        const pending = item.status === 'PENDING';
        const underReview = item.status === 'UNDER_REVIEW';
        const acting = actingId === item.id;
        return (
          <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-black text-slate-900">{item.businessName}</h2>
                <p className="mt-1 text-xs font-mono text-slate-500">{item.applicationCode} · {item.status}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{item.contactName}</span>
            </div>
            <div className="mt-4 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
              <p><b>อีเมล:</b> {item.contactEmail || '-'}</p>
              <p><b>โทรศัพท์:</b> {item.contactPhone}</p>
              <p><b>ที่อยู่:</b> {item.businessAddress || '-'}</p>
              <p><b>ชื่อย่อหน้าร้าน:</b> {item.requestedStorefrontSlug || 'ระบบกำหนดภายหลัง'}</p>
            </div>

            {(pending || underReview) && (
              <div className={`mt-5 grid gap-3 border-t border-slate-100 pt-4 ${underReview ? 'md:grid-cols-[1fr_auto_auto]' : 'md:grid-cols-[1fr_auto]'}`}>
                <input value={notes[item.id] || ''} onChange={(event) => setNotes((current) => ({ ...current, [item.id]: event.target.value }))} placeholder={pending ? 'บันทึกเริ่มการพิจารณา (ถ้ามี)' : 'บันทึกการพิจารณา / เหตุผลปฏิเสธ'} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                {pending && <button disabled={acting} onClick={() => startReview(item)} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60">เริ่มตรวจสอบ</button>}
                {underReview && <button disabled={acting} onClick={() => approve(item)} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60">อนุมัติใบสมัคร</button>}
                {underReview && <button disabled={acting} onClick={() => reject(item)} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60">ปฏิเสธ</button>}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
