import React, { useMemo, useState } from 'react';
import QRCode from 'react-qr-code';
import repairApi from '../../api/repairApi';
import { ConfirmActionDialog } from '@/design-system';

const RepairTrackingAccessPanel = ({ repairJobId, jobNo }) => {
  const [access, setAccess] = useState(null);
  const [state, setState] = useState({ loading: false, error: null, notice: null });
  const [revokeConfirmationOpen, setRevokeConfirmationOpen] = useState(false);

  const trackingUrl = useMemo(() => {
    if (!access?.trackingPath || typeof window === 'undefined') return '';
    return new URL(access.trackingPath, window.location.origin).toString();
  }, [access]);

  const issue = async (rotate = false) => {
    setState({ loading: true, error: null, notice: null });
    try {
      const payload = rotate
        ? await repairApi.rotateTrackingAccess(repairJobId, { expiryDays: 90 })
        : await repairApi.createTrackingAccess(repairJobId, { expiryDays: 90 });
      setAccess(payload);
      setState({
        loading: false,
        error: null,
        notice: rotate ? 'ออกลิงก์ใหม่และยกเลิกลิงก์เดิมแล้ว' : 'สร้างลิงก์ติดตามงานแล้ว',
      });
    } catch (error) {
      setState({ loading: false, error: error?.message || 'ไม่สามารถสร้างลิงก์ได้', notice: null });
    }
  };

  const copyLink = async () => {
    if (!trackingUrl) return;
    await navigator.clipboard.writeText(trackingUrl);
    setState((current) => ({ ...current, notice: 'คัดลอกลิงก์แล้ว', error: null }));
  };

  const shareLink = async () => {
    if (!trackingUrl) return;
    const shareData = {
      title: `ติดตามงานซ่อม ${jobNo}`,
      text: `ติดตามสถานะงานซ่อมเลขที่ ${jobNo}`,
      url: trackingUrl,
    };
    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }
    await copyLink();
  };

  const revoke = async () => {
    setState({ loading: true, error: null, notice: null });
    try {
      await repairApi.revokeTrackingAccess(repairJobId);
      setAccess(null);
      setRevokeConfirmationOpen(false);
      setState({ loading: false, error: null, notice: 'ยกเลิกลิงก์ติดตามงานแล้ว' });
    } catch (error) {
      setState({ loading: false, error: error?.message || 'ไม่สามารถยกเลิกลิงก์ได้', notice: null });
    }
  };

  return (
    <section className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">Paperless Customer Access</p>
          <h2 className="mt-1 text-lg font-black text-slate-950">ลิงก์ติดตามงานสำหรับลูกค้า</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            ลูกค้าเปิดดูสถานะจากโทรศัพท์ได้โดยไม่ต้องติดตั้งแอปหรือลงชื่อเข้าใช้
          </p>
        </div>
        {!access ? (
          <button
            type="button"
            disabled={state.loading}
            onClick={() => issue(false)}
            className="min-h-11 rounded-xl bg-blue-700 px-5 text-sm font-black text-white disabled:opacity-50"
          >
            {state.loading ? 'กำลังสร้าง' : 'สร้างลิงก์และ QR'}
          </button>
        ) : null}
      </div>

      {access && trackingUrl ? (
        <div className="mt-5 grid gap-5 rounded-2xl border border-blue-100 bg-white p-4 md:grid-cols-[160px_1fr] md:items-center">
          <div className="mx-auto rounded-2xl border border-slate-200 bg-white p-3">
            <QRCode value={trackingUrl} size={132} level="M" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black text-slate-500">ลิงก์สำหรับส่งให้ลูกค้า</p>
            <p className="mt-2 break-all rounded-xl bg-slate-50 p-3 text-xs font-bold text-blue-700">
              {trackingUrl}
            </p>
            <p className="mt-2 text-xs text-slate-400">
              ใช้ได้ถึง {new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(access.expiresAt))}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              <button type="button" onClick={copyLink} className="min-h-11 rounded-xl border border-blue-200 px-4 text-sm font-black text-blue-700">
                คัดลอกลิงก์
              </button>
              <button type="button" onClick={shareLink} className="min-h-11 rounded-xl bg-emerald-600 px-4 text-sm font-black text-white">
                ส่งให้ลูกค้า
              </button>
              <button type="button" disabled={state.loading} onClick={() => issue(true)} className="min-h-11 rounded-xl border border-slate-300 px-4 text-sm font-black text-slate-600">
                ออกลิงก์ใหม่
              </button>
              <button type="button" disabled={state.loading} onClick={() => setRevokeConfirmationOpen(true)} className="min-h-11 rounded-xl border border-red-200 px-4 text-sm font-black text-red-600">
                ยกเลิกลิงก์
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {state.notice ? (
        <p className="mt-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{state.notice}</p>
      ) : null}
      {state.error ? (
        <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{state.error}</p>
      ) : null}
      <ConfirmActionDialog
        open={revokeConfirmationOpen}
        title="ยืนยันยกเลิกลิงก์ติดตามงาน"
        description="ลูกค้าจะไม่สามารถเปิดลิงก์เดิมเพื่อติดตามงานได้อีก"
        confirmLabel="ยืนยันยกเลิกลิงก์"
        intent="destructive"
        loading={state.loading}
        onConfirm={revoke}
        onClose={() => {
          if (!state.loading) setRevokeConfirmationOpen(false);
        }}
      />
    </section>
  );
};

export default RepairTrackingAccessPanel;
