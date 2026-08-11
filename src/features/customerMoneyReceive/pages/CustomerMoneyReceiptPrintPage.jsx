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

const THAI_DIGITS = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
const THAI_PLACES = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน'];

const readThaiNumberGroup = (number) => {
  const digits = String(Math.max(0, Math.trunc(number))).split('').map(Number);
  return digits.map((digit, index) => {
    if (!digit) return '';
    const place = digits.length - index - 1;
    if (place === 1) {
      if (digit === 1) return 'สิบ';
      if (digit === 2) return 'ยี่สิบ';
      return `${THAI_DIGITS[digit]}สิบ`;
    }
    if (place === 0 && digit === 1 && digits.length > 1) return 'เอ็ด';
    return `${THAI_DIGITS[digit]}${THAI_PLACES[place] || ''}`;
  }).join('');
};

const readThaiInteger = (number) => {
  const value = Math.max(0, Math.trunc(number));
  if (value === 0) return 'ศูนย์';
  if (value < 1_000_000) return readThaiNumberGroup(value);
  const millions = Math.trunc(value / 1_000_000);
  const remainder = value % 1_000_000;
  return `${readThaiInteger(millions)}ล้าน${remainder ? readThaiNumberGroup(remainder) : ''}`;
};

const thaiBahtText = (value) => {
  const amount = Math.max(0, Math.round((Number(value || 0) + Number.EPSILON) * 100));
  const baht = Math.trunc(amount / 100);
  const satang = amount % 100;
  const bahtText = `${readThaiInteger(baht)}บาท`;
  return satang ? `${bahtText}${readThaiInteger(satang)}สตางค์` : `${bahtText}ถ้วน`;
};

