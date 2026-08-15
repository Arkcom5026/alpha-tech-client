import { useCallback, useEffect, useState } from 'react';
import { ConfirmActionDialog } from '@/design-system/composites';
import { feedback } from '@/design-system/feedback';
import { useBranchStore } from '@/features/branch/store/branchStore';
import { listSalesTaxFilings, prepareSalesTaxFiling, submitSalesTaxFiling } from '../api/salesTaxFilingApi';

const money = (value) => Number(value || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const errorMessage = (error, fallback) => error?.response?.data?.error?.message || error?.response?.data?.message || error?.message || fallback;

const SalesTaxFilingPage = () => {
  const branchId = useBranchStore((state) => Number(state.selectedBranchId || state.currentBranch?.id || 0));
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [batches, setBatches] = useState([]);
  const [detail, setDetail] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [pendingSubmit, setPendingSubmit] = useState(null);

  const load = useCallback(async () => {
    if (!branchId) return;
    const result = await listSalesTaxFilings({ branchId, year, month });
    setBatches(result?.batches || []);
  }, [branchId, month, year]);

  useEffect(() => {
    load().catch((requestError) => {
      setError(errorMessage(requestError, 'โหลดชุดยื่นภาษีขายไม่สำเร็จ'));
      feedback.actionError(requestError, 'โหลดชุดยื่นภาษีขายไม่สำเร็จ', 'sales-tax-filing:load:error');
    });
  }, [load]);

  const prepare = async () => {
    if (busy || !branchId) return;
    setBusy(true);
    setError('');
    try {
      const result = await prepareSalesTaxFiling({ branchId, year, month });
      setDetail(result);
      feedback.actionSuccess('เตรียมชุดยื่นภาษีขายเรียบร้อยแล้ว', 'sales-tax-filing:prepare:success');
      await load();
    } catch (requestError) {
      setError(errorMessage(requestError, 'เตรียมชุดยื่นภาษีขายไม่สำเร็จ'));
      feedback.actionError(requestError, 'เตรียมชุดยื่นภาษีขายไม่สำเร็จ', 'sales-tax-filing:prepare:error');
    } finally {
      setBusy(false);
    }
  };

  const confirmSubmit = async () => {
    if (!pendingSubmit || busy) return;
    setBusy(true);
    setError('');
    try {
      const result = await submitSalesTaxFiling({ branchId, batchId: pendingSubmit.id });
      setDetail(result?.batch);
      setPendingSubmit(null);
      feedback.actionSuccess('ยืนยันชุดยื่นภาษีขายเรียบร้อยแล้ว', 'sales-tax-filing:submit:success');
      await load();
    } catch (requestError) {
      setError(errorMessage(requestError, 'ยืนยันชุดยื่นภาษีขายไม่สำเร็จ'));
      feedback.actionError(requestError, 'ยืนยันชุดยื่นภาษีขายไม่สำเร็จ', 'sales-tax-filing:submit:error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <main className="mx-auto max-w-6xl space-y-5 p-4 md:p-6">
        <header>
          <h1 className="text-2xl font-black">จัดชุดยื่นภาษีขาย</h1>
          <p className="text-sm text-slate-600">รวบรวมเฉพาะใบกำกับภาษีและใบลดหนี้ที่ออกเลขจริงจากทะเบียน TaxDocument</p>
        </header>

        <section className="flex flex-wrap items-end gap-3 rounded-2xl border bg-white p-4">
          <label>ปี<input className="ml-2 rounded border px-3 py-2" type="number" value={year} onChange={(event) => setYear(Number(event.target.value))} /></label>
          <label>เดือน<select className="ml-2 rounded border px-3 py-2" value={month} onChange={(event) => setMonth(Number(event.target.value))}>{Array.from({ length: 12 }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}</select></label>
          <button disabled={busy || !branchId} onClick={prepare} className="rounded-xl bg-teal-700 px-4 py-2 font-bold text-white disabled:opacity-50">{busy ? 'กำลังดำเนินการ...' : 'เตรียมชุดยื่น/อัปเดตรายการ'}</button>
        </section>

        {error && <div className="rounded-xl bg-rose-50 p-3 text-rose-800">{error}</div>}

        <section className="space-y-3">
          {batches.map((batch) => (
            <article key={batch.id} className="rounded-2xl border bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <b>{String(batch.month).padStart(2, '0')}/{batch.year}</b>
                  <span className="ml-2 rounded bg-slate-100 px-2 py-1 text-xs">{batch.status}</span>
                  <p className="text-sm text-slate-600">{batch.itemCount} เอกสาร · VAT {money(batch.taxAmount)} บาท · รวม {money(batch.totalAmount)} บาท</p>
                </div>
                <div className="flex gap-2">
                  <button disabled={busy} onClick={prepare} className="rounded border px-3 py-2 disabled:opacity-50">ดู/อัปเดต</button>
                  {batch.status === 'DRAFT' && (
                    <button disabled={busy || Number(batch.itemCount) === 0} onClick={() => setPendingSubmit(batch)} className="rounded bg-blue-700 px-3 py-2 font-bold text-white disabled:opacity-50">ยืนยันชุดยื่น</button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </section>

        {detail?.items && (
          <section className="overflow-x-auto rounded-2xl border bg-white p-4">
            <h2 className="mb-3 text-lg font-black">เอกสารในชุดยื่น</h2>
            <table className="min-w-full text-sm">
              <thead><tr className="bg-slate-50"><th className="p-2 text-left">วันที่</th><th className="p-2 text-left">เลขเอกสาร</th><th className="p-2 text-left">ประเภท</th><th className="p-2 text-right">ฐานภาษี</th><th className="p-2 text-right">VAT</th><th className="p-2 text-right">รวม</th></tr></thead>
              <tbody>{detail.items.map((item) => <tr className="border-t" key={item.id}><td className="p-2">{item.issuedAt ? new Date(item.issuedAt).toLocaleDateString('th-TH') : '-'}</td><td className="p-2">{item.issuedDocumentNumber}</td><td className="p-2">{item.documentType}</td><td className="p-2 text-right">{money(item.subtotalAmount)}</td><td className="p-2 text-right">{money(item.taxAmount)}</td><td className="p-2 text-right">{money(item.totalAmount)}</td></tr>)}</tbody>
            </table>
          </section>
        )}
      </main>

      <ConfirmActionDialog
        open={Boolean(pendingSubmit)}
        title="ยืนยันชุดยื่นภาษีขาย"
        description={`ยืนยันชุดยื่น ${String(pendingSubmit?.month || month).padStart(2, '0')}/${pendingSubmit?.year || year} หรือไม่? หลังยืนยันควรถือข้อมูลชุดนี้เป็นรายการที่ผ่านการตรวจสอบแล้ว`}
        confirmLabel="ยืนยันชุดยื่น"
        intent="primary"
        loading={busy}
        loadingLabel="กำลังยืนยัน..."
        onClose={() => setPendingSubmit(null)}
        onConfirm={confirmSubmit}
      />
    </>
  );
};

export default SalesTaxFilingPage;
