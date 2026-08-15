import React, { useEffect, useState } from 'react';
import { ConfirmActionDialog } from '@/design-system/composites';
import { feedback } from '@/design-system/feedback';
import {
  approvePartnerStoreApplication,
  listPartnerStoreApplications,
  rejectPartnerStoreApplication,
  startReviewPartnerStoreApplication,
} from '../api/partnerStoreApplicationApi';
import { provisionPartnerStoreApplication } from '../api/partnerStoreProvisioningApi';
import { issuePartnerStoreActivationInvitation } from '../api/partnerStoreActivationApi';

const statuses = ['', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'WITHDRAWN'];
const messageFrom = (error) => error?.response?.data?.error?.message || error?.response?.data?.message || error?.message || 'ดำเนินการไม่สำเร็จ';

const ACTION_META = {
  approve: { title: 'อนุมัติใบสมัครร้านพาร์ตเนอร์', confirmLabel: 'อนุมัติใบสมัคร', intent: 'primary' },
  reject: { title: 'ปฏิเสธใบสมัครร้านพาร์ตเนอร์', confirmLabel: 'ปฏิเสธใบสมัคร', intent: 'destructive' },
  provision: { title: 'สร้างร้านพาร์ตเนอร์', confirmLabel: 'สร้างร้าน', intent: 'primary' },
};

