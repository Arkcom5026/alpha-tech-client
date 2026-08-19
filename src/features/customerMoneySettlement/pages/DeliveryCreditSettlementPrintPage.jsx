import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { feedback } from '@/design-system/feedback';
import { getCustomerDisplayName } from '@/features/customer/utils/customerDisplayName';
import StoreDocumentHeaderScope from '@/features/branch/documentHeader/StoreDocumentHeaderScope';
import FinanceOperationalPresentationFooter from '@/features/printing/presentation/FinanceOperationalPresentationFooter';
import { getDeliveryCreditSettlement } from '../api/deliveryCreditSettlementApi';
import {
  buildDeliveryCreditSettlementHeader,
  resolveDeliveryCreditSettlementPresentation,
} from '../presentation/deliveryCreditSettlementPresentation';

const money = (value) => Number(value || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const customerLabel = getCustomerDisplayName;
const SYSTEM_NOTICES = Object.freeze([
  'เอกสารนี้บันทึกการนำ Customer Money ไปตัดยอดใบส่งของเครดิตเท่านั้น ไม่สร้าง stock movement และไม่ตัดสต๊อกซ้ำ',
]);

const DeliveryCreditSettlementPrintPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const recordContextRef = useRef(null);
  const loadRequestRef = useRef(0);
  const [record, setRecord] = useState(null);
  const [mode, setMode] = useState('A4');
  const [error, setError] = useState('');

  useEffect(() => {
    const settlementIdSnapshot = id;
    const requestId = ++loadRequestRef.current;
    recordContextRef.current = settlementIdSnapshot;
    const ownsRequest = () => loadRequestRef.current === requestId && recordContextRef.current === settlementIdSnapshot;

    setRecord(null);
    setError('');

    getDeliveryCreditSettlement(settlementIdSnapshot)
      .then((data) => { if (ownsRequest()) setRecord(data); })
      .catch((err) => {
        if (!ownsRequest()) return;
        const fallbackMessage = 'โหลดเอกสารไม่สำเร็จ';
        setError(err?.response?.data?.message || err?.message || fallbackMessage);
        feedback.actionError(err, fallbackMessage, `customer-money-settlement:print:${settlementIdSnapshot}:load:error`);
      });

    return () => {
      if (recordContextRef.current === settlementIdSnapshot) recordContextRef.current = null;
      if (loadRequestRef.current === requestId) loadRequestRef.current += 1;
    };
  }, [id]);

  const presentation = useMemo(() => (
    record ? resolveDeliveryCreditSettlementPresentation({ record, mode }) : null
  ), [mode, record]);

  const headerConfig = useMemo(() => (
    record && presentation ? buildDeliveryCreditSettlementHeader({
      record,
      presentation,
      presentationSnapshot: presentation.presentationSnapshot,
    }) : null
  ), [presentation, record]);

  if (error) return <div className="p-5 text-rose-700">{error}</div>;
  if (!record) return <div className="p-8 text-center text-slate-500">กำลังโหลด...</div>;

  const isCancelled = record.status === 'CANCELLED';
  const isShort = mode === 'SHORT';

  const settlementDocument = (
    <article className={`mx-auto bg-white text-slate-950 ${isShort ? 'w-[72mm] p-3 text-[11px]' : 'credit-collection-a4 max-w-[190mm] p-8 text-sm'} print:w-auto print:max-w-none print:p-0`}>
      {isShort ? (
        <header className="border-b border-slate-900 pb-3 text-center">
          {headerConfig?.branchName ? <div className="font-bold">{headerConfig.branchName}</div> : null}
          {[headerConfig?.phone && `โทร ${headerConfig.phone}`, headerConfig?.taxId && `เลขประจำตัวผู้เสียภาษี ${headerConfig.taxId}`].filter(Boolean).length ? (
            <div className="mt-1 text-[10px]">{[headerConfig?.phone && `โทร ${headerConfig.phone}`, headerConfig?.taxId && `เลขประจำตัวผู้เสียภาษี ${headerConfig.taxId}`].filter(Boolean).join(' · ')}</div>
          ) : null}
          <h1 className="mt-3 text-lg font-bold">เอกสารตัดยอดใบส่งของเครดิต</h1>
          <div>CUSTOMER MONEY DELIVERY CREDIT SETTLEMENT</div>
          {isCancelled && <div className="mt-2 border-y-2 border-slate-900 py-1 text-lg font-black">ยกเลิกแล้ว / CANCELLED</div>}
        </header>
      ) : (
        <header className="credit-collection-header border-b border-slate-900 pb-3">
          <div className="credit-collection-store-header flex items-start gap-4">
            {headerConfig?.logoUrl ? <img className="credit-collection-store-logo shrink-0 object-contain" src={headerConfig.logoUrl} alt="โลโก้ร้าน" /> : null}
            <div className="credit-collection-store-copy min-w-0 flex-1">
              {headerConfig?.branchName ? <h1 className="credit-collection-store-name font-bold">{headerConfig.branchName}</h1> : null}
              {headerConfig?.address ? <p className="credit-collection-store-address mt-1">{headerConfig.address}</p> : null}
              {headerConfig?.phone ? <p className="credit-collection-store-phone mt-1">โทร {headerConfig.phone}</p> : null}
              {headerConfig?.taxId ? <p className="credit-collection-store-tax mt-1">เลขประจำตัวผู้เสียภาษี {headerConfig.taxId}</p> : null}
            </div>
          </div>
          <div className="mt-4 text-center">
            <h1 className="text-2xl font-bold">เอกสารตัดยอดใบส่งของเครดิต</h1>
            <div>CUSTOMER MONEY DELIVERY CREDIT SETTLEMENT</div>
            {isCancelled && <div className="mt-2 border-y-2 border-slate-900 py-1 text-lg font-black">ยกเลิกแล้ว / CANCELLED</div>}
          </div>
        </header>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div><b>เลขที่:</b> {record.code}</div>
        <div className="text-right"><b>วันที่:</b> {new Date(record.settledAt).toLocaleString('th-TH')}</div>
        <div className="col-span-2"><b>ลูกค้า:</b> {customerLabel(record.customer)}</div>
        <div className="col-span-2"><b>สถานะ:</b> {isCancelled ? 'ยกเลิกแล้ว' : 'ใช้งาน'}</div>
      </div>
      {isCancelled && <div className="mt-3 border border-slate-500 p-2"><b>เหตุผลการยกเลิก:</b> {record.cancelReason || '-'}{record.cancelledAt && <div><b>ยกเลิกเมื่อ:</b> {new Date(record.cancelledAt).toLocaleString('th-TH')}</div>}</div>}
      <div className="mt-4 space-y-3">{record.lines.map((line) => <div key={line.id} className="border-b border-dashed border-slate-300 pb-2"><div className="font-semibold">{line.saleCode} · {line.description}</div><div className="flex justify-between"><span>{line.saleItemType} #{line.saleItemId}</span><span>฿{money(line.appliedAmount)}</span></div></div>)}</div>
      <div className={`mt-4 flex justify-between border-y border-slate-900 py-3 text-lg font-bold ${isCancelled ? 'line-through' : ''}`}><span>ยอดตัดรวม</span><span>฿{money(record.totalAmount)}</span></div>
      {record.note && <div className="mt-3"><b>หมายเหตุรายการ:</b> {record.note}</div>}
      <div className={isShort ? 'mt-5' : 'mt-6'}>
        <FinanceOperationalPresentationFooter
          notes={presentation?.notes}
          customFooter={presentation?.customFooter}
          systemNotices={SYSTEM_NOTICES}
          compact={isShort}
        />
      </div>
    </article>
  );

  return (
    <div className="min-h-screen bg-slate-100 p-4 print:min-h-0 print:bg-white print:p-0">
      <style>{`@media print { @page { size: ${isShort ? '80mm auto' : 'A4'}; margin: 4mm; } .no-print { display:none!important; } }`}</style>
      <div className="no-print mx-auto mb-4 flex max-w-5xl flex-wrap gap-2">
        <button type="button" onClick={() => navigate('..')} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">กลับรายละเอียด</button>
        <button type="button" onClick={() => setMode('A4')} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">A4</button>
        <button type="button" onClick={() => setMode('SHORT')} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">80mm</button>
        <button type="button" onClick={() => window.print()} className="rounded-lg bg-indigo-700 px-4 py-2 text-sm font-semibold text-white">พิมพ์</button>
      </div>
      {isShort ? settlementDocument : <StoreDocumentHeaderScope config={headerConfig}>{settlementDocument}</StoreDocumentHeaderScope>}
    </div>
  );
};

export default DeliveryCreditSettlementPrintPage;
