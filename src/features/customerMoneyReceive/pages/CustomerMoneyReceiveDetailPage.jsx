import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCustomerDisplayName } from '@/features/customer/utils/customerDisplayName';
import { cancelCustomerMoneyReceive, getCustomerMoneyReceive } from '../api/customerMoneyReceiveApi';

const customerLabel = getCustomerDisplayName;

const formatMoney = (value) => Number(value || 0).toLocaleString('th-TH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const CustomerMoneyReceiveDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  const loadRecord = async () => {
    const data = await getCustomerMoneyReceive(id);
    setRecord(data);
    return data;
  };

  useEffect(() => {
    let active = true;
    getCustomerMoneyReceive(id)
      .then((data) => { if (active) setRecord(data); })
      .catch((err) => { if (active) setError(err?.response?.data?.message || err?.message || 'โหลดเอกสารไม่สำเร็จ'); });
    return () => { active = false; };
  }, [id]);

  const handleCancel = async () => {
    const reason = window.prompt('ระบุเหตุผลการยกเลิกเอกสารรับเงิน');
    if (reason === null) return;
    if (!reason.trim()) {
      setCancelError('กรุณาระบุเหตุผลการยกเลิก');
      return;
    }

    setCancelling(true);
    setCancelError('');
    try {
      await cancelCustomerMoneyReceive(id, reason.trim());
      await loadRecord();
    } catch (err) {
      setCancelError(err?.response?.data?.message || err?.message || 'ยกเลิกเอกสารรับเงินไม่สำเร็จ');
    } finally {
      setCancelling(false);
    }
  };

  if (error) return <div className="mx-auto max-w-3xl p-5"><div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">{error}</div></div>;
  if (!record) return <div className="p-8 text-center text-slate-500">กำลังโหลดเอกสารรับเงิน...</div>;

  const isCancelled = record.status === 'CANCELLED';
  const isFullyAllocated = record.status === 'FULLY_ALLOCATED';
  const canCancel = record.status === 'ACTIVE' && Number(record.remainingAmount) === Number(record.amount);

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => navigate('..')} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold">กลับรายการรับเงิน</button>
        <button type="button" onClick={() => navigate('./print')} className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white">ออกใบรับเงิน / พิมพ์</button>
        {canCancel && <button type="button" onClick={handleCancel} disabled={cancelling} className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 disabled:opacity-50">{cancelling ? 'กำลังยกเลิก...' : 'ยกเลิกเอกสารรับเงิน'}</button>}
      </div>
      {cancelError && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{cancelError}</div>}
      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <header className="border-b border-slate-200 pb-4 text-center"><div className="flex items-center justify-center gap-2"><h1 className="text-2xl font-bold text-slate-900">เอกสารรับเงินจากลูกค้า</h1>{isCancelled ? <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700">ยกเลิกแล้ว</span> : isFullyAllocated ? <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700">ใช้ครบแล้ว</span> : <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">พร้อมใช้</span>}</div><p className="mt-1 text-sm text-slate-500">Customer Money Receive</p></header>
        {isCancelled && <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"><div className="font-semibold">เอกสารนี้ถูกยกเลิกแล้ว</div><div className="mt-1">เหตุผล: {record.cancelReason || '-'}</div>{record.cancelledAt && <div className="mt-1 text-xs">วันที่ยกเลิก: {new Date(record.cancelledAt).toLocaleString('th-TH')}</div>}</div>}
        {isFullyAllocated && <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm text-sky-800"><div className="font-semibold">Customer Money จากใบรับเงินนี้ถูกนำไปใช้ครบแล้ว</div><div className="mt-1 text-xs">ยอดคงเหลือของใบรับเงิน ฿{formatMoney(record.remainingAmount)} และไม่สามารถยกเลิกใบรับเงินได้จนกว่ารายการที่นำเงินไปใช้จะถูกย้อนกลับตาม workflow</div></div>}
        <div className="mt-5 grid gap-3 sm:grid-cols-2"><div><div className="text-xs text-slate-500">เลขที่เอกสาร</div><div className="font-semibold">{record.documentNo}</div></div><div><div className="text-xs text-slate-500">วันที่รับเงิน</div><div className="font-semibold">{new Date(record.receivedAt).toLocaleString('th-TH')}</div></div><div className="sm:col-span-2"><div className="text-xs text-slate-500">ลูกค้า</div><div className="font-semibold">{customerLabel(record.customer)}</div><div className="text-sm text-slate-600">{[record.customer?.user?.loginId, record.customer?.user?.email, record.customer?.taxId].filter(Boolean).join(' · ')}</div></div></div>
        <div className="my-6 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-5 text-center"><div className="text-sm text-slate-500">จำนวนเงินที่รับ</div><div className="mt-1 text-3xl font-bold text-slate-950">฿{formatMoney(record.amount)}</div></div><div className="rounded-2xl border border-sky-200 bg-sky-50 p-5 text-center"><div className="text-sm text-sky-700">คงเหลือจากใบนี้</div><div className="mt-1 text-3xl font-bold text-sky-950">฿{formatMoney(record.remainingAmount)}</div></div><div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center"><div className="text-sm text-emerald-700">เงินลูกค้าคงเหลือทั้งหมด</div><div className="mt-1 text-3xl font-bold text-emerald-950">฿{formatMoney(record.availableBalance)}</div><div className="mt-1 text-xs text-emerald-700">รวมเงินที่ยังพร้อมนำไปใช้ในสาขาปัจจุบัน</div></div></div>
        <dl className="space-y-3 text-sm"><div className="grid grid-cols-[150px_1fr] gap-3"><dt className="text-slate-500">ช่องทางรับเงิน</dt><dd className="font-medium">{record.paymentMethod}</dd></div><div className="grid grid-cols-[150px_1fr] gap-3"><dt className="text-slate-500">เลขอ้างอิง</dt><dd>{record.paymentReference || '-'}</dd></div><div className="grid grid-cols-[150px_1fr] gap-3"><dt className="text-slate-500">รายละเอียดการรับเงิน</dt><dd className="whitespace-pre-wrap">{record.description || '-'}</dd></div><div className="grid grid-cols-[150px_1fr] gap-3"><dt className="text-slate-500">ผู้รับเงิน</dt><dd>{record.receivedBy?.name || `#${record.receivedBy?.id || '-'}`}</dd></div></dl>
        <footer className="mt-10 border-t border-slate-200 pt-4 text-xs text-slate-500">เอกสารนี้ยืนยันการรับเงินจริงจากลูกค้าเท่านั้น และไม่ใช่การตัดชำระใบส่งสินค้า</footer>
      </article>
    </div>
  );
};

export default CustomerMoneyReceiveDetailPage;
