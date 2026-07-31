const QuickReceiptActions = ({
  receipt,
  isBusy = false,
  locked = false,
  hasLines = false,
  onCancelDraft,
  onAddCurrentLine,
  onSaveForLater,
  onFinalize,
}) => (
  <div className="flex flex-wrap justify-end gap-2">
    {receipt?.status === 'DRAFT' && (
      <button
        type="button"
        className="rounded-lg border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 disabled:opacity-50"
        disabled={isBusy}
        onClick={onCancelDraft}
      >
        ยกเลิกใบรับนี้
      </button>
    )}
    <button
      type="button"
      className="rounded-lg border px-4 py-2 text-sm font-semibold disabled:opacity-50"
      disabled={isBusy || locked}
      onClick={onAddCurrentLine}
    >
      เพิ่มสินค้าปัจจุบันในรายการ
    </button>
    <button
      type="button"
      className="rounded-lg border border-indigo-300 px-4 py-2 text-sm font-semibold text-indigo-700 disabled:opacity-50"
      disabled={isBusy || !hasLines || locked}
      onClick={onSaveForLater}
    >
      เก็บไว้รับต่อภายหลัง
    </button>
    <button
      type="button"
      className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      disabled={isBusy || !hasLines || locked}
      onClick={onFinalize}
    >
      ยืนยันรับสินค้าครบแล้ว
    </button>
  </div>
);

export default QuickReceiptActions;
