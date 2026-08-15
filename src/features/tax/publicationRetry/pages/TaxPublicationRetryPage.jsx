import { useCallback, useEffect, useState } from 'react';
import { feedback } from '@/design-system/feedback';
import apiClient from '@/utils/apiClient';

const TaxPublicationRetryPage = () => {
  const [gaps, setGaps] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const response = await apiClient.get('/tax/publication/gaps');
    setGaps(response.data?.data?.gaps || []);
  }, []);

  useEffect(() => {
    load().catch((requestError) => setError(
      requestError?.response?.data?.error?.message || requestError?.response?.data?.message || requestError?.message,
    ));
  }, [load]);

  const retry = async (saleId) => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await apiClient.post(`/tax/publication/retry-sale/${saleId}`);
      feedback.actionSuccess('ส่งรายการขายเข้าทะเบียนภาษีเรียบร้อยแล้ว', `tax-publication-retry:${saleId}:success`);
      await load();
    } catch (requestError) {
      const message = requestError?.response?.data?.error?.message || requestError?.response?.data?.message || requestError?.message;
      setError(message);
      feedback.actionError(requestError, 'ส่งรายการขายเข้าทะเบียนภาษีไม่สำเร็จ', `tax-publication-retry:${saleId}:error`);
    } finally {
      setBusy(false);
    }
  };

  const retryAll = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await apiClient.post('/tax/publication/retry-all', { limit: 500 });
      feedback.actionSuccess('ส่งรายการขายตกหล่นเข้าทะเบียนภาษีเรียบร้อยแล้ว', 'tax-publication-retry:all:success');
      await load();
    } catch (requestError) {
      const message = requestError?.response?.data?.error?.message || requestError?.response?.data?.message || requestError?.message;
      setError(message);
      feedback.actionError(requestError, 'ส่งรายการขายตกหล่นเข้าทะเบียนภาษีไม่สำเร็จ', 'tax-publication-retry:all:error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto max-w-6xl space-y-5 p-4 md:p-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black">ตรวจรายการขายตกหล่นจากทะเบียนภาษี</h1>
          <p className="text-sm text-slate-600">แสดง Sale ที่ชำระครบแต่ยังไม่มี Tax Candidate/TaxDocument</p>
        </div>
        <button disabled={busy || !gaps.length} onClick={retryAll} className="rounded-xl bg-teal-700 px-4 py-2 font-bold text-white disabled:opacity-50">ส่งเข้าทะเบียนทั้งหมด</button>
      </header>
      {error && <div className="rounded-xl bg-rose-50 p-3 text-rose-800">{error}</div>}
      <section className="overflow-x-auto rounded-2xl border bg-white">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-50"><th className="p-3 text-left">เลข Sale</th><th className="p-3 text-left">ลูกค้า</th><th className="p-3 text-right">ยอด</th><th className="p-3">ดำเนินการ</th></tr>
          </thead>
          <tbody>
            {gaps.map((sale) => (
              <tr className="border-t" key={sale.id}>
                <td className="p-3">{sale.code}</td>
                <td className="p-3">{sale.customer?.companyName || sale.customer?.name || '-'}</td>
                <td className="p-3 text-right">{Number(sale.totalAmount).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                <td className="p-3 text-center"><button disabled={busy} onClick={() => retry(sale.id)} className="rounded border px-3 py-2">ส่งเข้าทะเบียน</button></td>
              </tr>
            ))}
            {!gaps.length && <tr><td colSpan="4" className="p-8 text-center text-emerald-700">ไม่พบรายการตกหล่น</td></tr>}
          </tbody>
        </table>
      </section>
    </main>
  );
};

export default TaxPublicationRetryPage;
