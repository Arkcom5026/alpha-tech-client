// src/features/bill/components/BillDocumentLineEditor.jsx

const BillDocumentLineEditor = ({
    item,
    editableDocumentLines = false,
    editingLineKey = null,
    lineDrafts = {},
    savingLineKey = null,
    onToggleDocumentLineEdit,
    onChangeDocumentLineDraft,
    onSaveDocumentLine,
  }) => {
    if (!editableDocumentLines || !item) return null
  
    const lineKey = item?.documentLineKey || item?.id || null
    if (!lineKey) return null
  
    const isEditing = editingLineKey === lineKey
    const isSaving = savingLineKey === lineKey
    const hasDocumentLine = Boolean(item?.hasDocumentLine)
  
    const draft = {
      documentPrefix: item?.documentPrefix || '',
      documentDescriptionRaw: item?.documentDescriptionRaw || '',
      documentSuffix: item?.documentSuffix || '',
      ...(lineDrafts?.[lineKey] || {}),
    }
  
    const readonlyDescription =
      item?.documentDescription ||
      item?.productName ||
      item?.documentDescriptionRaw ||
      '-'
  
    return (
      <>
        <button
          type="button"
          onClick={() => onToggleDocumentLineEdit?.(item)}
          title={hasDocumentLine ? 'รายการนี้มีข้อความเอกสารแล้ว' : 'เพิ่มข้อความเอกสาร'}
          aria-label={hasDocumentLine ? 'รายการนี้มีข้อความเอกสารแล้ว' : 'เพิ่มข้อความเอกสาร'}
          className={`print:hidden inline-flex h-5 w-5 items-center justify-center rounded border text-[11px] leading-none ${
            isEditing || hasDocumentLine
              ? 'border-teal-500 bg-teal-50 text-teal-700'
              : 'border-slate-300 bg-white text-slate-500 hover:bg-slate-50'
          }`}
        >
          {hasDocumentLine ? '✓' : '☑'}
        </button>
  
        {isEditing ? (
          <div className="print:hidden mt-2 rounded border border-slate-200 bg-slate-50 p-2">
            <div className="space-y-1">
              <input
                value={draft.documentPrefix}
                onChange={(e) => onChangeDocumentLineDraft?.(item, 'documentPrefix', e.target.value)}
                placeholder="ข้อความก่อนสินค้า"
                className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
  
              <div className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700">
                {readonlyDescription}
              </div>
  
              <input
                value={draft.documentSuffix}
                onChange={(e) => onChangeDocumentLineDraft?.(item, 'documentSuffix', e.target.value)}
                placeholder="ข้อความท้ายสินค้า"
                className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
  
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => onSaveDocumentLine?.(item)}
                  disabled={isSaving}
                  className="rounded bg-teal-600 px-3 py-1 text-xs text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </>
    )
  }
  
  export default BillDocumentLineEditor