// src/features/documents/components/DocumentToolbar.jsx

const DocumentToolbar = ({
    hideDate,
    onHideDateChange,
    showHideDate = false,
    actions = [],
    note,
    className = '',
  }) => {
    const safeActions = Array.isArray(actions) ? actions.filter(Boolean) : []
  
    if (!showHideDate && safeActions.length === 0 && !note) {
      return null
    }
  
    return (
      <div className={`print:hidden w-full max-w-[794px] mx-auto px-4 pt-4 pb-3 ${className}`}>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {showHideDate ? (
            <label className="inline-flex items-center gap-2 rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={Boolean(hideDate)}
                onChange={(e) => onHideDateChange?.(e.target.checked)}
                className="h-4 w-4"
              />
              <span>ไม่แสดงวันที่ในเอกสาร</span>
            </label>
          ) : null}
  
          {safeActions.map((action, index) => {
            const variant = action.variant || 'primary'
  
            const classNameByVariant = {
              primary: 'bg-blue-600 text-white hover:bg-blue-700',
              secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50',
              muted: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
              danger: 'bg-red-600 text-white hover:bg-red-700',
            }
  
            return (
              <button
                key={action.key || action.label || index}
                type="button"
                onClick={action.onClick}
                disabled={Boolean(action.disabled)}
                className={`rounded px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60 ${
                  classNameByVariant[variant] || classNameByVariant.primary
                }`}
              >
                {action.label}
              </button>
            )
          })}
  
          {note ? (
            <span className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
              {note}
            </span>
          ) : null}
        </div>
      </div>
    )
  }
  
  export default DocumentToolbar
  