const CustomerMoneyReceiptDocument = ({ record, mode }) => {
  const isShort = mode === 'SHORT';
  const isCancelled = record.status === 'CANCELLED';
  const isFullyAllocated = record.status === 'FULLY_ALLOCATED';
  const branch = record.branch || {};
  const customer = record.customer || {};
  const customerContact = customer.user?.loginId || customer.user?.email || '-';
  const branchIdentity = branch.isHeadOffice ? 'สำนักงานใหญ่' : 'สาขา';
  const moneyStatusText = isCancelled
    ? 'เอกสารถูกยกเลิกและยอดนี้ไม่อยู่ใน Customer Money ที่พร้อมใช้'
    : isFullyAllocated
      ? 'Customer Money จากใบรับนี้ถูกนำไปใช้ครบแล้ว'
      : `รับเข้า Customer Money และยังพร้อมใช้ ฿${formatMoney(record.remainingAmount)}`;

  return (
    <article className={`customer-money-receipt-document bg-white text-black ${isShort ? 'w-[80mm] p-4 text-[12px]' : 'min-h-[277mm] w-[190mm] p-8 text-[14px]'}`}>
      <header className="border-b-2 border-black pb-4 text-center">
        <h1 className={`${isShort ? 'text-xl' : 'text-2xl'} font-bold`}>{branch.name || 'ร้านค้า'}</h1>
        {!isShort && <div className="mt-1 text-sm">{branch.address || '-'}</div>}
        <div className="mt-1 text-sm">
          {[branch.phone && `โทร ${branch.phone}`, branch.taxId && `เลขประจำตัวผู้เสียภาษี ${branch.taxId}`].filter(Boolean).join(' · ')}
        </div>
        {!isShort && branch.name && <div className="mt-1 text-xs">{branchIdentity}</div>}
        <div className={`${isShort ? 'mt-3 text-lg' : 'mt-4 text-xl'} font-bold`}>ใบรับเงิน</div>
        <div className="text-xs tracking-wide">CUSTOMER MONEY RECEIPT</div>
      </header>

      {isCancelled && (
        <div className="my-4 border-2 border-black p-2 text-center font-bold">ยกเลิกแล้ว / CANCELLED</div>
      )}
      {isFullyAllocated && (
        <div className="my-4 border border-black p-2 text-center font-bold">ใช้ Customer Money ครบแล้ว / FULLY ALLOCATED</div>
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
        <div className="mt-2 rounded border border-black px-3 py-2 text-center font-semibold">({thaiBahtText(record.amount)})</div>
        <dl className="mt-4 space-y-2">
          <div className="flex justify-between gap-4"><dt className="font-semibold">ช่องทางรับเงิน</dt><dd>{paymentMethodLabel(record.paymentMethod)}</dd></div>
          <div className="flex justify-between gap-4"><dt className="font-semibold">เลขอ้างอิง</dt><dd>{record.paymentReference || '-'}</dd></div>
          <div className="grid grid-cols-[110px_1fr] gap-3"><dt className="font-semibold">รายละเอียด</dt><dd className="whitespace-pre-wrap text-right">{record.description || '-'}</dd></div>
          {!isShort && <div className="grid grid-cols-[110px_1fr] gap-3"><dt className="font-semibold">สถานะเงิน</dt><dd className="text-right">{moneyStatusText}</dd></div>}
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
          <div><div className="border-b border-black pb-8" /><div className="mt-2">ผู้ชำระเงิน / ผู้ส่งมอบเงิน</div></div>
          <div><div className="border-b border-black pb-8" /><div className="mt-2">ผู้รับเงิน {record.receivedBy?.name ? `(${record.receivedBy.name})` : ''}</div></div>
        </section>
      )}

      {isShort && (
        <section className="mt-7 text-center">
          <div className="mx-auto w-4/5 border-b border-black pb-7" />
          <div className="mt-2">ผู้รับเงิน {record.receivedBy?.name ? `(${record.receivedBy.name})` : ''}</div>
        </section>
      )}

      <footer className={`${isShort ? 'mt-6' : 'mt-12'} border-t border-black pt-3 text-center text-xs`}>
        <div className="font-semibold">เอกสารนี้เป็นหลักฐานการรับเงินจริงจากลูกค้า</div>
        <div className="mt-1">{isFullyAllocated ? 'เงินจากใบรับนี้ถูกนำไปใช้ผ่าน Customer Money workflow ครบแล้ว' : isCancelled ? 'ใบรับเงินนี้ถูกยกเลิกและไม่ใช่ยอดเงินพร้อมใช้' : 'ยอดคงเหลือของใบรับนี้ยังสามารถนำไปใช้ผ่าน Customer Money workflow ได้'}</div>
        {!isShort && <div className="mt-1">ไม่ใช่ใบกำกับภาษี และไม่ก่อให้เกิดการตัดสต๊อกหรือรายการภาษีจากการรับเงินนี้</div>}
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
          html, body, #root { margin: 0 !important; padding: 0 !important; background: #fff !important; }
          body * { visibility: hidden !important; }
          .customer-money-receipt-document, .customer-money-receipt-document * { visibility: visible !important; }
          .customer-money-receipt-document { position: absolute !important; inset: 0 auto auto 0 !important; margin: 0 !important; border: 0 !important; box-shadow: none !important; }
          .customer-money-receipt-toolbar { display: none !important; }
        }
      `}</style>
      <div className="customer-money-receipt-toolbar w-full bg-white px-4 py-3 print:hidden">
        <div className="mx-auto flex max-w-[210mm] flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-bold text-slate-900">ใบรับเงิน {record.documentNo}</div>
            <div className="text-xs text-slate-500">Customer Money Receipt · เลือกขนาดเอกสารก่อนพิมพ์</div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => navigate(-1)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold">กลับ</button>
            <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
              <button type="button" onClick={() => setMode('FULL')} className={`rounded-md px-3 py-1.5 text-sm font-bold ${mode === 'FULL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>A4</button>
              <button type="button" onClick={() => setMode('SHORT')} className={`rounded-md px-3 py-1.5 text-sm font-bold ${mode === 'SHORT' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>80mm</button>
            </div>
            <button type="button" onClick={() => window.print()} className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white">พิมพ์ใบรับเงิน</button>
          </div>
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