import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCustomerMoneyReceive } from '../api/customerMoneyReceiveApi';

const customerLabel = (customer) => customer?.companyName || customer?.name || '-';

const CustomerMoneyReceiveDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getCustomerMoneyReceive(id)
      .then((data) => { if (active) setRecord(data); })
      .catch((err) => { if (active) setError(err?.response?.data?.message || err?.message || 'โหลดเอกสารไม่สำเร็จ'); });
    return () => { active = false; };
  }, [id]);

  if (error) return <div className="mx-auto max-w-3xl p-5"><div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">{error}</div></div>;
  if (!record) return <div className="p-8 text-center text-slate-500">กำลังโหลดเอกสารรับเงิน...</div>;

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      <div className="flex gap-2 print:hidden">
        <button type="button" onClick={() => navigate('../customer-money-receive')} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold">กลับไปรับเงิน</button>
        <button type="button" onClick={() => window.print()} className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white">พิมพ์เอกสารรับเงิน</button>
      </div>
      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm print:border-0 print:shadow-none">
        <header className="border-b border-slate-200 pb-4 text-center"><h1 className="text-2xl font-bold text-slate-900">เอกสารรับเงินจากลูกค้า</h1><p className="mt-1 text-sm text-slate-500">Customer Money Receive</p></header>
        <div className="mt-5 grid gap-3 sm:grid-cols-2"><div><div className="text-xs text-slate-500">เลขที่เอกสาร</div><div className="font-semibold">{record.documentNo}</div></div><div><div className="text-xs text-slate-500">วันที่รับเงิน</div><div className="font-semibold">{new Date(record.receivedAt).toLocaleString('th-TH')}</div></div><div className="sm:col-span-2"><div className="text-xs text-slate-500">ลูกค้า</div><div className="font-semibold">{customerLabel(record.customer)}</div><div className="text-sm text-slate-600">{[record.customer?.phone, record.customer?.email, record.customer?.taxId].filter(Boolean).join(' · ')}</div></div></div>
        <div className="my-6 rounded-2xl bg-slate-50 p-5 text-center"><div className="text-sm text-slate-500">จำนวนเงินที่รับ</div><div className="mt-1 text-3xl font-bold text-slate-950">฿{Number(record.amount).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div></div>
        <dl className="space-y-3 text-sm"><div className="grid grid-cols-[150px_1fr] gap-3"><dt className="text-slate-500">ช่องทางรับเงิน</dt><dd className="font-medium">{record.paymentMethod}</dd></div><div className="grid grid-cols-[150px_1fr] gap-3"><dt className="text-slate-500">เลขอ้างอิง</dt><dd>{record.paymentReference || '-'}</dd></div><div className="grid grid-cols-[150px_1fr] gap-3"><dt className="text-slate-500">รายละเอียดการรับเงิน</dt><dd className="whitespace-pre-wrap">{record.description || '-'}</dd></div><div className="grid grid-cols-[150px_1fr] gap-3"><dt className="text-slate-500">ผู้รับเงิน</dt><dd>{record.receivedBy?.name || record.receivedBy?.fullName || `#${record.receivedBy?.id || '-'}`}</dd></div></dl>
        <footer className="mt-10 border-t border-slate-200 pt-4 text-xs text-slate-500">เอกสารนี้ยืนยันการรับเงินจริงจากลูกค้าเท่านั้น และไม่ใช่การตัดชำระใบส่งสินค้า</footer>
      </article>
    </div>
  );
};

export default CustomerMoneyReceiveDetailPage;
