import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { resolveSaleDocumentRoute } from '@/features/sales/documents/saleDocumentRoute';
import { getDeliveryCreditSettlement } from '../api/deliveryCreditSettlementApi';

const money = (value) => Number(value || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const customerLabel = (customer) => customer?.companyName || customer?.name || '-';

const DeliveryCreditSettlementDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getDeliveryCreditSettlement(id)
      .then((data) => { if (active) setRecord(data); })
      .catch((err) => { if (active) setError(err?.response?.data?.message || err?.message || 'โหลดเอกสารไม่สำเร็จ'); });
    return () => { active = false; };
  }, [id]);

  const shopSlug = useMemo(() => location.pathname.split('/').filter(Boolean)[0] || '', [location.pathname]);

  if (error) return <div className="mx-auto max-w-5xl p-5"><div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">{error}</div></div>;
  if (!record) return <div className="p-8 text-center text-slate-500">กำลังโหลดเอกสารตัดยอด...</div>;

  const paymentBySaleId = new Map((record.salePaymentStates || []).map((sale) => [String(sale.saleId), sale]));
  const grouped = record.lines.reduce((acc, line) => {
    if (!acc[line.saleId]) acc[line.saleId] = { saleCode: line.saleCode, lines: [], total: 0 };
    acc[line.saleId].lines.push(line);
    acc[line.saleId].total += Number(line.appliedAmount || 0);
    return acc;
  }, {});

  const openTaxDocument = (saleId, option) => {
    const route = resolveSaleDocumentRoute({ shopSlug, saleId, option });
    if (route) navigate(route);
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 p-3 md:p-5">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => navigate('..')} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold">กลับรายการ</button>
        <button type="button" onClick={() => navigate('./print')} className="rounded-xl bg-indigo-700 px-4 py-2 text-sm font-semibold text-white">พิมพ์เอกสาร</button>
      </div>
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
          <div><h1 className="text-2xl font-bold text-slate-900">เอกสารตัดยอดใบส่งของเครดิต</h1><p className="text-sm text-slate-500">Customer Money Delivery Credit Settlement</p></div>
          <div className="text-right"><div className="font-mono text-lg font-bold">{record.code}</div><div className="text-xs text-slate-500">{new Date(record.settledAt).toLocaleString('th-TH')}</div></div>
        </header>
        <div className="mt-4 grid gap-3 md:grid-cols-2"><div><div className="text-xs text-slate-500">ลูกค้า</div><div className="font-bold">{customerLabel(record.customer)}</div><div className="text-xs text-slate-500">{record.customer?.taxId || '-'}</div></div><div className="rounded-xl bg-indigo-50 p-4 text-right"><div className="text-xs text-indigo-700">ยอดตัดรวม</div><div className="text-3xl font-bold text-indigo-950">฿{money(record.totalAmount)}</div></div></div>
        <div className="mt-5 space-y-4">{Object.entries(grouped).map(([saleId, group]) => {
          const payment = paymentBySaleId.get(String(saleId));
          return <section key={saleId} className="overflow-hidden rounded-xl border border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 px-4 py-3">
              <div><div className="font-semibold">ใบส่งของ {group.saleCode}</div>{payment && <div className="text-xs text-slate-500">ชำระแล้ว ฿{money(payment.paidAmount)} / ฿{money(payment.totalAmount)} · คงเหลือ ฿{money(payment.outstandingAmount)}</div>}</div>
              <div className="font-bold">฿{money(group.total)}</div>
            </div>
            <div className="divide-y divide-slate-100">{group.lines.map((line) => <div key={line.id} className="grid gap-2 px-4 py-3 md:grid-cols-[1fr_100px_140px]"><div><div className="font-medium">{line.description}</div><div className="text-xs text-slate-500">{line.saleItemType} #{line.saleItemId} · จำนวน {line.quantity}</div></div><div className="text-right text-sm text-slate-500">มูลค่า ฿{money(line.lineAmount)}</div><div className="text-right font-bold text-indigo-800">ตัด ฿{money(line.appliedAmount)}</div></div>)}</div>
            {payment?.taxDocumentReady && <div className="border-t border-emerald-200 bg-emerald-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><div className="font-semibold text-emerald-900">ชำระครบแล้ว — พร้อมออกเอกสารภาษี</div><div className="text-xs text-emerald-700">ใช้เอกสารขายเดิมของระบบ ไม่สร้างรายการสินค้าและไม่ตัดสต๊อกซ้ำ</div></div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => openTaxDocument(payment.saleId, 'RECEIPT')} className="rounded-lg border border-emerald-300 bg-white px-3 py-2 text-sm font-semibold text-emerald-800">ใบกำกับภาษีอย่างย่อ</button>
                  <button type="button" onClick={() => openTaxDocument(payment.saleId, 'TAX_INVOICE')} className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white">ใบกำกับภาษีเต็มรูป</button>
                </div>
              </div>
            </div>}
          </section>;
        })}</div>
        {record.note && <div className="mt-5 rounded-xl bg-slate-50 p-3 text-sm"><span className="font-semibold">หมายเหตุ:</span> {record.note}</div>}
        <footer className="mt-6 border-t border-slate-200 pt-4 text-xs text-slate-500">เอกสารนี้เป็นผลทางการเงินจากการนำ Customer Money ไปตัดยอดใบส่งของเครดิต ไม่สร้างการเคลื่อนไหวสินค้าและไม่ตัดสต๊อกซ้ำ</footer>
      </article>
    </div>
  );
};

export default DeliveryCreditSettlementDetailPage;
