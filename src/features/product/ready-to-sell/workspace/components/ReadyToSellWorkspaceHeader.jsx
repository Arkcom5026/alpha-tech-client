const ReadyToSellWorkspaceHeader = ({
  productName,
  productId,
  pathname,
  loading,
  canOperate,
  onBack,
  onRefresh,
}) => (
  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
    <div>
      <h1 className="text-xl font-semibold text-zinc-800 dark:text-white">รายละเอียดสินค้าแบบ SN</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        {productName} (productId: {productId ?? '-'})
      </p>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">URL: {pathname}</p>
    </div>

    <div className="flex flex-wrap items-center gap-2">
      <button type="button" className="btn btn-outline min-h-11" onClick={onBack} disabled={loading}>
        กลับ
      </button>
      <button type="button" className="btn btn-outline min-h-11" onClick={onRefresh} disabled={loading || !canOperate}>
        รีเฟรช
      </button>
    </div>
  </div>
);

export default ReadyToSellWorkspaceHeader;