export default function PartnerStoreApplicationReviewPage() {
  const [status, setStatus] = useState('PENDING');
  const [items, setItems] = useState([]);
  const [notes, setNotes] = useState({});
  const [activationLinks, setActivationLinks] = useState({});
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);
  const [error, setError] = useState('');
  const [pendingAction, setPendingAction] = useState(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await listPartnerStoreApplications(status);
      setItems(response.data?.data || []);
    } catch (requestError) {
      const message = messageFrom(requestError);
      setError(message);
      feedback.actionError(requestError, 'โหลดใบสมัครร้านพาร์ตเนอร์ไม่สำเร็จ', 'partner-store-review:load:error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [status]);

  const run = async (item, action, successMessage, eventKey) => {
    if (!item || actingId) return null;
    setActingId(item.id);
    setError('');
    try {
      const result = await action();
      feedback.actionSuccess(successMessage, `${eventKey}:success`);
      await load();
      return result;
    } catch (requestError) {
      const message = messageFrom(requestError);
      setError(message);
      feedback.actionError(requestError, `${successMessage.replace('เรียบร้อยแล้ว', '')}ไม่สำเร็จ`, `${eventKey}:error`);
      return null;
    } finally {
      setActingId(null);
    }
  };

  const startReview = (item) => run(
    item,
    () => startReviewPartnerStoreApplication(item.id, { note: notes[item.id] || undefined }),
    'เริ่มตรวจสอบใบสมัครเรียบร้อยแล้ว',
    'partner-store-review:start-review',
  );

  const requestApprove = (item) => setPendingAction({ type: 'approve', item });
  const requestReject = (item) => {
    const reviewNote = String(notes[item.id] || '').trim();
    if (!reviewNote) {
      setError('ระบุเหตุผลก่อนปฏิเสธใบสมัคร');
      feedback.info('กรุณาระบุเหตุผลก่อนปฏิเสธใบสมัคร');
      return;
    }
    setPendingAction({ type: 'reject', item });
  };
  const requestProvision = (item) => setPendingAction({ type: 'provision', item });

  const confirmPendingAction = async () => {
    const current = pendingAction;
    if (!current || actingId) return;
    const { item, type } = current;
    let result = null;

    if (type === 'approve') {
      result = await run(
        item,
        () => approvePartnerStoreApplication(item.id, { reviewNote: notes[item.id] || undefined }),
        'อนุมัติใบสมัครร้านพาร์ตเนอร์เรียบร้อยแล้ว',
        'partner-store-review:approve',
      );
    } else if (type === 'reject') {
      result = await run(
        item,
        () => rejectPartnerStoreApplication(item.id, { reviewNote: String(notes[item.id] || '').trim() }),
        'ปฏิเสธใบสมัครร้านพาร์ตเนอร์เรียบร้อยแล้ว',
        'partner-store-review:reject',
      );
    } else if (type === 'provision') {
      result = await run(
        item,
        () => provisionPartnerStoreApplication(item.id),
        'สร้างร้านพาร์ตเนอร์เรียบร้อยแล้ว',
        'partner-store-review:provision',
      );
    }

    if (result) setPendingAction(null);
  };

  const issueActivation = async (item) => {
    const response = await run(
      item,
      () => issuePartnerStoreActivationInvitation(item.id),
      'ออกลิงก์เปิดใช้งานร้านเรียบร้อยแล้ว',
      'partner-store-review:activation',
    );
    const claimPath = response?.data?.data?.claimPath;
    if (!claimPath) return;
    const href = new URL(claimPath, window.location.origin).toString();
    setActivationLinks((current) => ({ ...current, [item.id]: href }));
  };

  const copyActivationLink = async (itemId) => {
    const href = activationLinks[itemId];
    if (!href) return;
    try {
      await navigator.clipboard.writeText(href);
      feedback.actionSuccess('คัดลอกลิงก์เปิดใช้งานเรียบร้อยแล้ว', 'partner-store-review:copy-link:success');
    } catch (requestError) {
      setError('คัดลอกลิงก์อัตโนมัติไม่สำเร็จ กรุณาคัดลอกจากช่องลิงก์โดยตรง');
      feedback.actionError(requestError, 'คัดลอกลิงก์เปิดใช้งานไม่สำเร็จ', 'partner-store-review:copy-link:error');
    }
  };

  const pendingMeta = pendingAction ? ACTION_META[pendingAction.type] : null;
  const pendingName = pendingAction?.item?.businessName || 'ร้านพาร์ตเนอร์นี้';

  return (
    <>
      <div className="space-y-5">
        <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">Partner governance</p>
          <h1 className="mt-2 text-2xl font-black text-slate-900">ใบสมัครร้านพาร์ตเนอร์</h1>
          <p className="mt-2 text-sm text-slate-500">Governance, Provisioning และ Owner Activation เป็นคนละขั้น ระบบจะสร้างบัญชีเจ้าของร้านเมื่อผู้สมัครเปิดลิงก์และตั้งรหัสผ่านสำเร็จเท่านั้น</p>
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
          const approved = item.status === 'APPROVED';
          const provisioningStatus = item.provisioningStatus || 'NOT_STARTED';
          const activationStatus = item.activationStatus || 'NOT_STARTED';
          const canProvision = approved && ['NOT_STARTED', 'FAILED'].includes(provisioningStatus);
          const canIssueActivation = approved && provisioningStatus === 'PROVISIONED' && activationStatus !== 'ACTIVE';
          const acting = actingId === item.id;
          const activationLink = activationLinks[item.id];

          return (
            <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-black text-slate-900">{item.businessName}</h2>
                  <p className="mt-1 text-xs font-mono text-slate-500">{item.applicationCode} · {item.status}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{item.contactName}</span>
                  {approved && <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Provisioning: {provisioningStatus}</span>}
                  {approved && <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700">Activation: {activationStatus}</span>}
                </div>
              </div>

              <div className="mt-4 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                <p><b>อีเมล:</b> {item.contactEmail || '-'}</p>
                <p><b>โทรศัพท์:</b> {item.contactPhone}</p>
                <p><b>ที่อยู่:</b> {item.businessAddress || '-'}</p>
                <p><b>ชื่อย่อหน้าร้าน:</b> {item.requestedStorefrontSlug || 'ระบบกำหนดภายหลัง'}</p>
                {approved && item.provisionedBranchId && <p><b>Branch ID:</b> {item.provisionedBranchId}</p>}
                {approved && item.provisionedOwnerUserId && <p><b>Owner User ID:</b> {item.provisionedOwnerUserId}</p>}
                {approved && item.provisioningFailureCode && <p className="text-red-600"><b>Provisioning error:</b> {item.provisioningFailureCode}</p>}
              </div>

              {(pending || underReview) && (
                <div className={`mt-5 grid gap-3 border-t border-slate-100 pt-4 ${underReview ? 'md:grid-cols-[1fr_auto_auto]' : 'md:grid-cols-[1fr_auto]'}`}>
                  <input value={notes[item.id] || ''} onChange={(event) => setNotes((current) => ({ ...current, [item.id]: event.target.value }))} placeholder={pending ? 'บันทึกเริ่มการพิจารณา (ถ้ามี)' : 'บันทึกการพิจารณา / เหตุผลปฏิเสธ'} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                  {pending && <button disabled={acting} onClick={() => startReview(item)} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60">{acting ? 'กำลังดำเนินการ...' : 'เริ่มตรวจสอบ'}</button>}
                  {underReview && <button disabled={acting} onClick={() => requestApprove(item)} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60">อนุมัติใบสมัคร</button>}
                  {underReview && <button disabled={acting} onClick={() => requestReject(item)} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60">ปฏิเสธ</button>}
                </div>
              )}

              {approved && (
                <div className="mt-5 space-y-4 border-t border-slate-100 pt-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-slate-500">
                      {provisioningStatus === 'PROVISIONED'
                        ? activationStatus === 'ACTIVE'
                          ? 'ร้านและบัญชีเจ้าของร้านเปิดใช้งานแล้ว'
                          : 'ร้านถูกสร้างแล้ว สามารถออกลิงก์ให้เจ้าของร้านตั้งรหัสผ่านได้'
                        : provisioningStatus === 'IN_PROGRESS'
                          ? 'กำลังสร้างร้าน ระบบป้องกันการสร้างซ้ำ'
                          : 'Provisioning จะสร้าง Branch และ Capability เท่านั้น ไม่เปิดบัญชีเจ้าของร้าน'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {canProvision && <button disabled={acting} onClick={() => requestProvision(item)} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60">{provisioningStatus === 'FAILED' ? 'ลองสร้างร้านอีกครั้ง' : 'สร้างร้าน'}</button>}
                      {canIssueActivation && <button disabled={acting} onClick={() => issueActivation(item)} className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60">{activationStatus === 'INVITED' ? 'ออกลิงก์ใหม่' : 'ออกลิงก์เปิดใช้งาน'}</button>}
                    </div>
                  </div>

                  {activationLink && (
                    <div className="rounded-xl border border-sky-100 bg-sky-50 p-3">
                      <p className="text-xs font-bold text-sky-800">ลิงก์นี้แสดงจากผลตอบกลับครั้งนี้เท่านั้น ลิงก์เก่าจะถูกยกเลิกเมื่อออกลิงก์ใหม่</p>
                      <div className="mt-2 flex gap-2">
                        <input readOnly value={activationLink} className="min-w-0 flex-1 rounded-lg border border-sky-200 bg-white px-3 py-2 text-xs" />
                        <button type="button" onClick={() => copyActivationLink(item.id)} className="rounded-lg bg-sky-700 px-3 py-2 text-xs font-bold text-white">คัดลอก</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>

      <ConfirmActionDialog
        open={Boolean(pendingAction)}
        title={pendingMeta?.title || 'ยืนยันการดำเนินการ'}
        description={`${pendingMeta?.title || 'ดำเนินการ'}สำหรับ ${pendingName} หรือไม่?`}
        confirmLabel={pendingMeta?.confirmLabel || 'ยืนยัน'}
        intent={pendingMeta?.intent || 'primary'}
        loading={Boolean(actingId)}
        loadingLabel="กำลังดำเนินการ..."
        onClose={() => setPendingAction(null)}
        onConfirm={confirmPendingAction}
      />
    </>
  );
}
