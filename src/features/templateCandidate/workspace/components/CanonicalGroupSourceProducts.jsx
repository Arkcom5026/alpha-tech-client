const CanonicalGroupSourceProducts = ({ sourceProducts = [] }) => (
  <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
    <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
      <h2 className="text-lg font-black text-slate-900">Source Products</h2>
      <p className="mt-1 text-sm font-semibold text-slate-500">สินค้าจริงของแต่ละร้านที่ระบบจัดอยู่ใน Canonical Group นี้</p>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-white text-[11px] font-black uppercase tracking-[0.1em] text-slate-500">
          <tr><th className="px-5 py-3">Product</th><th className="px-5 py-3">Store</th><th className="px-5 py-3">Product Type</th><th className="px-5 py-3">Brand</th><th className="px-5 py-3">Unit</th></tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {sourceProducts.map((product) => (
            <tr key={product.id}>
              <td className="px-5 py-4"><p className="font-black text-slate-900">{product.name || '-'}</p><p className="mt-1 text-xs font-semibold text-slate-400">Product #{product.id}</p></td>
              <td className="px-5 py-4"><p className="font-bold text-slate-700">{product.branchName || '-'}</p><p className="mt-1 text-xs text-slate-400">Branch #{product.branchId || '-'}</p></td>
              <td className="px-5 py-4 font-bold text-slate-600">{product.productTypeName || '-'}</td>
              <td className="px-5 py-4 font-bold text-slate-600">{product.brandName || '-'}</td>
              <td className="px-5 py-4 font-bold text-slate-600">{product.unitName || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);

export default CanonicalGroupSourceProducts;
