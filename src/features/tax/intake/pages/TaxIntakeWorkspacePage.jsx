import React, { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import TaxIntakeWorkspaceHeader from '../components/TaxIntakeWorkspaceHeader';
import TaxIntakeWorkspaceSummary from '../components/TaxIntakeWorkspaceSummary';
import TaxIntakeCandidateList from '../components/TaxIntakeCandidateList';
import TaxIntakeDocumentList from '../components/TaxIntakeDocumentList';
import TaxIntakeDocumentDetailPanel from '../components/TaxIntakeDocumentDetailPanel';
import TaxIntakePeriodFilterBar from '../components/TaxIntakePeriodFilterBar';
import useTaxIntakeWorkspaceController from '../hooks/useTaxIntakeWorkspaceController';

const TaxIntakeWorkspacePage = () => {
  const [searchParams] = useSearchParams();
  const focusedDocumentRef = useRef(null);
  const {
    branchId,
    currentBranch,
    candidates,
    documents,
    taxPeriods,
    taxPeriodId,
    selectedTaxPeriod,
    selectedDocument,
    loading,
    periodsLoading,
    error,
    candidateStatus,
    documentStatus,
    documentType,
    transitioning,
    transitionError,
    totals,
    setCandidateStatus,
    handleTaxPeriodChange,
    handleDocumentStatusChange,
    handleDocumentTypeChange,
    loadData,
    openDocument,
    handleRefreshRecipient,
    handleTransition,
    handleIssue,
  } = useTaxIntakeWorkspaceController();

  const focusedTaxDocumentId = Number(searchParams.get('taxDocumentId') || 0) || null;

  useEffect(() => {
    if (!branchId || loading || !focusedTaxDocumentId) return;
    if (Number(selectedDocument?.id) === focusedTaxDocumentId) {
      focusedDocumentRef.current = `${branchId}:${focusedTaxDocumentId}`;
      return;
    }

    const focusKey = `${branchId}:${focusedTaxDocumentId}`;
    if (focusedDocumentRef.current === focusKey) return;
    const document = documents.find((item) => Number(item?.id) === focusedTaxDocumentId);
    if (!document) return;

    focusedDocumentRef.current = focusKey;
    openDocument(document);
  }, [branchId, documents, focusedTaxDocumentId, loading, openDocument, selectedDocument?.id]);

  if (!branchId) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
        <div className="flex items-center gap-3">
          <AlertTriangle />
          <span className="font-bold">กรุณาเลือกสาขาก่อนเปิดพื้นที่รับเอกสารภาษี</span>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <TaxIntakeWorkspaceHeader
        branchLabel={currentBranch?.name || branchId}
        loading={loading}
        onRefresh={loadData}
      />

      <TaxIntakeWorkspaceSummary
        candidateCount={totals.candidates}
        documentCount={totals.documents}
      />

      <TaxIntakePeriodFilterBar
        taxPeriods={taxPeriods}
        taxPeriodId={taxPeriodId}
        selectedTaxPeriod={selectedTaxPeriod}
        loading={periodsLoading}
        onChange={handleTaxPeriodChange}
      />

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

      {selectedDocument && (
        <TaxIntakeDocumentDetailPanel
          document={selectedDocument}
          transitioning={transitioning}
          transitionError={transitionError}
          onRefreshRecipient={handleRefreshRecipient}
          onTransition={handleTransition}
          onIssue={handleIssue}
        />
      )}

      <div className="grid gap-5 xl:grid-cols-2">
        <TaxIntakeCandidateList
          candidates={candidates}
          loading={loading}
          status={candidateStatus}
          onStatusChange={setCandidateStatus}
        />

        <TaxIntakeDocumentList
          documents={documents}
          loading={loading}
          status={documentStatus}
          documentType={documentType}
          selectedDocumentId={selectedDocument?.id || null}
          onStatusChange={handleDocumentStatusChange}
          onDocumentTypeChange={handleDocumentTypeChange}
          onOpenDocument={openDocument}
        />
      </div>
    </section>
  );
};

export default TaxIntakeWorkspacePage;
