import React from 'react';
import { AlertTriangle } from 'lucide-react';
import TaxIntakeWorkspaceHeader from '../components/TaxIntakeWorkspaceHeader';
import TaxIntakeWorkspaceSummary from '../components/TaxIntakeWorkspaceSummary';
import TaxIntakeCandidateList from '../components/TaxIntakeCandidateList';
import TaxIntakeDocumentList from '../components/TaxIntakeDocumentList';
import TaxIntakeDocumentDetailPanel from '../components/TaxIntakeDocumentDetailPanel';
import useTaxIntakeWorkspaceController from '../hooks/useTaxIntakeWorkspaceController';

const TaxIntakeWorkspacePage = () => {
  const {
    branchId,
    currentBranch,
    candidates,
    documents,
    selectedDocument,
    loading,
    error,
    candidateStatus,
    documentStatus,
    transitioning,
    transitionError,
    totals,
    setCandidateStatus,
    setDocumentStatus,
    loadData,
    openDocument,
    handleTransition,
  } = useTaxIntakeWorkspaceController();

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
          onTransition={handleTransition}
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
          selectedDocumentId={selectedDocument?.id || null}
          onStatusChange={setDocumentStatus}
          onOpenDocument={openDocument}
        />
      </div>
    </section>
  );
};

export default TaxIntakeWorkspacePage;
