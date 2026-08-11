import React, { useMemo } from 'react';
import { TriangleAlert } from 'lucide-react';
import InputTaxReceiptCandidateTable from '../components/InputTaxReceiptCandidateTable';
import InputTaxReceiptFilters from '../components/InputTaxReceiptFilters';
import InputTaxDocumentLinkPanel from '../components/InputTaxDocumentLinkPanel';
import InputTaxAllocationSummary from '../components/InputTaxAllocationSummary';
import InputTaxReceiptWorkspaceHeader from '../components/InputTaxReceiptWorkspaceHeader';
import InputTaxDocumentSelectionPanel from '../components/InputTaxDocumentSelectionPanel';
import InputTaxDocumentCreationForm from '../components/InputTaxDocumentCreationForm';
import InputTaxReceiptWorkspaceSummary from '../components/InputTaxReceiptWorkspaceSummary';
import useInputTaxReceiptCreateLinkController from '../hooks/useInputTaxReceiptCreateLinkController';

const InputTaxReceiptWorkspacePage = () => {
  const controller = useInputTaxReceiptCreateLinkController();

  const activeLinkCount = useMemo(() => controller.links.filter((link) => (
    String(link.status || '').toUpperCase() !== 'CANCELLED'
  )).length, [controller.links]);

  if (!controller.branchId) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
        <div className="flex items-center gap-3">
          <TriangleAlert />
          <span className="font-bold">กรุณาเลือกสาขาก่อนเปิดหน้าติดตามเอกสารภาษีซื้อ</span>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <InputTaxReceiptWorkspaceHeader
        loading={controller.loading}
        onRefresh={controller.refreshWorkspace}
      />

      <InputTaxReceiptWorkspaceSummary
        receiptCount={controller.receipts.length}
        selectedCount={controller.selectedReceipts.length}
        activeLinkCount={activeLinkCount}
        selectedReceipts={controller.selectedReceipts}
      />

      <InputTaxReceiptFilters
        filters={controller.filters}
        suppliers={controller.suppliers}
        loading={controller.loading}
        onChange={controller.changeFilter}
        onSearch={controller.loadReceipts}
        onReset={controller.resetFilters}
      />

      <InputTaxReceiptCandidateTable
        receipts={controller.receipts}
        selected={controller.selected}
        selectedSupplierId={controller.selectedSupplierId}
        loading={controller.loading}
        onToggle={controller.toggleReceipt}
        onAllocationChange={controller.changeAllocation}
      />

      <InputTaxDocumentSelectionPanel
        eligibleDocuments={controller.eligibleDocuments}
        selectedDocumentId={controller.selectedDocumentId}
        selectedDocument={controller.selectedDocument}
        selectedSupplierId={controller.selectedSupplierId}
        selectedReceiptCount={controller.selectedReceipts.length}
        showCreateDocument={controller.showCreateDocument}
        allocationOverflow={controller.allocationProjection?.overflow}
        linksLoading={controller.linksLoading}
        submitting={controller.submitting}
        onDocumentChange={controller.selectExistingDocument}
        onToggleCreateDocument={controller.toggleCreateDocument}
        onAttachSelected={controller.attachSelected}
      />

      {controller.showCreateDocument && (
        <InputTaxDocumentCreationForm
          supplierName={controller.selectedSupplier?.supplierName || ''}
          selectedReceiptCount={controller.selectedReceipts.length}
          invoice={controller.invoice}
          submitting={controller.submitting}
          onInvoiceChange={controller.changeInvoice}
          onSubmit={controller.createAndAutoLinkInputTaxDocument}
        />
      )}

      {controller.selectedDocument && (
        <InputTaxAllocationSummary projection={controller.allocationProjection} />
      )}

      {controller.selectedDocumentId && (
        <InputTaxDocumentLinkPanel
          links={controller.links}
          busyLinkId={controller.busyLinkId}
          readOnly={!controller.selectedDocumentMutable}
          onReallocate={controller.reallocate}
          onCancel={controller.cancelLink}
        />
      )}
    </section>
  );
};

export default InputTaxReceiptWorkspacePage;
