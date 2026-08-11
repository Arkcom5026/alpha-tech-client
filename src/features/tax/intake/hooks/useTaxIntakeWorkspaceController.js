import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useBranchStore } from '@/features/branch/store/branchStore';
import { listTaxPeriods } from '@/features/tax/periods/api/taxPeriodApi';
import {
  getTaxDocumentDetail,
  getTaxIntakeErrorDetails,
  getTaxIntakeErrorMessage,
  listTaxCandidates,
  listTaxDocuments,
  transitionTaxDocument,
  issueOutputTaxDocument,
} from '../api/taxIntakeApi';

const normalizeList = (result, key) => (
  Array.isArray(result?.[key])
    ? result[key]
    : Array.isArray(result)
      ? result
      : []
);

const normalizeQueryFilter = (value) => String(value || '').trim();
const normalizeUpperQueryFilter = (value) => normalizeQueryFilter(value).toUpperCase();

const useTaxIntakeWorkspaceController = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedBranchId = useBranchStore((state) => state.selectedBranchId);
  const currentBranch = useBranchStore((state) => state.currentBranch);
  const ensureSelectedBranchAction = useBranchStore((state) => state.ensureSelectedBranchAction);
  const branchId = Number(selectedBranchId || currentBranch?.id || 0) || null;

  const [candidates, setCandidates] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [taxPeriods, setTaxPeriods] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [periodsLoading, setPeriodsLoading] = useState(false);
  const [error, setError] = useState('');
  const [candidateStatus, setCandidateStatus] = useState('');
  const [taxPeriodId, setTaxPeriodId] = useState(() => normalizeQueryFilter(searchParams.get('taxPeriodId')));
  const [documentStatus, setDocumentStatus] = useState(() => normalizeUpperQueryFilter(searchParams.get('documentStatus')));
  const [documentType, setDocumentType] = useState(() => normalizeUpperQueryFilter(searchParams.get('documentType')));
  const [transitioning, setTransitioning] = useState(false);
  const [transitionError, setTransitionError] = useState(null);

  const updateQueryFilter = useCallback((key, value) => {
    const next = new URLSearchParams(searchParams);
    const normalized = normalizeQueryFilter(value);
    if (normalized) next.set(key, normalized);
    else next.delete(key);
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const handleTaxPeriodChange = useCallback((value) => {
    const normalized = normalizeQueryFilter(value);
    setTaxPeriodId(normalized);
    updateQueryFilter('taxPeriodId', normalized);
  }, [updateQueryFilter]);

  const handleDocumentStatusChange = useCallback((value) => {
    const normalized = normalizeUpperQueryFilter(value);
    setDocumentStatus(normalized);
    updateQueryFilter('documentStatus', normalized);
  }, [updateQueryFilter]);

  const handleDocumentTypeChange = useCallback((value) => {
    const normalized = normalizeUpperQueryFilter(value);
    setDocumentType(normalized);
    updateQueryFilter('documentType', normalized);
  }, [updateQueryFilter]);

  const loadPeriods = useCallback(async () => {
    if (!branchId) return;
    setPeriodsLoading(true);
    try {
      const result = await listTaxPeriods({ branchId });
      setTaxPeriods(normalizeList(result, 'periods'));
    } catch (requestError) {
      toast.error(getTaxIntakeErrorMessage(requestError));
    } finally {
      setPeriodsLoading(false);
    }
  }, [branchId]);

  const loadData = useCallback(async () => {
    if (!branchId) return;

    setLoading(true);
    setError('');

    try {
      const [candidateResult, documentResult] = await Promise.all([
        listTaxCandidates({
          branchId,
          taxPeriodId: taxPeriodId || undefined,
          status: candidateStatus || undefined,
        }),
        listTaxDocuments({
          branchId,
          taxPeriodId: taxPeriodId || undefined,
          status: documentStatus || undefined,
          documentType: documentType || undefined,
        }),
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
  }, [branchId, candidateStatus, documentStatus, documentType, taxPeriodId]);

  useEffect(() => {
    if (!branchId) {
      Promise.resolve(ensureSelectedBranchAction?.()).catch(() => {});
      return;
    }

    loadPeriods();
    loadData();
  }, [branchId, ensureSelectedBranchAction, loadData, loadPeriods]);

  useEffect(() => {
    setSelectedDocument(null);
    setTransitionError(null);
  }, [branchId, documentStatus, documentType, taxPeriodId]);

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

  const handleIssue = useCallback(async (taxInvoiceKind) => {
    if (!branchId || !selectedDocument?.id) return;
    setTransitioning(true); setTransitionError(null);
    try {
      await issueOutputTaxDocument({ branchId, taxDocumentId: selectedDocument.id, taxInvoiceKind });
      setSelectedDocument(await getTaxDocumentDetail({ branchId, taxDocumentId: selectedDocument.id }));
      await loadData();
      toast.success('ออกเลขใบกำกับภาษีเรียบร้อยแล้ว');
    } catch (requestError) {
      const message = getTaxIntakeErrorMessage(requestError);
      setTransitionError({ message, details: getTaxIntakeErrorDetails(requestError) }); toast.error(message);
    } finally { setTransitioning(false); }
  }, [branchId, loadData, selectedDocument?.id]);

  const selectedTaxPeriod = useMemo(
    () => taxPeriods.find((period) => String(period.id) === String(taxPeriodId)) || null,
    [taxPeriodId, taxPeriods],
  );

  const totals = useMemo(() => ({
    candidates: candidates.length,
    documents: documents.length,
  }), [candidates.length, documents.length]);

  return {
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
    handleTransition,
    handleIssue,
  };
};

export default useTaxIntakeWorkspaceController;
