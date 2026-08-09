import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useSaleReturnStore from '@/features/saleReturn/store/saleReturnStore';

const ReturnSearchPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const { returnableSales, loadReturnableSalesAction } = useSaleReturnStore();

  useEffect(() => {
    if (returnableSales.length === 0) {
      loadReturnableSalesAction();
    }
  }, []);

  const filteredSales = returnableSales.filter((sale) => {
    const query = search.toLowerCase();
    const matchSearch =
      !search ||
      (sale.code?.toLowerCase().includes(query) ?? false) ||
      (sale.customer?.companyName?.toLowerCase().includes(query) ?? false) ||
      (sale.customer?.name?.toLowerCase().includes(query) ?? false) ||
      (sale.customer?.phone?.includes(query) ?? false);

    const soldDate = new Date(sale.soldAt);
    const matchDate = (!fromDate || new Date(fromDate) <= soldDate) &&
                      (!toDate || soldDate <= new Date(toDate));

    return matchSearch && matchDate;
  });

  const fieldClass = 'rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100';

  return (
    <main className="space-y-5 bg-slate-50 p-4 md:p-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">Sale Return</p>
        <h1 className="mt-1 text-xl font-black text-slate-950">ค้นหาเพื่อคืนสินค้า</h1>
        <p className="mt-1 text-sm text-slate-500">ค้นหาใบขายจากเลขที่เอกสาร ลูกค้า หรือช่วงวันที่ก่อนเริ่มทำรายการคืน</p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาเลขที่ใบขาย, ชื่อลูกค้า, เบอร์โทร..."
            className={`${fieldClass} min-w-0 flex-1 md:max-w-sm`}
          />
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className={fieldClass}
          />
          <span className="text-sm font-semibold text-slate-500">ถึง</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className={fieldClass}
          />
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-3 py-3 text-left font-bold">เลขที่</th>
                <th className="px-3 py-3 text-left font-bold">หน่วยงาน</th>
                <th className="px-3 py-3 text-left font-bold">ลูกค้า</th>
                <th className="px-3 py-3 text-left font-bold">เบอร์โทร</th>
                <th className="px-3 py-3 text-right font-bold">ยอดรวม</th>
                <th className="px-3 py-3 text-left font-bold">วันที่ขาย</th>
                <th className="px-3 py-3 text-center font-bold">คืนสินค้า</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.length > 0 ? (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="transition hover:bg-emerald-50/40">
                    <td className="px-3 py-3 font-semibold text-slate-900">{sale.code || '-'}</td>
                    <td className="px-3 py-3 text-slate-700">{sale.customer?.companyName || '-'}</td>
                    <td className="px-3 py-3 text-slate-700">{sale.customer?.name || '-'}</td>
                    <td className="px-3 py-3 text-slate-600">{sale.customer?.phone || '-'}</td>
                    <td className="px-3 py-3 text-right font-semibold text-slate-900">
                      {sale.totalAmount?.toLocaleString('th-TH', { minimumFractionDigits: 2 }) || '0.00'}
                    </td>
                    <td className="px-3 py-3 text-slate-600">
                      {new Date(sale.soldAt).toLocaleString('th-TH', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => navigate(`/pos/sales/sale-return/create/${sale.id}`)}
                        className="rounded-xl bg-emerald-600 px-3 py-2 font-bold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                      >
                        คืนสินค้า
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">ไม่พบข้อมูล</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
};

export default ReturnSearchPage;
