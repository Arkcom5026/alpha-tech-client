const QuickReceiptLineSummary = ({
  lines = [],
  totalQuantity = 0,
  locked = false,
  isBusy = false,
  onRemoveLocalLine,
  onRemoveServerLine,
}) => {
  if (!lines.length) return null;

  return (
    <div className="rounded-lg border border-slate-200 p-3 text-sm">
      <div className="flex flex-wrap justify-between gap-2 font-medium">
        <span>สินค้า {lines.length} ประเภท</span>
        <span>รวม {totalQuantity} ชิ้น</span>
      </div>
      {lines.map((item) => (
        <div
          key={item.id || item.localId}
          className="mt-2 flex items-center justify-between gap-3 border-t pt-2 text-slate-700"
        >
          <span>{item.productName}</span>
          <div className="flex items-center gap-2">
            <span>{item.quantity} ชิ้น</span>
            {!locked && item.localId && (
              <button
                type="button"
                className="text-rose-600"
                onClick={() => onRemoveLocalLine(item.localId)}
              >
                ลบ
              </button>
            )}
            {!locked && item.id && (
              <button
                type="button"
                className="text-rose-600"
                disabled={isBusy}
                onClick={() => onRemoveServerLine(item.id)}
              >
                ลบ
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuickReceiptLineSummary;
