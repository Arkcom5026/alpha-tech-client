const QuickReceiptDraftPicker = ({
  drafts = [],
  search,
  onSearchChange,
  onResumeDraft,
}) => {
  if (!drafts.length) return null;

  return (
    <div className="rounded-lg border border-slate-200 p-3 space-y-2">
      <p className="text-sm font-medium text-slate-700">รายการที่ยังรับไม่ครบ</p>
      <input
        className="w-full rounded-lg border px-3 py-2 text-sm"
        placeholder="ค้นหาจาก Supplier หรือเลขที่ใบส่งของ"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        {drafts.slice(0, 20).map((draft) => (
          <button
            key={draft.id}
            type="button"
            className="rounded-lg border px-3 py-2 text-left text-sm hover:bg-slate-50"
            onClick={() => onResumeDraft(draft)}
          >
            {draft.supplierName || `Supplier #${draft.supplierId}`} · {draft.deliveryNoteNumber}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickReceiptDraftPicker;
