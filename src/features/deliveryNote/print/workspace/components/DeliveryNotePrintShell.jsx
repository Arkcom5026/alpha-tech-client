import React from 'react';
import DeliveryNoteForm from '../../../components/DeliveryNoteForm';

const DeliveryNotePrintShell = ({
  sale,
  hideDate,
  setHideDate,
  saleItems,
  config,
  editingLineKey,
  lineDrafts,
  savingLineKey,
  onToggleDocumentLineEdit,
  onChangeDocumentLineDraft,
  onSaveDocumentLine,
  editableDocumentLines = true,
}) => (
  <main className="min-h-screen bg-slate-100 px-3 py-5 text-black print:bg-white print:p-0 md:px-6 md:py-8">
    <section className="mx-auto max-w-[210mm] rounded-2xl bg-white p-3 shadow-sm print:rounded-none print:p-0 print:shadow-none md:p-5">
      <DeliveryNoteForm
        sale={sale}
        hideDate={hideDate}
        setHideDate={setHideDate}
        saleItems={saleItems}
        config={config}
        editableDocumentLines={editableDocumentLines}
        editingLineKey={editingLineKey}
        lineDrafts={lineDrafts}
        savingLineKey={savingLineKey}
        onToggleDocumentLineEdit={onToggleDocumentLineEdit}
        onChangeDocumentLineDraft={onChangeDocumentLineDraft}
        onSaveDocumentLine={onSaveDocumentLine}
      />
    </section>
  </main>
);

export default DeliveryNotePrintShell;
