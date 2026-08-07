const SummaryCell = ({ label, children }) => (
  <div className="rounded-xl border border-zinc-200/70 bg-zinc-50 px-4 py-3 text-sm dark:border-zinc-800/70 dark:bg-zinc-950/40">
    <div className="text-zinc-500">{label}</div>
    <div className="mt-1 font-medium text-zinc-900 dark:text-white break-words">{children}</div>
  </div>
);

const ReadyToSellProductSummary = ({ productName, meta, total, oldestReceivedAt, latestReceivedAt }) => (
  <section className="rounded-2xl border border-zinc-200/80 bg-white dark:border-zinc-800/80 dark:bg-zinc-900">
    <div className="p-4 sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-lg font-semibold text-zinc-900 dark:text-white">{productName}</div>
          <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {meta.brandName} • {meta.categoryName} • {meta.productTypeName}
          </div>
        </div>

        <div className="sm:text-right">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">จำนวนพร้อมขาย</div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-white">{total.toLocaleString('th-TH')}</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCell label="SKU/รหัสสินค้า">{meta.sku}</SummaryCell>
        <SummaryCell label="รุ่น">{meta.model}</SummaryCell>
        <SummaryCell label="ราคาขาย">
          {meta.sellPrice == null ? '-' : meta.sellPrice.toLocaleString('th-TH')}
        </SummaryCell>
        <SummaryCell label="รับเข้า (ช่วง)">{oldestReceivedAt} → {latestReceivedAt}</SummaryCell>
      </div>
    </div>
  </section>
);

export default ReadyToSellProductSummary;
