import { getCustomerDisplayName } from '@/features/customer/utils/customerDisplayName';

const SaleReturnSearchWorkspace = ({
  query,
  onQueryChange,
  sales,
  error,
  helpLabel,
  onSelectSale,
  onOpenHelp,
}) => (
  <main className="space-y-5 bg-slate-50 p-4 md:p-6">
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">Sale Return</p>
          <h1 className="mt-1 text-xl font-black text-slate-950">คืนสินค้า</h1>
          <p className="mt-1 text-sm text-slate-500">ค้นหาใบขายเดิม แล้วเลือกรายการและจำนวนที่ต้องการคืน</p>
        </div>
        <button
          type="button"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 font-bold text-emerald-700 transition hover:bg-emerald-100 focus:outline-none focus:ring-4 focus:ring-emerald-100"
          onClick={onOpenHelp}
        >
          {helpLabel}
        </button>
      </div>
      <input
        className="mt-4 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="เลขที่ใบขาย ชื่อลูกค้า หรือเบอร์โทร"
      />
    </section>

    {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">{error}</div>}

    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="p-3 font-bold">เลขที่</th>
              <th className="font-bold">ลูกค้า</th>
              <th className="font-bold">วันที่ขาย</th>
              <th className="text-right font-bold">ยอดสุทธิ</th>
              <th />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sales.map((sale) => (
              <tr key={sale.id} className="transition hover:bg-emerald-50/40">
                <td className="p-3 font-semibold text-slate-900">{sale.code}</td>
                <td className="text-slate-700">{getCustomerDisplayName(sale.customer, 'ลูกค้าทั่วไป')}</td>
                <td className="text-slate-600">{new Date(sale.soldAt).toLocaleString('th-TH')}</td>
                <td className="text-right font-semibold text-slate-900">
                  {Number(sale.totalAmount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿
                </td>
                <td className="p-3 text-right">
                  <button
                    type="button"
                    className="rounded-xl bg-emerald-600 px-4 py-2 font-bold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                    onClick={() => onSelectSale(sale)}
                  >
                    เลือกรายการคืน
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  </main>
);

export default SaleReturnSearchWorkspace;
