import BillLayoutShortTax from '@/features/bill/components/BillLayoutShortTax'

const BillShortTaxPrintShell = ({
  sale,
  saleItems,
  payment,
  config,
  hideContactName,
  printRootRef,
  documentLineEditor,
}) => (
  <>
    <style>{`
      .bill-print-root {
        font-family: 'THSarabunNew', 'TH Sarabun New', 'Sarabun', system-ui, sans-serif;
      }

      @page {
        size: 80mm auto;
        margin: 0;
      }

      @media print {
        html,
        body,
        #root {
          width: 80mm !important;
          height: var(--short-tax-receipt-height, auto) !important;
          min-height: var(--short-tax-receipt-height, 0) !important;
          max-height: var(--short-tax-receipt-height, none) !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: visible !important;
          background: #fff !important;
        }

        html,
        body {
          position: relative !important;
        }

        body * {
          visibility: hidden !important;
        }

        .bill-print-root,
        .bill-print-root * {
          visibility: visible !important;
        }

        .bill-print-root {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          display: block !important;
          width: 80mm !important;
          max-width: 80mm !important;
          height: auto !important;
          min-height: 0 !important;
          max-height: none !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: visible !important;
          border: 0 !important;
          border-radius: 0 !important;
          box-shadow: none !important;
          background: #fff !important;
        }
      }
    `}</style>

    <div className="w-full bg-white text-black dark:bg-white dark:text-black py-6 px-4 print:w-auto print:p-0 print:m-0 print:min-h-0 print:h-auto print:bg-white">
      <div
        ref={printRootRef}
        className="bill-print-root mx-auto w-[80mm] max-w-[80mm] bg-white text-black dark:bg-white dark:text-black p-4 rounded-xl border border-zinc-200 shadow-sm print:p-0 print:border-none print:shadow-none"
      >
        <BillLayoutShortTax
          sale={sale}
          saleItems={saleItems}
          payments={[payment]}
          config={{ ...config, hideDate: false }}
          hideContactName={hideContactName}
          editableDocumentLines
          editingLineKey={documentLineEditor.editingLineKey}
          lineDrafts={documentLineEditor.lineDrafts}
          savingLineKey={documentLineEditor.savingLineKey}
          onToggleDocumentLineEdit={documentLineEditor.actions.toggle}
          onChangeDocumentLineDraft={documentLineEditor.actions.change}
          onSaveDocumentLine={documentLineEditor.actions.save}
        />
      </div>
    </div>
  </>
)

export default BillShortTaxPrintShell
