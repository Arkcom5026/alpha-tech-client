import React, { useEffect, useState } from 'react';
import {
  approvePartnerStoreApplication,
  listPartnerStoreApplications,
  rejectPartnerStoreApplication,
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

  const approve = async (item) => {
    setActingId(item.id);
    setError('');
    try {
      await approvePartnerStoreApplication(item.id, {
        reviewNote: notes[item.id] || undefined,
      });
      await load();
    } catch (requestError) {
      setError(messageFrom(requestError));
    } finally {
      setActingId(null);
    }
  };

  const reject = async (item) => {
    const reviewNote = String(notes[item.id] || '').trim();
    if (!reviewNote) {
      setError('ระบุเหตุผลก่อนปฏิเสธใบสมัคร');
      return;
    }
    setActingId(item.id);
    setError('');
    try {
      await rejectPartnerStoreApplication(item.id, { reviewNote });
      await load();
    } catch (requestError) {
      setError(messageFrom(requestError));
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-500">Partner governance</p>
        <h1 className="mt-2 text-2xl font-black text-slate-900">ใบสมัครร้านพาร์ตเนอร์</h1>
        <p className="mt-2 text-sm text-slate-500">บัญชีเจ้าของร้านถูกสำรองจากใบสมัครแล้ว การอนุมัติจะเปิดบัญชีและสร้างร้านใน Transaction เดียว</p>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold">
          {statuses.map((value) => <option key={value || 'ALL'} value={value}>{value || 'ทุกสถานะ'}</option>)}
        </select>
      </section>

      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p>}
      {loading ? <p className="text-sm text-slate-500">กำลังโหลดใบสมัคร…</p> : null}
      {!loading && items.length === 0 ? <p className="rounded-2xl bg-white p-6 text-sm text-slate-500">ไม่พบใบสมัครตามสถานะที่เลือก</p> : null}

      {items.map((item) => {
        const actionable = item.status === 'PENDING' || item.status === 'UNDER_REVIEW';
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
            <dl className="mt-4 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
              <div><dt className="font-bold">บัญชีเจ้าของร้าน</dt><dd>{item.contactEmail}</dd></div>
              <div><dt className="font-bold">โทรศัพท์</dt><dd>{item.contactPhone}</dd></div>
              <div><dt className="font-bold">ที่อยู่</dt><dd>{item.businessAddress}</dd></div>
              <div><dt className="font-bold">ชื่อย่อหน้าร้าน</dt><dd>{item.requestedStorefrontSlug || 'ระบบกำหนดอัตโนมัติ'}</dd></div>
            </dl>
            {actionable && (
              <div className="mt-5 grid gap-3 border-t border-slate-100 pt-4 md:grid-cols-[1fr_auto_auto]">
                <input value={notes[item.id] || ''} onChange={(event) => setNotes((current) => ({ ...current, [item.id]: event.target.value }))} placeholder="บันทึกการพิจารณา / เหตุผลปฏิเสธ" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                <button disabled={acting} onClick={() => approve(item)} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60">อนุมัติและเปิดร้าน</button>
                <button disabled={acting} onClick={() => reject(item)} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60">ปฏิเสธ</button>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
