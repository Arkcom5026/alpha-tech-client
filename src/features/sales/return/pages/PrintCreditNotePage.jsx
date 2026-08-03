import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getPrintableCreditNote } from '@/features/sales/return/api/saleReturnApi';

const money = (value) => Number(value || 0).toLocaleString('th-TH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const PrintCreditNotePage = () => {
  const { taxDocumentId, shopSlug = 'advancetech' } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [projection, setProjection] = useState(null);
  const [error, setError] = useState('');

  const branchId = Number(searchParams.get('branchId'));

  useEffect(() => {
    if (!Number.isInteger(branchId) || branchId <= 0) {
      setError('ไม่พบข้อมูลสาขาสำหรับพิมพ์ใบลดหนี้');
      return;
    }
    getPrintableCreditNote({ branchId, taxDocumentId })
      .then(setProjection)
      .catch((err) => setError(err.response?.data?.message || err.message));
  }, [branchId, taxDocumentId]);

  if (error) {
    return <main className="p-6"><div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div></main>;
  }
  if (!projection) return <main className="p-6">กำลังเตรียมใบลดหนี้...</main>;

  return (
    <main className="mx-auto max-w-4xl space-y-5 bg-white p-8 text-slate-900 print:max-w-none print:p-0">
      <div className="flex justify-end gap-3 print:hidden">
        <button className="rounded-xl border px-5 py-3 font-bold" onClick={() => navigate(`/${shopSlug}/pos/sales/sale-return`)}>กลับรายการคืนสินค้า</button>
        <button className="rounded-xl bg-slate-900 px-5 py-3 font-bold text-white" onClick={() => window.print()}>พิมพ์ใบลดหนี้</button>
      </div>
      <header className="border-b-2 border-slate-900 pb-5">
        <h1 className="text-2xl font-black">{projection.document.title}</h1>
        <div className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
          <div>เลขที่: <b>{projection.document.number}</b></div>
          <div>วันที่ออก: {new Date(projection.document.issuedAt).toLocaleString('th-TH')}</div>
          <div>อ้างอิงใบกำกับเดิม: <b>{projection.originalInvoice.number}</b></div>
          <div>รายการคืนสินค้า: #{projection.saleReturn.id}</div>
        </div>
      </header>
      <section className="grid gap-5 text-sm sm:grid-cols-2">
        <div>
          <h2 className="font-black">ผู้ออกเอกสาร</h2>
          <p>{projection.issuer.legalName}</p>
          <p>เลขประจำตัวผู้เสียภาษี: {projection.issuer.taxId}</p>
          <p>{projection.issuer.registeredAddress}</p>
        </div>
        <div>
          <h2 className="font-black">ผู้รับเอกสาร</h2>
          <p>{projection.recipient?.legalName || projection.sale.customerName || '-'}</p>
          <p>เลขประจำตัวผู้เสียภาษี: {projection.recipient?.taxId || projection.sale.customerTaxId || '-'}</p>
          <p>{projection.recipient?.registeredAddress || '-'}</p>
        </div>
      </section>
      <table className="w-full border-collapse text-sm">
        <thead><tr className="border-y bg-slate-50 text-left"><th className="p-2">รายการ</th><th className="p-2 text-right">จำนวน</th><th className="p-2 text-right">มูลค่า</th><th className="p-2 text-right">ภาษี</th></tr></thead>
        <tbody>
          {projection.lines.map((line) => (
            <tr className="border-b" key={line.id}>
              <td className="p-2">{line.description}</td>
              <td className="p-2 text-right">{line.quantity}</td>
              <td className="p-2 text-right">{money(line.lineAmount)}</td>
              <td className="p-2 text-right">{money(line.vatAmount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <section className="ml-auto max-w-xs space-y-1 border-t pt-3 text-sm">
        <div className="flex justify-between"><span>มูลค่าก่อนภาษี</span><b>{money(projection.document.subtotalAmount)}</b></div>
        <div className="flex justify-between"><span>ภาษีมูลค่าเพิ่ม</span><b>{money(projection.document.taxAmount)}</b></div>
        <div className="flex justify-between text-lg"><span>รวมใบลดหนี้</span><b>{money(projection.document.totalAmount)} บาท</b></div>
      </section>
    </main>
  );
};

export default PrintCreditNotePage;
