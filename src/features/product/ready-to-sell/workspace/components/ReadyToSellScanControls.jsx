const ReadyToSellScanControls = ({
  searchText,
  setSearchText,
  scanMode,
  scanText,
  setScanText,
  scanInputRef,
  sortMode,
  total,
  canOperate,
  onScanEnter,
  onToggleScanMode,
  onToggleSortMode,
}) => (
  <section className="rounded-xl border border-zinc-200/80 bg-white/85 backdrop-blur dark:border-zinc-800/80 dark:bg-zinc-900/80">
    <div className="p-3 sm:p-4 flex flex-col gap-3">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <div className="w-full xl:flex-1 xl:min-w-[360px]">
          <input
            type="search"
            placeholder="ค้นหา (SN / Barcode)"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="border px-3 py-2 rounded w-full min-h-11"
            disabled={!canOperate}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={`btn btn-outline min-h-11 ${scanMode ? 'ring-1 ring-blue-200' : ''}`}
            onClick={onToggleScanMode}
            disabled={!canOperate}
          >
            {scanMode ? 'โหมดสแกน: เปิด' : 'โหมดสแกน: ปิด'}
          </button>

          <button
            type="button"
            className="btn btn-outline min-h-11"
            onClick={onToggleSortMode}
            disabled={!canOperate}
            title="สลับการเรียงลำดับ"
          >
            {sortMode === 'FIFO' ? 'FIFO (เก่าก่อน)' : 'ใหม่ก่อน'}
          </button>
        </div>

        <div className="lg:ml-auto text-sm text-zinc-600 dark:text-zinc-400">
          พบ <span className="font-medium">{total.toLocaleString('th-TH')}</span> ชิ้น
        </div>
      </div>

      {scanMode && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="w-full sm:max-w-[520px]">
            <input
              ref={scanInputRef}
              type="text"
              placeholder="สแกน SN/Barcode แล้วกด Enter"
              value={scanText}
              onChange={(e) => setScanText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onScanEnter();
                }
              }}
              className="border px-3 py-2 rounded w-full min-h-11 font-mono"
              disabled={!canOperate}
            />
          </div>

          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            สแกนแล้วระบบจะเลื่อนไปยังรายการและไฮไลต์แถวให้
          </div>
        </div>
      )}
    </div>
  </section>
);

export default ReadyToSellScanControls;
