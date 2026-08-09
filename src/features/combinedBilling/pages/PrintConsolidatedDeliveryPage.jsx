import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getConsolidatedDeliveryPrintable } from '../api/combinedBillingApi';

const money = (value) => Number(value || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const PrintConsolidatedDeliveryPage = () => {
  const { documentId, shopSlug } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getConsolidatedDeliveryPrintable(documentId).then(setData).catch((e) => setError(e.response?.data?.message || e.message));
  }, [documentId]);

  if (error) return <main className="p-6 text-red-700">{error}</main>;
  if (!data) return <main className="p-6">กำลังเตรียมเอกสาร...</main>;

  return <main className="mx-auto max-w-4xl space-y-5 bg-white p-8 print:max-w-none print:p-0">
    <div className="flex justify-end gap-2 print:hidden">
      <button className="rounded border px-4 py-2" onClick={() => navigate(`/${shopSlug}/pos/sales/combined-billing`)}>กลับ</button>
      <button className="rounded bg-slate-900 px-4 py-2 text-white" onClick={() => window.print()}>พิมพ์ใบส่งของรวม</button>
    </div>
    <header className="border-b-2 border-black pb-4">
      <h1 className="text-2xl font-bold">{data.document.title}</h1>
      <p>เลขที่ <b>{data.document.number}</b></p>
      <p>วันที่ {new Date(data.document.issuedAt).toLocaleString('th-TH')}</p>
    </header>
    <section className="grid grid-cols-2 gap-6">
      <div><b>ลูกค้า</b><p>{data.customer?.companyName || data.customer?.name || '-'}</p><p>{data.customer?.address || '-'}</p></div>
      <div><b>หมายเหตุ</b><p>{data.document.note || '-'}</p></div>
    </section>
    <table className="w-full text-sm"><thead><tr className="border-y bg-slate-50"><th className="p-2 text-left">รายการ</th><th>ใบส่งของต้นทาง</th><th className="text-right">จำนวน</th><th className="text-right">ราคาสุดท้าย</th><th className="text-right">รวม</th></tr></thead><tbody>
      {data.lines.map((line) => <tr className="border-b" key={line.id}><td className="p-2">{line.description}{Number(line.priceAdjustment) !== 0 && <div className="text-xs text-gray-500">ราคาเดิม {money(line.sourceUnitPrice)} · ปรับ {money(line.priceAdjustment)} {line.adjustmentReason ? `(${line.adjustmentReason})` : ''}</div>}</td><td>{line.sourceDocumentNo}</td><td className="text-right">{line.quantity}</td><td className="text-right">{money(line.documentUnitPrice)}</td><td className="text-right">{money(line.lineAmount)}</td></tr>)}
    </tbody></table>
    <div className="ml-auto max-w-xs text-right text-xl font-bold">รวม {money(data.document.totalAmount)} บาท</div>
  </main>;
};

export default PrintConsolidatedDeliveryPage;
