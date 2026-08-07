const ReadyToSellResultsTable = ({ rows, loading, highlightId, onCopyCode }) => (
  <section className="rounded-2xl border bg-white overflow-hidden dark:border-zinc-800 dark:bg-zinc-900">
    <div className="max-h-[70vh] overflow-auto">
      <table className="min-w-full text-sm">
        <thead className="sticky top-0 z-10 bg-gray-50 border-b dark:border-zinc-800 dark:bg-zinc-950">
          <tr className="text-left text-gray-600 dark:text-zinc-300">
            <th className="px-4 py-3 whitespace-nowrap">SN / Barcode</th>
            <th className="px-4 py-3 whitespace-nowrap">สถานะ</th>
            <th className="px-4 py-3 whitespace-nowrap">รับเข้า</th>
          </tr>
        </thead>
        <tbody className="divide-y dark:divide-zinc-800">
          {!loading && rows.length === 0 ? (
            <tr>
              <td className="px-4 py-10 text-center text-gray-500 dark:text-zinc-400" colSpan={3}>
                ไม่พบรายการ SN ในสาขานี้
              </td>
            </tr>
          ) : (
            rows.map((item, index) => {
              const code = item?.serialNumber ?? item?.barcode ?? item?.code ?? '-';
              const status = (item?.status ?? 'IN_STOCK').toString();
              const receivedAt = item?.receivedAt ? new Date(item.receivedAt).toLocaleString('th-TH') : '-';
              const key = item?.id ?? `${code}-${index}`;
              const highlighted = highlightId != null && item?.id === highlightId;

              return (
                <tr
                  id={`sn-row-${item?.id ?? ''}`}
                  key={key}
                  className={`hover:bg-gray-50 dark:hover:bg-zinc-950/60 ${highlighted ? 'bg-amber-50 ring-1 ring-amber-200 dark:bg-amber-950/20' : ''}`}
                >
                  <td className="px-4 py-3 whitespace-nowrap font-mono">
                    <div className="flex items-center gap-2">
                      <span>{code}</span>
                      {code && code !== '-' && (
                        <button
                          type="button"
                          title="คัดลอกบาร์โค้ด"
                          className="min-h-9 rounded border bg-gray-50 px-2 text-xs hover:bg-gray-100 dark:border-zinc-700 dark:bg-zinc-950"
                          onClick={() => onCopyCode(code)}
                        >
                          Copy
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs border bg-gray-50 border-gray-200 text-gray-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
                      {status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{receivedAt}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  </section>
);

export default ReadyToSellResultsTable;
