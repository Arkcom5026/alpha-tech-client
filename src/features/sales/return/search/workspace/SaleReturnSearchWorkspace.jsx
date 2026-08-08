const SaleReturnSearchWorkspace = ({
  query,
  onQueryChange,
  sales,
  error,
  helpLabel,
  onSelectSale,
  onOpenHelp,
}) => (
  <main className="p-6 space-y-5">
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-black">คืนสินค้า</h1>
          <p className="mt-1 text-sm text-slate-500">ค้นหาใบขายเดิม แล้วเลือกรายการและจำนวนที่ต้องการคืน</p>
        </div>
        <button
          type="button"
          className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-2 font-bold text-orange-700"
          onClick={onOpenHelp}
        >
          {helpLabel}
        </button>
      </div>
      <input
        className="mt-4 w-full rounded-xl border px-4 py-3"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="เลขที่ใบขาย ชื่อลูกค้า หรือเบอร์โทร"
      />
    </section>

    {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">{error}</div>}

    <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left">
          <tr>
            <th className="p-3">เลขที่</th>
            <th>ลูกค้า</th>
            <th>วันที่ขาย</th>
            <th className="text-right">ยอดสุทธิ</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => (
            <tr key={sale.id} className="border-t">
              <td className="p-3 font-semibold">{sale.code}</td>
              <td>{sale.customer?.companyName || sale.customer?.name || 'ลูกค้าทั่วไป'}</td>
              <td>{new Date(sale.soldAt).toLocaleString('th-TH')}</td>
              <td className="text-right">
                {Number(sale.totalAmount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿
              </td>
              <td className="p-3 text-right">
                <button
                  className="rounded-lg bg-orange-500 px-4 py-2 font-bold text-white"
                  onClick={() => onSelectSale(sale)}
                >
                  เลือกรายการคืน
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  </main>
);

export default SaleReturnSearchWorkspace;
