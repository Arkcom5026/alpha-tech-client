import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getCustomerMoneyReceive } from '../api/customerMoneyReceiveApi';

const formatMoney = (value) => Number(value || 0).toLocaleString('th-TH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatDateTime = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleString('th-TH', {
    timeZone: 'Asia/Bangkok',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const paymentMethodLabel = (value) => ({
  CASH: 'เงินสด',
  TRANSFER: 'โอนเงิน',
  CARD: 'บัตร',
  QR: 'QR / พร้อมเพย์',
}[value] || value || '-');

const customerName = (customer) => customer?.companyName || customer?.name || '-';

const CustomerMoneyReceiptDocument = ({ record, mode }) => {
  const isShort = mode === 'SHORT';
  const isCancelled = record.status === 'CANCELLED';
  const branch = record.branch || {};
  const customer = record.customer || {};
  const customerContact = customer.user?.loginId || customer.user?.email || '-';

  return (
    <article className={`customer-money-receipt-document bg-white text-black ${isShort ? 'w-[80mm] p-4 text-[12px]' : 'min-h-[277mm] w-[190mm] p-8 text-[14px]'}`}>
      <header className="border-b-2 border-black pb-4 text-center">
        <h1 className={`${isShort ? 'text-xl' : 'text-2xl'} font-bold`}>{branch.name || 'ใบรับเงิน'}</h1>
        {!isShort && <div className="mt-1 text-sm">{branch.address || '-'}</div>}
        <div className="mt-1 text-sm">
          {[branch.phone && `โทร ${branch.phone}`, branch.taxId && `เลขประจำตัวผู้เสียภาษี ${branch.taxId}`].filter(Boolean).join(' · ')}
        </div>
        <div className={`${isShort ? 'mt-3 text-lg' : 'mt-4 text-xl'} font-bold`}>ใบรับเงิน</div>
        <div className="text-xs">CUSTOMER MONEY RECEIPT</div>
      </header>

      {isCancelled && (
        <div className="my-4 border-2 border-black p-2 text-center font-bold">ยกเลิกแล้ว / CANCELLED</div>
      )}

      <section className="mt-4 grid grid-cols-2 gap-x-5 gap-y-2">
        <div><span className="font-semibold">เลขที่:</span> {record.documentNo}</div>
        <div className="text-right"><span className="font-semibold">วันที่:</span> {formatDateTime(record.receivedAt)}</div>
      </section>

      <section className="mt-4 border-y border-black py-3">
        <div><span className="font-semibold">รับเงินจาก:</span> {customerName(customer)}</div>
        <div className="mt-1"><span className="font-semibold">เลขประจำตัวผู้เสียภาษี:</span> {customer.taxId || '-'}</div>
        {!isShort && <div className="mt-1"><span className="font-semibold">ที่อยู่:</span> {customer.addressDetail || '-'}</div>}
        {!isShort && <div className="mt-1"><span className="font-semibold">ติดต่อ:</span> {customerContact}</div>}
      </section>

      <section className="mt-5">
        <div className="flex items-end justify-between gap-4 border-b border-black pb-3">
          <span className="font-semibold">จำนวนเงินที่รับ</span>
          <span className={`${isShort ? 'text-2xl' : 'text-3xl'} font-bold`}>฿{formatMoney(record.amount)}</span>
        </div>
        <dl className="mt-4 space-y-2">
          <div className="flex justify-between gap-4"><dt className="font-semibold">ช่องทางรับเงิน</dt><dd>{paymentMethodLabel(record.paymentMethod)}</dd></div>
          <div className="flex justify-between gap-4"><dt className="font-semibold">เลขอ้างอิง</dt><dd>{record.paymentReference || '-'}</dd></div>
          <div className="grid grid-cols-[110px_1fr] gap-3"><dt className="font-semibold">รายละเอียด</dt><dd className="whitespace-pre-wrap text-right">{record.description || '-'}</dd></div>
        </dl>
      </section>

      {isCancelled && (
        <section className="mt-5 border border-black p-3">
          <div className="font-semibold">เหตุผลการยกเลิก: {record.cancelReason || '-'}</div>
          <div className="mt-1">วันที่ยกเลิก: {formatDateTime(record.cancelledAt)}</div>
          <div className="mt-1">ผู้ยกเลิก: {record.cancelledBy?.name || `#${record.cancelledBy?.id || '-'}`}</div>
        </section>
      )}

      {!isShort && (
        <section className="mt-14 grid grid-cols-2 gap-16 text-center">
          <div><div className="border-b border-black pb-8" /><div className="mt-2">ผู้ชำระเงิน</div></div>
          <div><div className="border-b border-black pb-8" /><div className="mt-2">ผู้รับเงิน {record.receivedBy?.name ? `(${record.receivedBy.name})` : ''}</div></div>
        </section>
      )}

      <footer className={`${isShort ? 'mt-6' : 'mt-12'} border-t border-black pt-3 text-center text-xs`}>
        เอกสารนี้เป็นหลักฐานการรับเงินจริงจากลูกค้า และยังไม่ใช่การตัดชำระใบส่งสินค้า/ใบขาย
      </footer>
    </article>
  );
};

const CustomerMoneyReceiptPrintPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [record, setRecord] = useState(null);
  const [error, setError] = useState('');
  const [mode, setMode] = useState(() => String(searchParams.get('mode') || '').toUpperCase() === 'SHORT' ? 'SHORT' : 'FULL');
  const autoPrinted = useRef(false);
  const autoPrint = useMemo(() => ['1', 'true', 'yes'].includes(String(searchParams.get('autoPrint') || '').toLowerCase()), [searchParams]);

  useEffect(() => {
    let active = true;
    getCustomerMoneyReceive(id)
      .then((data) => { if (active) setRecord(data); })
      .catch((err) => { if (active) setError(err?.response?.data?.message || err?.message || 'โหลดใบรับเงินไม่สำเร็จ'); });
    return () => { active = false; };
  }, [id]);

  useEffect(() => {
    if (!autoPrint || !record || error || autoPrinted.current) return;
    autoPrinted.current = true;
    const timer = window.setTimeout(() => window.print(), 250);
    return () => window.clearTimeout(timer);
  }, [autoPrint, record, error]);

  if (error) return <div className="p-8 text-center text-rose-700">{error}</div>;
  if (!record) return <div className="p-8 text-center text-slate-500">กำลังโหลดใบรับเงิน...</div>;

  return (
    <>
      <style>{`
        @page { size: ${mode === 'SHORT' ? '80mm auto' : 'A4'}; margin: ${mode === 'SHORT' ? '0' : '10mm'}; }
        @media print {
          body { background: #fff !important; }
          body * { visibility: hidden !important; }
          .customer-money-receipt-document, .customer-money-receipt-document * { visibility: visible !important; }
          .customer-money-receipt-document { position: absolute !important; inset: 0 auto auto 0 !important; margin: 0 !important; border: 0 !important; box-shadow: none !important; }
          .customer-money-receipt-toolbar { display: none !important; }
        }
      `}</style>
      <div className="customer-money-receipt-toolbar flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
        <div><div className="font-bold text-slate-900">ใบรับเงิน {record.documentNo}</div><div className="text-xs text-slate-500">เลือกขนาดเอกสารก่อนพิมพ์</div></div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => navigate(-1)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold">กลับ</button>
          <button type="button" onClick={() => setMode('FULL')} className={`rounded-lg px-3 py-2 text-sm font-semibold ${mode === 'FULL' ? 'bg-slate-900 text-white' : 'border border-slate-300'}`}>A4</button>
          <button type="button" onClick={() => setMode('SHORT')} className={`rounded-lg px-3 py-2 text-sm font-semibold ${mode === 'SHORT' ? 'bg-slate-900 text-white' : 'border border-slate-300'}`}>80mm</button>
          <button type="button" onClick={() => window.print()} className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white">พิมพ์ใบรับเงิน</button>
        </div>
      </div>
      <main className="min-h-screen bg-slate-100 p-4 print:bg-white print:p-0">
        <div className="mx-auto w-fit shadow print:shadow-none">
          <CustomerMoneyReceiptDocument record={record} mode={mode} />
        </div>
      </main>
    </>
  );
};

export default CustomerMoneyReceiptPrintPage;
