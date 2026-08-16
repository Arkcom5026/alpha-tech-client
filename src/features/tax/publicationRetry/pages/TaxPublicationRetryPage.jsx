import { useCallback, useEffect, useRef, useState } from 'react';
import { feedback } from '@/design-system/feedback';
import apiClient from '@/utils/apiClient';

const errorMessage = (requestError) => (
  requestError?.response?.data?.error?.message
  || requestError?.response?.data?.message
  || requestError?.message
  || 'เกิดข้อผิดพลาดระหว่างดำเนินการ'
);

const TaxPublicationRetryPage = () => {
  const [gaps, setGaps] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const mutationRef = useRef(false);

  const load = useCallback(async ({ reportError = true } = {}) => {
    try {
      const response = await apiClient.get('/tax/publication/gaps');
      const nextGaps = response.data?.data?.gaps || [];
      setGaps(nextGaps);
      return { ok: true, gaps: nextGaps };
    } catch (requestError) {
      const message = errorMessage(requestError);
      setError(message);
      if (reportError) {
        feedback.actionError(requestError, 'โหลดรายการขายตกหล่นไม่สำเร็จ', 'tax-publication-retry:load:error');
      }
      return { ok: false, error: requestError, message };
    }
  }, []);

  useEffect(() => {
    load({ reportError: false });
  }, [load]);

  const retry = async (saleId) => {
    if (busy || mutationRef.current) return false;

    const saleIdSnapshot = Number(saleId);
    mutationRef.current = true;
    setBusy(true);
    setError('');
    try {
      await apiClient.post(`/tax/publication/retry-sale/${saleIdSnapshot}`);
      feedback.actionSuccess('ส่งรายการขายเข้าทะเบียนภาษีเรียบร้อยแล้ว', `tax-publication-retry:${saleIdSnapshot}:success`);

      const refresh = await load({ reportError: false });
      if (!refresh.ok) {
        feedback.actionError(
          refresh.error,
          'ส่งรายการขายเข้าทะเบียนภาษีสำเร็จแล้ว แต่รีเฟรชรายการตกหล่นล่าสุดไม่สำเร็จ',
          `tax-publication-retry:${saleIdSnapshot}:refresh:error`,
        );
      }
      return true;
    } catch (requestError) {
      setError(errorMessage(requestError));
      feedback.actionError(requestError, 'ส่งรายการขายเข้าทะเบียนภาษีไม่สำเร็จ', `tax-publication-retry:${saleIdSnapshot}:error`);
      return false;
    } finally {
      mutationRef.current = false;
      setBusy(false);
    }
  };

  const retryAll = async () => {
    if (busy || mutationRef.current) return false;

    const command = { limit: 500 };
    mutationRef.current = true;
    setBusy(true);
    setError('');
    try {
      await apiClient.post('/tax/publication/retry-all', command);
      feedback.actionSuccess('ส่งรายการขายตกหล่นเข้าทะเบียนภาษีเรียบร้อยแล้ว', 'tax-publication-retry:all:success');

      const refresh = await load({ reportError: false });
      if (!refresh.ok) {
        feedback.actionError(
          refresh.error,
          'ส่งรายการขายตกหล่นเข้าทะเบียนภาษีสำเร็จแล้ว แต่รีเฟรชรายการตกหล่นล่าสุดไม่สำเร็จ',
          'tax-publication-retry:all:refresh:error',
        );
      }
      return true;
    } catch (requestError) {
      setError(errorMessage(requestError));
      feedback.actionError(requestError, 'ส่งรายการขายตกหล่นเข้าทะเบียนภาษีไม่สำเร็จ', 'tax-publication-retry:all:error');
      return false;
    } finally {
      mutationRef.current = false;
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
        <button disabled={busy || !gaps.length} onClick={retryAll} className="rounded-xl bg-teal-700 px-4 py-2 font-bold text-white disabled:opacity-50">{busy ? 'กำลังดำเนินการ...' : 'ส่งเข้าทะเบียนทั้งหมด'}</button>
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
                <td className="p-3 text-center"><button disabled={busy} onClick={() => retry(sale.id)} className="rounded border px-3 py-2">{busy ? 'กำลังดำเนินการ...' : 'ส่งเข้าทะเบียน'}</button></td>
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
