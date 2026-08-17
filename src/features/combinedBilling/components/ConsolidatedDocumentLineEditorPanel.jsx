import React from 'react';

const lineKeyOf = (item) => item?.documentLineKey || item?.id || null;

const ConsolidatedDocumentLineEditorPanel = ({
  items = [],
  editor,
  enabled = false,
}) => {
  if (!enabled || !editor || !Array.isArray(items) || items.length === 0) return null;

  return (
    <section className="print:hidden mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-800">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">แก้ไขคำอธิบายรายการเอกสาร</h2>
          <p className="mt-1 text-xs text-slate-500">
            การแก้ไขนี้มีผลเฉพาะข้อความที่แสดงในเอกสารรวม ไม่เปลี่ยนจำนวน ราคา VAT หรือยอดรวม
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {items.map((item, index) => {
          const lineKey = lineKeyOf(item);
          if (!lineKey) return null;

          const isEditing = editor.editingLineKey === lineKey;
          const isSaving = editor.savingLineKey === lineKey;
          const draft = {
            documentDescriptionRaw: item?.documentDescriptionRaw || '',
            ...(editor.lineDrafts?.[lineKey] || {}),
          };

          return (
            <div key={lineKey} className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-medium text-slate-400">รายการ {index + 1}</div>
                  {isEditing ? (
                    <textarea
                      rows={2}
                      value={draft.documentDescriptionRaw}
                      onChange={(event) => editor.actions.change(
                        item,
                        'documentDescriptionRaw',
                        event.target.value
                      )}
                      disabled={isSaving}
                      className="mt-1 w-full resize-y rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:opacity-60"
                    />
                  ) : (
                    <div className="mt-1 whitespace-pre-wrap text-sm">
                      {item?.documentDescription || item?.documentDescriptionRaw || item?.productName || '-'}
                    </div>
                  )}
                </div>

                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => editor.actions.toggle(item)}
                    disabled={isSaving}
                    className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isEditing ? 'ยกเลิก' : 'แก้ไข'}
                  </button>
                  {isEditing ? (
                    <button
                      type="button"
                      onClick={() => editor.actions.save(item)}
                      disabled={isSaving}
                      className="rounded-md bg-teal-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ConsolidatedDocumentLineEditorPanel;
