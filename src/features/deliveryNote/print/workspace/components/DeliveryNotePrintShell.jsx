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
  <main className="a4-standard-delivery-shell min-h-screen bg-slate-100 px-3 py-5 text-black print:bg-white print:p-0 md:px-6 md:py-8">
    <section className="a4-standard-delivery-frame mx-auto max-w-[210mm] rounded-2xl bg-white p-3 shadow-sm print:rounded-none print:p-0 print:shadow-none md:p-5">
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
      <style>{`
        .a4-standard-delivery-frame .dn-print-page {
          font-family: var(--document-font-family) !important;
          border-radius: 2.5mm !important;
        }
        @media print {
          @page { size: A4; margin: 4mm !important; }
          .a4-standard-delivery-shell,
          .a4-standard-delivery-frame {
            width: auto !important;
            max-width: none !important;
            min-height: 0 !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            box-shadow: none !important;
            overflow: visible !important;
          }
          body .a4-standard-delivery-frame .dn-print-page {
            box-sizing: border-box !important;
            width: 201mm !important;
            height: 288mm !important;
            min-height: 288mm !important;
            margin: 0 auto !important;
            padding: 5mm !important;
            border: 0.3mm solid #444 !important;
            border-radius: 2.5mm !important;
            overflow: hidden !important;
            font-family: var(--document-font-family) !important;
          }
        }
      `}</style>
    </section>
  </main>
);

export default DeliveryNotePrintShell;
