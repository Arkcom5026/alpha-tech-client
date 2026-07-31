import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useBranchStore } from '@/features/branch/store/branchStore';
import {
  getTaxDocumentDetail,
  getTaxIntakeErrorDetails,
  getTaxIntakeErrorMessage,
  listTaxCandidates,
  listTaxDocuments,
  transitionTaxDocument,
} from '../api/taxIntakeApi';

const normalizeList = (result, key) => (
  Array.isArray(result?.[key])
    ? result[key]
    : Array.isArray(result)
      ? result
      : []
);

const useTaxIntakeWorkspaceController = () => {
  const selectedBranchId = useBranchStore((state) => state.selectedBranchId);
  const currentBranch = useBranchStore((state) => state.currentBranch);
  const ensureSelectedBranchAction = useBranchStore((state) => state.ensureSelectedBranchAction);
  const branchId = Number(selectedBranchId || currentBranch?.id || 0) || null;

  const [candidates, setCandidates] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [candidateStatus, setCandidateStatus] = useState('');
  const [documentStatus, setDocumentStatus] = useState('');
  const [transitioning, setTransitioning] = useState(false);
  const [transitionError, setTransitionError] = useState(null);

  const loadData = useCallback(async () => {
    if (!branchId) return;

    setLoading(true);
    setError('');

    try {
      const [candidateResult, documentResult] = await Promise.all([
        listTaxCandidates({ branchId, status: candidateStatus || undefined }),
        listTaxDocuments({ branchId, status: documentStatus || undefined }),
      ]);

      setCandidates(normalizeList(candidateResult, 'candidates'));
      setDocuments(normalizeList(documentResult, 'documents'));
    } catch (requestError) {
      const message = getTaxIntakeErrorMessage(requestError);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [branchId, candidateStatus, documentStatus]);

  useEffect(() => {
    if (!branchId) {
      Promise.resolve(ensureSelectedBranchAction?.()).catch(() => {});
      return;
    }

    loadData();
  }, [branchId, ensureSelectedBranchAction, loadData]);

  useEffect(() => {
    setSelectedDocument(null);
    setTransitionError(null);
  }, [branchId]);

  const openDocument = useCallback(async (document) => {
    if (!branchId || !document?.id) return;

    try {
      const detail = await getTaxDocumentDetail({
        branchId,
        taxDocumentId: document.id,
      });
      setSelectedDocument(detail);
      setTransitionError(null);
    } catch (requestError) {
      toast.error(getTaxIntakeErrorMessage(requestError));
    }
  }, [branchId]);

  const handleTransition = useCallback(async (targetStatus) => {
    if (!branchId || !selectedDocument?.id) return;

    setTransitioning(true);
    setTransitionError(null);

    try {
      await transitionTaxDocument({
        branchId,
        taxDocumentId: selectedDocument.id,
        targetStatus,
      });

      const detail = await getTaxDocumentDetail({
        branchId,
        taxDocumentId: selectedDocument.id,
      });

      setSelectedDocument(detail);
      await loadData();
      toast.success(`เปลี่ยนสถานะเป็น ${targetStatus} แล้ว`);
    } catch (requestError) {
      const message = getTaxIntakeErrorMessage(requestError);
      setTransitionError({
        message,
        details: getTaxIntakeErrorDetails(requestError),
      });
      toast.error(message);
    } finally {
      setTransitioning(false);
    }
  }, [branchId, loadData, selectedDocument?.id]);

  const totals = useMemo(() => ({
    candidates: candidates.length,
    documents: documents.length,
  }), [candidates.length, documents.length]);

  return {
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
  };
};

export default useTaxIntakeWorkspaceController;
