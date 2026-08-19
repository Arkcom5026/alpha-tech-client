import React, { useEffect, useMemo, useRef, useState } from 'react';
import CustomerFilter from '../components/CustomerFilter';
import useCombinedBillingStore from '../store/combinedBillingStore';
import { useNavigate, useParams } from 'react-router-dom';
import { feedback } from '@/design-system/feedback';
import { CONSOLIDATED_DOCUMENT_SOURCE_TYPE } from '../adapters/consolidatedDocumentAdapter';

const money = (value) => Number(value || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const CombinedBillingPage = () => {
  const {
    customer,
    workspace,
    loading,
    error,
    loadDocumentWorkspaceAction,
    confirmDocumentWorkspaceAction,
  } = useCombinedBillingStore();
  const navigate = useNavigate();
  const { shopSlug } = useParams();
  const [selected, setSelected] = useState({});
  const [prices, setPrices] = useState({});
  const [reasons, setReasons] = useState({});
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');
  const [lastResult, setLastResult] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const confirmRef = useRef(false);
  const mutationBusy = loading || confirming;

  useEffect(() => {
    if (!customer?.id) return;
    const requestedCustomerId = Number(customer.id);
    loadDocumentWorkspaceAction(requestedCustomerId).then((rows) => {
      const activeCustomerId = Number(useCombinedBillingStore.getState().customer?.id || 0);
      if (!Array.isArray(rows) || activeCustomerId !== requestedCustomerId) return;
      const defaults = {};
      rows.flatMap((sale) => sale.lines).forEach((line) => {
        defaults[`${line.lineType}:${line.lineId}`] = line.sourceUnitPrice;
      });
      setPrices(defaults);
      setSelected({});
      setReasons({});
    }).catch(() => {});
  }, [customer?.id, loadDocumentWorkspaceAction]);

  const chosen = useMemo(
    () => workspace.flatMap((sale) => sale.lines).filter((line) => selected[`${line.lineType}:${line.lineId}`]),
    [workspace, selected]
  );
  const total = chosen.reduce(
    (sum, line) => sum + Number(prices[`${line.lineType}:${line.lineId}`] || 0) * Number(line.quantity || 0),
    0
  );

  const confirm = async () => {
    if (confirmRef.current || mutationBusy || !customer?.id || !chosen.length) return;

    const customerIdSnapshot = Number(customer.id);
    const command = {
      customerId: customerIdSnapshot,
      note: String(note || ''),
      lines: chosen.map((line) => ({
        lineType: line.lineType,
        lineId: line.lineId,
        documentUnitPrice: Number(prices[`${line.lineType}:${line.lineId}`]),
        adjustmentReason: reasons[`${line.lineType}:${line.lineId}`] || '',
      })),
    };

    confirmRef.current = true;
    setConfirming(true);
    setMessage('');

    try {
      const result = await confirmDocumentWorkspaceAction(command);
      if (!result) return;

      setLastResult(result);
      const successMessage = `ยืนยันชุดเอกสาร ${result.code} เรียบร้อย พร้อมใช้งานในโฟลว์ใบส่งสินค้าและบิลเดิม`;
      setMessage(successMessage);
      feedback.actionSuccess(successMessage, `combined-billing:${result.id || result.code}:create:success`);

      try {
        await loadDocumentWorkspaceAction(customerIdSnapshot);
      } catch (requestError) {
        feedback.actionError(
          requestError,
          'ยืนยันชุดเอกสารสำเร็จแล้ว แต่รีเฟรชรายการล่าสุดไม่สำเร็จ กรุณารีเฟรชหน้า',
          `combined-billing:${result.id || result.code}:refresh-after-create:error`,
        );
      }

      setSelected({});
      setReasons({});
    } catch (requestError) {
      feedback.actionError(requestError, 'ยืนยันชุดเอกสารไม่สำเร็จ', 'combined-billing:create:error');
    } finally {
      confirmRef.current = false;
      setConfirming(false);
    }
  };

  const sourceQuery = (document) => (
    `sourceType=${CONSOLIDATED_DOCUMENT_SOURCE_TYPE}&sourceId=${encodeURIComponent(document.id)}`
  );
  const printDelivery = (document) => navigate(
    `/${shopSlug}/pos/sales/delivery-note/print/${document.id}?${sourceQuery(document)}`
  );
  const printBill = (document, kind) => navigate(
    `/${shopSlug}/pos/sales/bill/print-${kind === 'FULL' ? 'full' : 'short'}/${document.id}?${sourceQuery(document)}`
  );
  const openDeliveryHistory = () => navigate(`/${shopSlug}/pos/sales/delivery-note`);
  const openBillHistory = () => navigate(`/${shopSlug}/pos/sales/bill`);

  return <div className="p-6 space-y-6">
    <div>
      <h1 className="text-2xl font-bold">Document Workspace / จัดชุดเอกสาร</h1>
      <p className="text-gray-600">เลือกรายการที่ชำระพร้อมแล้ว ปรับราคาสุดท้าย และส่งต่อเข้าสู่โฟลว์ใบส่งสินค้าและบิลมาตรฐาน</p>
    </div>
    <CustomerFilter />
    {message && <div className="rounded-lg bg-green-50 p-4 text-green-800">{message}</div>}
    {lastResult?.id && <div className="space-y-3 rounded-xl border bg-white p-4">
      <div>
        <div className="font-semibold">ชุดเอกสาร {lastResult.code}</div>
        <div className="text-sm text-slate-500">จากจุดนี้ให้ใช้หน้าใบส่งสินค้าและหน้าบิลเดิมสำหรับการพิมพ์ ดูย้อนหลัง และพิมพ์ซ้ำ</div>
      </div>
      <div className="flex flex-wrap gap-3">
        <button className="rounded bg-slate-800 px-4 py-2 text-white" onClick={() => printDelivery(lastResult)}>พิมพ์ใบส่งสินค้า</button>
        <button className="rounded bg-emerald-700 px-4 py-2 text-white" onClick={() => printBill(lastResult, 'SHORT')}>เปิดบิลอย่างย่อ</button>
        <button className="rounded bg-blue-700 px-4 py-2 text-white" onClick={() => printBill(lastResult, 'FULL')}>เปิดบิลเต็มรูป</button>
        <button className="rounded border border-slate-300 px-4 py-2 text-slate-700" onClick={openDeliveryHistory}>ประวัติใบส่งสินค้า</button>
        <button className="rounded border border-slate-300 px-4 py-2 text-slate-700" onClick={openBillHistory}>ประวัติบิล</button>
      </div>
    </div>}
    {error && <div className="rounded-lg bg-red-50 p-4 text-red-700">{error.response?.data?.message || error.message}</div>}
    {customer && <div className="space-y-4">
      {workspace.map((sale) => <section key={sale.id} className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div><b>{sale.documentNo}</b><span className="ml-2 text-sm text-gray-500">{sale.code}</span></div>
          <span className="rounded bg-gray-100 px-2 py-1 text-xs">{sale.documentStatus}</span>
        </div>
        <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="bg-gray-50 text-left"><th className="p-2">เลือก</th><th className="p-2">รายการ</th><th className="p-2">สถานะ</th><th className="p-2 text-right">ราคาเดิม</th><th className="p-2">ราคาสุดท้าย/หน่วย</th><th className="p-2">เหตุผลปรับราคา</th></tr></thead><tbody>
          {sale.lines.map((line) => {
            const key = `${line.lineType}:${line.lineId}`;
            const ready = line.status === 'PAID_READY';
            const changed = Number(prices[key]) !== Number(line.sourceUnitPrice);
            return <tr key={key} className="border-t">
              <td className="p-2"><input type="checkbox" disabled={!ready || mutationBusy} checked={!!selected[key]} onChange={() => setSelected((state) => ({ ...state, [key]: !state[key] }))} /></td>
              <td className="p-2">{line.description}<div className="text-xs text-gray-500">จำนวน {line.quantity} · ชำระ {money(line.settledAmount)}</div></td>
              <td className="p-2">{line.status}</td>
              <td className="p-2 text-right">{money(line.sourceUnitPrice)}</td>
              <td className="p-2"><input className="w-32 rounded border px-2 py-1 text-right" type="number" min="0" step="0.01" disabled={!ready || mutationBusy} value={prices[key] ?? ''} onChange={(e) => setPrices((state) => ({ ...state, [key]: e.target.value }))} /></td>
              <td className="p-2"><input className="w-full min-w-48 rounded border px-2 py-1" disabled={!ready || !changed || mutationBusy} required={changed} value={reasons[key] || ''} onChange={(e) => setReasons((state) => ({ ...state, [key]: e.target.value }))} placeholder={changed ? 'ระบุเหตุผล (จำเป็น)' : '-'} /></td>
            </tr>;
          })}
        </tbody></table></div>
      </section>)}
      <div className="sticky bottom-4 rounded-xl border bg-white p-4 shadow-lg">
        <div className="flex flex-wrap items-end gap-4">
          <label className="flex-1">หมายเหตุ<input className="mt-1 w-full rounded border px-3 py-2" disabled={mutationBusy} value={note} onChange={(e) => setNote(e.target.value)} /></label>
          <div className="text-right"><div className="text-sm text-gray-500">{chosen.length} รายการ</div><div className="text-xl font-bold">{money(total)} บาท</div></div>
          <button className="rounded bg-blue-600 px-5 py-2 text-white disabled:opacity-50" disabled={mutationBusy || !chosen.length || chosen.some((line) => Number(prices[`${line.lineType}:${line.lineId}`]) !== Number(line.sourceUnitPrice) && !reasons[`${line.lineType}:${line.lineId}`]?.trim())} onClick={confirm}>{confirming ? 'กำลังยืนยันชุดเอกสาร...' : 'ยืนยันชุดเอกสาร'}</button>
        </div>
      </div>
    </div>}
  </div>;
};

export default CombinedBillingPage;