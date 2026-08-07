import React from 'react'
import CustomerReceiptPrintLayout from '../../../components/CustomerReceiptPrintLayout'
import CustomerReceiptShortPrintLayout from '../../../components/CustomerReceiptShortPrintLayout'

const CustomerReceiptPrintShell = ({ receipt, printMode = 'FULL', printRootRef }) => (
  <>
    <style>{`
      .customer-receipt-print-root {
        font-family: 'THSarabunNew', 'TH Sarabun New', 'Sarabun', system-ui, sans-serif;
      }

      @page {
        size: ${printMode === 'SHORT' ? '80mm auto' : 'A4'};
        margin: ${printMode === 'SHORT' ? '0' : '10mm'};
      }

      @media print {
        html,
        body,
        #root {
          width: ${printMode === 'SHORT' ? '80mm' : 'auto'} !important;
          height: ${printMode === 'SHORT' ? 'var(--customer-receipt-short-height, auto)' : 'auto'} !important;
          min-height: ${printMode === 'SHORT' ? 'var(--customer-receipt-short-height, 0)' : '0'} !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: visible !important;
          background: #fff !important;
        }

        body * {
          visibility: hidden !important;
        }

        .customer-receipt-print-root,
        .customer-receipt-print-root * {
          visibility: visible !important;
        }

        .customer-receipt-print-root {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          display: block !important;
          width: ${printMode === 'SHORT' ? '80mm' : '100%'} !important;
          max-width: ${printMode === 'SHORT' ? '80mm' : 'none'} !important;
          height: auto !important;
          min-height: 0 !important;
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

    <div
      className={`w-full bg-white text-black dark:bg-white dark:text-black ${
        printMode === 'SHORT'
          ? 'px-4 py-6 print:m-0 print:h-auto print:min-h-0 print:w-auto print:p-0'
          : 'px-4 py-8 print:p-0'
      }`}
    >
      <div
        ref={printRootRef}
        className={`customer-receipt-print-root mx-auto bg-white text-black dark:bg-white dark:text-black ${
          printMode === 'SHORT'
            ? 'w-[80mm] max-w-[80mm] rounded-xl border border-zinc-200 shadow-sm print:border-none print:shadow-none'
            : 'max-w-[210mm] rounded-2xl border border-zinc-200 shadow-sm print:border-none print:shadow-none'
        }`}
      >
        {printMode === 'SHORT' ? (
          <CustomerReceiptShortPrintLayout receipt={receipt} />
        ) : (
          <CustomerReceiptPrintLayout receipt={receipt} />
        )}
      </div>
    </div>
  </>
)

export default CustomerReceiptPrintShell
