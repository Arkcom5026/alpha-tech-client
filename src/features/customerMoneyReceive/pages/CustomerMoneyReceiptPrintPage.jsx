import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { feedback } from '@/design-system/feedback';
import { getCustomerMoneyReceive } from '../api/customerMoneyReceiveApi';
import { getCustomerDisplayName } from '@/features/customer/utils/customerDisplayName';
import StoreDocumentHeaderScope from '@/features/branch/documentHeader/StoreDocumentHeaderScope';
import FinanceOperationalPresentationFooter from '@/features/printing/presentation/FinanceOperationalPresentationFooter';
import {
  buildCustomerMoneyReceiptHeader,
  resolveCustomerMoneyReceiptPresentation,
} from '../presentation/customerMoneyReceiptPresentation';

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

const paymentMethodLabel = (value) => ({ CASH: 'เงินสด', TRANSFER: 'โอนเงิน', CARD: 'บัตร', QR: 'QR / พร้อมเพย์' }[value] || value || '-');
const customerName = getCustomerDisplayName;
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

const CustomerMoneyReceiptDocument = ({ record, mode, headerConfig, presentation }) => {
  const isShort = mode === 'SHORT';
  const isCancelled = record.status === 'CANCELLED';
  const isFullyAllocated = record.status === 'FULLY_ALLOCATED';
  const customer = record.customer || {};
  const customerContact = customer.user?.loginId || customer.user?.email || '-';
  const branchIdentity = record.branch?.isHeadOffice ? 'สำนักงานใหญ่' : 'สาขา';
  const moneyStatusText = isCancelled
    ? 'เอกสารถูกยกเลิกและยอดนี้ไม่อยู่ใน Customer Money ที่พร้อมใช้'
    : isFullyAllocated
      ? 'Customer Money จากใบรับนี้ถูกนำไปใช้ครบแล้ว'
      : `รับเข้า Customer Money และยังพร้อมใช้ ฿${formatMoney(record.remainingAmount)}`;
  const lifecycleNotice = isFullyAllocated
    ? 'เงินจากใบรับนี้ถูกนำไปใช้ผ่าน Customer Money workflow ครบแล้ว'
    : isCancelled
      ? 'ใบรับเงินนี้ถูกยกเลิกและไม่ใช่ยอดเงินพร้อมใช้'
      : 'ยอดคงเหลือของใบรับนี้ยังสามารถนำไปใช้ผ่าน Customer Money workflow ได้';
  const systemNotices = [
    'เอกสารนี้เป็นหลักฐานการรับเงินจริงจากลูกค้า',
    lifecycleNotice,
    !isShort ? 'ไม่ใช่ใบกำกับภาษี และไม่ก่อให้เกิดการตัดสต๊อกหรือรายการภาษีจากการรับเงินนี้' : '',
  ].filter(Boolean);

  return (
    <article className={`customer-money-receipt-document bg-white text-black ${isShort ? 'w-[80mm] p-4 text-[12px]' : 'credit-collection-a4 text-[14px]'}`}>
      {isShort ? (
        <header className="border-b-2 border-black pb-4 text-center">
          <h1 className="text-xl font-bold">{headerConfig?.branchName || 'ร้านค้า'}</h1>
          <div className="mt-1 text-sm">{[
            headerConfig?.phone && `โทร ${headerConfig.phone}`,
            headerConfig?.taxId && `เลขประจำตัวผู้เสียภาษี ${headerConfig.taxId}`,
          ].filter(Boolean).join(' · ')}</div>
          <div className="mt-3 text-lg font-bold">ใบรับเงิน</div>
          <div className="text-xs tracking-wide">CUSTOMER MONEY RECEIPT</div>
        </header>
      ) : (
        <div role="banner" className="credit-collection-header border-b-2 border-black pb-4">
          <div className="credit-collection-store-header flex items-start gap-4">
            {headerConfig?.logoUrl ? <img className="credit-collection-store-logo shrink-0 object-contain" src={headerConfig.logoUrl} alt="โลโก้ร้าน" /> : null}
            <div className="credit-collection-store-copy min-w-0 flex-1">
              {headerConfig?.branchName ? <h1 className="credit-collection-store-name font-bold">{headerConfig.branchName}</h1> : null}
              {headerConfig?.address ? <p className="credit-collection-store-address mt-1 text-sm">{headerConfig.address}</p> : null}
              {headerConfig?.phone ? <p className="credit-collection-store-phone mt-1 text-sm">โทร {headerConfig.phone}</p> : null}
              {headerConfig?.taxId ? <p className="credit-collection-store-tax mt-1 text-sm">เลขประจำตัวผู้เสียภาษี {headerConfig.taxId}</p> : null}
              {headerConfig?.headerStyle?.showBranchLabel !== false && headerConfig?.branchName ? <p className="mt-1 text-xs">{branchIdentity}</p> : null}
            </div>
          </div>
          <div className="mt-4 text-center text-xl font-bold">ใบรับเงิน</div>
          <div className="text-center text-xs tracking-wide">CUSTOMER MONEY RECEIPT</div>
        </div>
      )}

      {isCancelled && <div className="my-4 border-2 border-black p-2 text-center font-bold">ยกเลิกแล้ว / CANCELLED</div>}
      {isFullyAllocated && <div className="my-4 border border-black p-2 text-center font-bold">ใช้ Customer Money ครบแล้ว / FULLY ALLOCATED</div>}

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

      <div className={isShort ? 'mt-6' : 'mt-12'}>
        <FinanceOperationalPresentationFooter
          notes={presentation?.notes}
          customFooter={presentation?.customFooter}
          systemNotices={systemNotices}
          compact={isShort}
        />
      </div>
    </article>
  );
};

const CustomerMoneyReceiptPrintPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [record, setRecord] = useState(null);
  const [error, setError] = useState('');
  const requestedMode = useMemo(() => String(searchParams.get('mode') || '').toUpperCase() === 'SHORT' ? 'SHORT' : 'FULL', [searchParams]);
  const [mode, setMode] = useState(requestedMode);
  const autoPrinted = useRef(false);
  const loadRequestRef = useRef(0);
  const recordContextRef = useRef(String(id || ''));
  const autoPrint = useMemo(() => ['1', 'true', 'yes'].includes(String(searchParams.get('autoPrint') || '').toLowerCase()), [searchParams]);

  useEffect(() => {
    const recordIdSnapshot = String(id || '');
    recordContextRef.current = recordIdSnapshot;
    autoPrinted.current = false;
    setRecord(null);
    setError('');
    setMode(requestedMode);
    const requestId = ++loadRequestRef.current;

    getCustomerMoneyReceive(recordIdSnapshot)
      .then((data) => {
        if (loadRequestRef.current !== requestId || recordContextRef.current !== recordIdSnapshot) return;
        setRecord(data);
      })
      .catch((err) => {
        if (loadRequestRef.current !== requestId || recordContextRef.current !== recordIdSnapshot) return;
        const message = err?.response?.data?.message || err?.message || 'โหลดใบรับเงินไม่สำเร็จ';
        setError(message);
        feedback.actionError(err, message, `customer-money-receive:print:${recordIdSnapshot}:load:error`);
      });

    return () => { if (loadRequestRef.current === requestId) loadRequestRef.current += 1; };
  }, [id, requestedMode]);

  useEffect(() => {
    if (!autoPrint || !record || error || autoPrinted.current) return;
    if (String(record.id || '') !== String(id || '')) return;
    autoPrinted.current = true;
    const timer = window.setTimeout(() => window.print(), 250);
    return () => window.clearTimeout(timer);
  }, [autoPrint, record, error, id]);

  const presentation = useMemo(() => (
    record ? resolveCustomerMoneyReceiptPresentation({ record, mode }) : null
  ), [record, mode]);
  const headerConfig = useMemo(() => (
    record && presentation
      ? buildCustomerMoneyReceiptHeader({
        record,
        presentation,
        presentationSnapshot: presentation.presentationSnapshot,
      })
      : null
  ), [record, presentation]);

  if (error) return <div className="p-8 text-center text-rose-700">{error}</div>;
  if (!record) return <div className="p-8 text-center text-slate-500">กำลังโหลดใบรับเงิน...</div>;

  const receiptDocument = (
    <CustomerMoneyReceiptDocument
      record={record}
      mode={mode}
      headerConfig={headerConfig}
      presentation={presentation}
    />
  );

  return (
    <>
      <style>{`
        @page { size: ${mode === 'SHORT' ? '80mm auto' : 'A4'}; margin: ${mode === 'SHORT' ? '0' : '4mm'}; }
        @media print {
          html, body, #root { margin: 0 !important; padding: 0 !important; background: #fff !important; }
          body * { visibility: hidden !important; }
          .customer-money-receipt-document, .customer-money-receipt-document * { visibility: visible !important; }
          .customer-money-receipt-document { margin: 0 auto !important; box-shadow: none !important; }
          .customer-money-receipt-toolbar { display: none !important; }
        }
      `}</style>
      <div className="customer-money-receipt-toolbar w-full bg-white px-4 py-3 print:hidden">
        <div className="mx-auto flex max-w-[210mm] flex-wrap items-center justify-between gap-3">
          <div><div className="font-bold text-slate-900">ใบรับเงิน {record.documentNo}</div><div className="text-xs text-slate-500">Customer Money Receipt · เลือกขนาดเอกสารก่อนพิมพ์</div></div>
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
      <main className="min-h-screen bg-slate-100 p-4 print:min-h-0 print:bg-white print:p-0">
        <div className="mx-auto w-fit shadow print:shadow-none">
          {mode === 'SHORT' ? receiptDocument : <StoreDocumentHeaderScope config={headerConfig}>{receiptDocument}</StoreDocumentHeaderScope>}
        </div>
      </main>
    </>
  );
};

export default CustomerMoneyReceiptPrintPage;
