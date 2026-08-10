import React, { useEffect, useMemo, useState } from 'react';
import CustomerFilter from '../components/CustomerFilter';
import useCombinedBillingStore from '../store/combinedBillingStore';
import { useNavigate, useParams } from 'react-router-dom';
import { useBranchStore } from '@/features/branch/store/branchStore';

const money = (value) => Number(value || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const CombinedBillingPage = () => {
  const { customer, workspace, loading, error, history, loadDocumentWorkspaceAction, confirmDocumentWorkspaceAction, loadHistoryAction } = useCombinedBillingStore();
  const navigate = useNavigate(); const { shopSlug } = useParams();
  const branchId = useBranchStore((state) => Number(state.selectedBranchId || state.currentBranch?.id || 0));
  const [selected, setSelected] = useState({});
  const [prices, setPrices] = useState({});
  const [reasons, setReasons] = useState({});
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');
  const [lastResult, setLastResult] = useState(null);

  useEffect(() => { loadHistoryAction().catch(() => {}); }, [loadHistoryAction]);

  useEffect(() => {
    if (!customer?.id) return;
    loadDocumentWorkspaceAction(customer.id).then((rows) => {
      const defaults = {};
      rows.flatMap((sale) => sale.lines).forEach((line) => { defaults[`${line.lineType}:${line.lineId}`] = line.sourceUnitPrice; });
      setPrices(defaults); setSelected({}); setReasons({});
    });
  }, [customer?.id, loadDocumentWorkspaceAction]);

  const chosen = useMemo(() => workspace.flatMap((sale) => sale.lines).filter((line) => selected[`${line.lineType}:${line.lineId}`]), [workspace, selected]);
  const total = chosen.reduce((sum, line) => sum + Number(prices[`${line.lineType}:${line.lineId}`] || 0) * Number(line.quantity || 0), 0);

  const confirm = async () => {
    setMessage('');
    const result = await confirmDocumentWorkspaceAction({ customerId: customer.id, note, lines: chosen.map((line) => ({ lineType: line.lineType, lineId: line.lineId, documentUnitPrice: Number(prices[`${line.lineType}:${line.lineId}`]), adjustmentReason: reasons[`${line.lineType}:${line.lineId}`] || '' })) });
    setLastResult(result);
    setMessage(`สร้างใบส่งของรวม ${result.code} และส่งต่อ Bill/Tax แล้ว (Tax Document #${result.taxDocument?.id})`);
    await loadDocumentWorkspaceAction(customer.id);
    await loadHistoryAction();
    setSelected({});
    setReasons({});
  };

  const printDelivery = (document) => navigate(`/${shopSlug}/pos/sales/combined-billing/delivery/print/${document.id}`);
  const printBill = (document, kind) => navigate(`/${shopSlug}/pos/sales/combined-billing/bill/print/${document.id}?kind=${kind}`);

  return <div className="p-6 space-y-6">
    <div><h1 className="text-2xl font-bold">Document Workspace / ใบส่งของรวม</h1><p className="text-gray-600">เลือกเฉพาะรายการที่ชำระครบ ปรับราคาสุดท้าย และส่งต่อให้ระบบ Bill/Tax เดิม</p></div>
    <CustomerFilter />
    {message && <div className="rounded-lg bg-green-50 p-4 text-green-800">{message}</div>}
    {lastResult?.id && <div className="flex flex-wrap gap-3 rounded-lg border bg-white p-4"><button className="rounded bg-slate-800 px-4 py-2 text-white" onClick={() => printDelivery(lastResult)}>พิมพ์ใบส่งของรวม</button><button className="rounded bg-emerald-700 px-4 py-2 text-white" onClick={() => printBill(lastResult, 'SHORT')}>พิมพ์บิลอย่างย่อ</button><button className="rounded bg-blue-700 px-4 py-2 text-white" onClick={() => printBill(lastResult, 'FULL')}>พิมพ์บิลเต็มรูป</button></div>}
    {error && <div className="rounded-lg bg-red-50 p-4 text-red-700">{error.response?.data?.message || error.message}</div>}
    {customer && <div className="space-y-4">
      {workspace.map((sale) => <section key={sale.id} className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between"><div><b>{sale.documentNo}</b><span className="ml-2 text-sm text-gray-500">{sale.code}</span></div><span className="rounded bg-gray-100 px-2 py-1 text-xs">{sale.documentStatus}</span></div>
        <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="bg-gray-50 text-left"><th className="p-2">เลือก</th><th className="p-2">รายการ</th><th className="p-2">สถานะ</th><th className="p-2 text-right">ราคาเดิม</th><th className="p-2">ราคาสุดท้าย/หน่วย</th><th className="p-2">เหตุผลปรับราคา</th></tr></thead><tbody>
          {sale.lines.map((line) => { const key = `${line.lineType}:${line.lineId}`; const ready = line.status === 'PAID_READY'; const changed = Number(prices[key]) !== Number(line.sourceUnitPrice); return <tr key={key} className="border-t"><td className="p-2"><input type="checkbox" disabled={!ready} checked={!!selected[key]} onChange={() => setSelected((state) => ({ ...state, [key]: !state[key] }))} /></td><td className="p-2">{line.description}<div className="text-xs text-gray-500">จำนวน {line.quantity} · ชำระ {money(line.settledAmount)}</div></td><td className="p-2">{line.status}</td><td className="p-2 text-right">{money(line.sourceUnitPrice)}</td><td className="p-2"><input className="w-32 rounded border px-2 py-1 text-right" type="number" min="0" step="0.01" disabled={!ready} value={prices[key] ?? ''} onChange={(e) => setPrices((state) => ({ ...state, [key]: e.target.value }))} /></td><td className="p-2"><input className="w-full min-w-48 rounded border px-2 py-1" disabled={!ready || !changed} required={changed} value={reasons[key] || ''} onChange={(e) => setReasons((state) => ({ ...state, [key]: e.target.value }))} placeholder={changed ? 'ระบุเหตุผล (จำเป็น)' : '-'} /></td></tr>; })}
        </tbody></table></div>
      </section>)}
      <div className="sticky bottom-4 rounded-xl border bg-white p-4 shadow-lg"><div className="flex flex-wrap items-end gap-4"><label className="flex-1">หมายเหตุ<input className="mt-1 w-full rounded border px-3 py-2" value={note} onChange={(e) => setNote(e.target.value)} /></label><div className="text-right"><div className="text-sm text-gray-500">{chosen.length} รายการ</div><div className="text-xl font-bold">{money(total)} บาท</div></div><button className="rounded bg-blue-600 px-5 py-2 text-white disabled:opacity-50" disabled={loading || !chosen.length || chosen.some((line) => Number(prices[`${line.lineType}:${line.lineId}`]) !== Number(line.sourceUnitPrice) && !reasons[`${line.lineType}:${line.lineId}`]?.trim())} onClick={confirm}>ยืนยันสร้างใบส่งของรวม</button></div></div>
    </div>}
    <section className="rounded-xl border bg-white p-4">
      <h2 className="mb-3 text-xl font-bold">ประวัติใบส่งของรวม</h2>
      <div className="space-y-3">{history.map((document) => {
        const tax = document.taxDocument;
        const taxIssued = Boolean(tax?.issuedDocumentNumber);
        return <details className="rounded-lg border p-3" key={document.id}>
          <summary className="cursor-pointer font-semibold">{document.code} · {document.customer?.companyName || document.customer?.name} · {money(document.totalAmount)} บาท · Bill/Tax: {tax?.issuedDocumentNumber || tax?.status || '-'}</summary>
          <div className="mt-3 flex flex-wrap gap-2 print:hidden">
            <button className="rounded bg-slate-800 px-3 py-2 text-sm text-white" onClick={() => printDelivery(document)}>พิมพ์ใบส่งของรวม</button>
            {!taxIssued && <><button className="rounded bg-emerald-700 px-3 py-2 text-sm text-white" onClick={() => printBill(document, 'SHORT')}>พิมพ์บิลอย่างย่อ</button><button className="rounded bg-blue-700 px-3 py-2 text-sm text-white" onClick={() => printBill(document, 'FULL')}>พิมพ์บิลเต็มรูป</button></>}
            {tax && taxIssued && <button className="rounded bg-blue-700 px-3 py-2 text-sm text-white" onClick={() => navigate(`/${shopSlug}/pos/sales/combined-billing/tax/print/${tax.id}?branchId=${branchId}`)}>พิมพ์บิล/ใบกำกับภาษี {tax.taxInvoiceKind === 'FULL' ? 'เต็มรูป' : 'อย่างย่อ'}</button>}
          </div>
          <div className="mt-3 overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="bg-gray-50"><th className="p-2 text-left">ใบส่งของต้นทาง</th><th className="p-2 text-left">รายการ</th><th className="p-2 text-right">ยอดเอกสาร</th><th className="p-2">สถานะ</th></tr></thead><tbody>{document.documentLines.map((line) => <tr className="border-t" key={line.id}><td className="p-2">{line.sourceDocumentNo}</td><td className="p-2">{line.description}<div className="text-xs text-gray-500">{line.sourceLineType} #{line.sourceLineId}</div></td><td className="p-2 text-right">{money(line.documentAmount)}</td><td className="p-2 text-center">{line.status}</td></tr>)}</tbody></table></div>
        </details>;
      })}</div>
    </section>
  </div>;
};

export default CombinedBillingPage;
