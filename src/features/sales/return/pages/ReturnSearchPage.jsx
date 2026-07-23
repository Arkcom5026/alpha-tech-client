import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getReturnableSales } from '../api/saleReturnApi';

const ReturnSearchPage = () => {
  const navigate = useNavigate();
  const { shopSlug = 'advancetech' } = useParams();
  const [sales, setSales] = useState([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      setSales(await getReturnableSales());
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return sales;
    return sales.filter((sale) => [
      sale.code, sale.customer?.name, sale.customer?.companyName, sale.customer?.phone,
    ].some((value) => String(value || '').toLowerCase().includes(needle)));
  }, [query, sales]);

  return (
    <main className="p-6 space-y-5">
      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-black">คืนสินค้า</h1>
            <p className="mt-1 text-sm text-slate-500">ค้นหาใบขายเดิม แล้วเลือกรายการและจำนวนที่ต้องการคืน</p>
          </div>
          <button type="button" className="rounded-xl border px-4 py-2 font-bold" onClick={load}>โหลดใหม่</button>
        </div>
        <input
          className="mt-4 w-full rounded-xl border px-4 py-3"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="เลขที่ใบขาย ชื่อลูกค้า หรือเบอร์โทร"
        />
      </section>
      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">{error}</div>}
      <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr><th className="p-3">เลขที่</th><th>ลูกค้า</th><th>วันที่ขาย</th><th className="text-right">ยอดสุทธิ</th><th /></tr>
          </thead>
          <tbody>
            {filtered.map((sale) => (
              <tr key={sale.id} className="border-t">
                <td className="p-3 font-semibold">{sale.code}</td>
                <td>{sale.customer?.companyName || sale.customer?.name || 'ลูกค้าทั่วไป'}</td>
                <td>{new Date(sale.soldAt).toLocaleString('th-TH')}</td>
                <td className="text-right">{Number(sale.totalAmount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿</td>
                <td className="p-3 text-right">
                  <button
                    className="rounded-lg bg-orange-500 px-4 py-2 font-bold text-white"
                    onClick={() => navigate(`/${shopSlug}/pos/sales/sale-return/create/${sale.id}`)}
                  >เลือกรายการคืน</button>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr><td colSpan={5} className="p-8 text-center text-slate-500">ไม่พบใบขายที่ค้นหา</td></tr>
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
};

export default ReturnSearchPage;
