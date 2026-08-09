import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getDeliveryCreditSettlement } from '../api/deliveryCreditSettlementApi';

const money = (value) => Number(value || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const customerLabel = (customer) => customer?.companyName || customer?.name || '-';

const DeliveryCreditSettlementPrintPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [mode, setMode] = useState('A4');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getDeliveryCreditSettlement(id)
      .then((data) => { if (active) setRecord(data); })
      .catch((err) => { if (active) setError(err?.response?.data?.message || err?.message || 'โหลดเอกสารไม่สำเร็จ'); });
    return () => { active = false; };
  }, [id]);

  if (error) return <div className="p-5 text-rose-700">{error}</div>;
  if (!record) return <div className="p-8 text-center text-slate-500">กำลังโหลด...</div>;

  return (
    <div className="min-h-screen bg-slate-100 p-4 print:bg-white print:p-0">
      <style>{`@media print { @page { size: ${mode === 'SHORT' ? '80mm auto' : 'A4'}; margin: ${mode === 'SHORT' ? '4mm' : '12mm'}; } .no-print { display:none!important; } }`}</style>
      <div className="no-print mx-auto mb-4 flex max-w-5xl flex-wrap gap-2">
        <button type="button" onClick={() => navigate('..')} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">กลับรายละเอียด</button>
        <button type="button" onClick={() => setMode('A4')} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">A4</button>
        <button type="button" onClick={() => setMode('SHORT')} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">80mm</button>
        <button type="button" onClick={() => window.print()} className="rounded-lg bg-indigo-700 px-4 py-2 text-sm font-semibold text-white">พิมพ์</button>
      </div>
      <article className={`mx-auto bg-white text-slate-950 ${mode === 'SHORT' ? 'w-[72mm] p-3 text-[11px]' : 'max-w-[190mm] p-8 text-sm'} print:w-auto print:max-w-none print:p-0`}>
        <header className="border-b border-slate-900 pb-3 text-center"><h1 className={mode === 'SHORT' ? 'text-lg font-bold' : 'text-2xl font-bold'}>เอกสารตัดยอดใบส่งของเครดิต</h1><div>CUSTOMER MONEY DELIVERY CREDIT SETTLEMENT</div></header>
        <div className="mt-3 grid grid-cols-2 gap-2"><div><b>เลขที่:</b> {record.code}</div><div className="text-right"><b>วันที่:</b> {new Date(record.settledAt).toLocaleString('th-TH')}</div><div className="col-span-2"><b>ลูกค้า:</b> {customerLabel(record.customer)}</div></div>
        <div className="mt-4 space-y-3">{record.lines.map((line) => <div key={line.id} className="border-b border-dashed border-slate-300 pb-2"><div className="font-semibold">{line.saleCode} · {line.description}</div><div className="flex justify-between"><span>{line.saleItemType} #{line.saleItemId}</span><span>฿{money(line.appliedAmount)}</span></div></div>)}</div>
        <div className="mt-4 flex justify-between border-y border-slate-900 py-3 text-lg font-bold"><span>ยอดตัดรวม</span><span>฿{money(record.totalAmount)}</span></div>
        {record.note && <div className="mt-3"><b>หมายเหตุ:</b> {record.note}</div>}
        <footer className="mt-6 text-center text-[10px] text-slate-600">เอกสารนี้บันทึกการนำ Customer Money ไปตัดยอดใบส่งของเครดิตเท่านั้น ไม่สร้าง stock movement และไม่ตัดสต๊อกซ้ำ</footer>
      </article>
    </div>
  );
};

export default DeliveryCreditSettlementPrintPage;
